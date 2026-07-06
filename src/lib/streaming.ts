import { useAudioRecorder } from "@siteed/audio-studio";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { WS_URL } from "./config";
import type { MascotState, Profile } from "./types";

// Client for the real-time voice bridge (server /api/stream).
//
// Flow per utterance (push-to-talk):
//   startTurn() → capture 16 kHz mono PCM16 via @siteed/audio-studio, forwarding
//   each base64 chunk up the WebSocket. The server relays live transcript
//   segments back (onPartial). endTurn() stops the mic and commits; the server
//   finalizes STT, runs the tutor turn, and streams back reply text + audio.
//
// The Sarvam key never touches the device — this socket points at OUR server.

export interface StreamHandlers {
  onReady?: () => void;
  onPartial?: (text: string) => void; // live caption, revised as the student speaks
  onFinal?: (text: string) => void; // committed student utterance
  onReply?: (text: string) => void; // tutor reply text
  onAudio?: (base64Wav: string) => void; // tutor reply audio (base64 WAV)
  onState?: (state: MascotState) => void;
  onError?: (message: string) => void;
}

export interface StreamInit {
  sessionId: string;
  profile: Profile;
  scenarioId?: string;
  opening?: boolean;
}

const RECORDING_CONFIG = {
  sampleRate: 16000 as const,
  channels: 1 as const,
  encoding: "pcm_16bit" as const,
  interval: 100, // ms per emitted chunk
};

export function useStreamingSession(handlers: StreamHandlers) {
  const recorder = useAudioRecorder();

  // Keep handlers in a ref so the long-lived socket always calls the latest ones.
  const hRef = useRef(handlers);
  useEffect(() => {
    hRef.current = handlers;
  }, [handlers]);

  const wsRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef(false);

  const connect = useCallback((init: StreamInit): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Reuse any live socket.
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "init", ...init }));
          resolve();
          return;
        }

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "init", ...init }));
          resolve();
        };
        ws.onerror = () => {
          const msg = "Lost connection to the tutor. Check the server is running.";
          hRef.current.onError?.(msg);
          reject(new Error(msg));
        };
        ws.onclose = () => {
          if (wsRef.current === ws) wsRef.current = null;
        };
        ws.onmessage = (ev) => dispatch(String(ev.data), hRef.current);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Could not connect"));
      }
    });
  }, []);

  const startTurn = useCallback(async (): Promise<void> => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected. Try again.");
    }
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      throw new Error(
        "Microphone permission is needed to practise speaking. Please allow it in Settings.",
      );
    }
    recordingRef.current = true;
    await recorder.startRecording({
      ...RECORDING_CONFIG,
      onAudioStream: async (e) => {
        // Native delivers base64 PCM; forward it as it arrives.
        if (typeof e.data !== "string") return;
        const sock = wsRef.current;
        if (sock && sock.readyState === WebSocket.OPEN) {
          sock.send(JSON.stringify({ type: "audio", data: e.data }));
        }
      },
    });
  }, [recorder]);

  const endTurn = useCallback(async (): Promise<void> => {
    if (recordingRef.current) {
      recordingRef.current = false;
      try {
        await recorder.stopRecording();
      } catch {
        // recorder may already be stopped
      }
    }
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "commit" }));
    }
  }, [recorder]);

  const disconnect = useCallback(() => {
    if (recordingRef.current) {
      recordingRef.current = false;
      recorder.stopRecording().catch(() => undefined);
    }
    const ws = wsRef.current;
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "bye" }));
        ws.close();
      } catch {
        // already closing
      }
      wsRef.current = null;
    }
  }, [recorder]);

  // Tear down on unmount so a backgrounded screen doesn't leak the socket/mic.
  useEffect(() => disconnect, [disconnect]);

  return { connect, startTurn, endTurn, disconnect };
}

function dispatch(raw: string, h: StreamHandlers): void {
  let msg: {
    type?: string;
    text?: string;
    data?: string;
    state?: MascotState;
    message?: string;
  };
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  switch (msg.type) {
    case "ready":
      h.onReady?.();
      break;
    case "partial":
      if (msg.text != null) h.onPartial?.(msg.text);
      break;
    case "final":
      if (msg.text != null) h.onFinal?.(msg.text);
      break;
    case "reply":
      if (msg.text != null) h.onReply?.(msg.text);
      break;
    case "audio":
      if (msg.data) h.onAudio?.(msg.data);
      break;
    case "state":
      if (msg.state) h.onState?.(msg.state);
      break;
    case "error":
      h.onError?.(msg.message || "Streaming error");
      break;
  }
}
