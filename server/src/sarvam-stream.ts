import WebSocket from "ws";
import type { LanguageCode } from "./types.js";

// Client for Sarvam's real-time speech-to-text WebSocket.
// Docs: https://docs.sarvam.ai/api-reference-docs/speech-to-text/transcribe/ws
//
// Auth is an HTTP header on the upgrade request (Api-Subscription-Key) — which is
// exactly why the device cannot talk to Sarvam directly and this must live in the
// proxy. We stream 16 kHz mono PCM16 (base64) up and get transcript segments back.
//
// VERIFY-LIVE: Sarvam emits a transcript per detected utterance (VAD-driven),
// not word-by-word partials, and the per-message `encoding` value below is not
// firmly documented for raw-PCM input. Both are called out in the code and must
// be confirmed against a live key. They are isolated here so a fix is one line.

const STT_WS_BASE = "wss://api.sarvam.ai/speech-to-text/ws";
const STT_STREAM_MODEL = () => process.env.SARVAM_STT_STREAM_MODEL || "saaras:v3";
// The `audio.encoding` field Sarvam expects alongside input_audio_codec=pcm_s16le.
// Reference impls send "audio/wav"; override if the live endpoint wants otherwise.
const STT_AUDIO_ENCODING = () => process.env.SARVAM_STT_AUDIO_ENCODING || "audio/wav";
const SAMPLE_RATE = "16000";

export interface SarvamSttHandlers {
  /** A transcript segment arrived (may be revised/extended by later segments). */
  onTranscript: (text: string) => void;
  /** Sarvam VAD detected the student stopped speaking (needs vad_signals=true). */
  onSpeechEnd?: () => void;
  /** Sarvam VAD detected the student started speaking. */
  onSpeechStart?: () => void;
  onError: (message: string) => void;
  onClose?: () => void;
}

/**
 * Opens one Sarvam STT streaming session. Resolves once the socket is open and
 * ready to receive audio; rejects if the connection fails to open.
 */
export function openSarvamStt(
  language: LanguageCode,
  handlers: SarvamSttHandlers,
): Promise<SarvamSttSession> {
  const key = process.env.SARVAM_API_KEY;
  if (!key) {
    return Promise.reject(
      new Error(
        "SARVAM_API_KEY is not set. Copy server/.env.example to server/.env and add your key.",
      ),
    );
  }

  const url =
    `${STT_WS_BASE}?model=${encodeURIComponent(STT_STREAM_MODEL())}` +
    `&language-code=${encodeURIComponent(language)}` +
    `&mode=transcribe&sample_rate=${SAMPLE_RATE}` +
    `&input_audio_codec=pcm_s16le&vad_signals=true`;

  const ws = new WebSocket(url, {
    headers: { "api-subscription-key": key },
  });

  return new Promise<SarvamSttSession>((resolve, reject) => {
    let opened = false;

    ws.on("open", () => {
      opened = true;
      resolve(new SarvamSttSession(ws));
    });

    ws.on("message", (raw: WebSocket.RawData) => {
      let msg: SarvamInbound;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return; // ignore non-JSON frames
      }
      switch (msg.type) {
        case "data": {
          const text = msg.data?.transcript?.trim();
          if (text) handlers.onTranscript(text);
          break;
        }
        case "events": {
          const signal = msg.data?.signal_type;
          if (signal === "END_SPEECH") handlers.onSpeechEnd?.();
          else if (signal === "START_SPEECH") handlers.onSpeechStart?.();
          break;
        }
        case "error": {
          handlers.onError(msg.data?.error || "Sarvam STT error");
          break;
        }
      }
    });

    ws.on("error", (err: Error) => {
      if (!opened) reject(err);
      else handlers.onError(err.message);
    });

    ws.on("close", () => handlers.onClose?.());
  });
}

/** Thin handle over an open Sarvam STT socket. */
export class SarvamSttSession {
  constructor(private readonly ws: WebSocket) {}

  /** Forward a base64-encoded PCM16 mono @16 kHz chunk to Sarvam. */
  sendAudio(base64Pcm: string): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        audio: {
          data: base64Pcm,
          sample_rate: SAMPLE_RATE,
          encoding: STT_AUDIO_ENCODING(),
        },
      }),
    );
  }

  /** Force Sarvam to emit any buffered transcript now (used on push-to-talk release). */
  flush(): void {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: "flush" }));
  }

  close(): void {
    try {
      this.ws.close();
    } catch {
      // already closing
    }
  }
}

// --- Inbound message shape (only the fields we read). Kept as one loose
// interface rather than a discriminated union so unknown `type` values don't
// break narrowing. ---
interface SarvamInbound {
  type?: string;
  data?: {
    transcript?: string;
    language_code?: string;
    signal_type?: "START_SPEECH" | "END_SPEECH";
    error?: string;
    code?: string;
  };
}
