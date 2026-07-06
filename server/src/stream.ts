import type { Server } from "node:http";
import { WebSocketServer, type WebSocket as WsSocket } from "ws";
import { getScenario, type Scenario } from "./scenarios.js";
import { openSarvamStt, type SarvamSttSession } from "./sarvam-stream.js";
import { runTutorTurn } from "./tutor.js";
import type { LanguageCode, Profile } from "./types.js";

// Real-time voice bridge. The device streams mic PCM up this socket; we relay it
// to Sarvam's STT WebSocket, push live transcript segments back down, and — when
// the student finishes an utterance — run the same tutor turn as the REST path
// (LLM + TTS) and stream the reply text + audio back.
//
//   device ──PCM──▶ /api/stream ──▶ Sarvam STT ──transcript──▶ device
//                        └────────── LLM + TTS ──reply+audio──▶ device
//
// One Sarvam STT connection is opened per utterance and closed on commit, so we
// never hit Sarvam's idle-timeout and each utterance starts with a clean slate.

const STREAM_PATH = "/api/stream";
// After the student releases the mic we flush Sarvam and wait briefly for the
// final transcript segment before running the tutor turn.
const FLUSH_GRACE_MS = 450;

type ClientMessage =
  | { type: "init"; sessionId: string; profile: Profile; scenarioId?: string; opening?: boolean }
  | { type: "audio"; data: string }
  | { type: "commit" }
  | { type: "bye" };

export function setupStreaming(server: Server): void {
  const wss = new WebSocketServer({ server, path: STREAM_PATH });
  wss.on("connection", (ws) => new Bridge(ws));
  console.log(`  ↳ streaming voice bridge on ws://…${STREAM_PATH}`);
}

class Bridge {
  private ctx: {
    sessionId: string;
    profile: Profile;
    scenario?: Scenario;
    language: LanguageCode;
  } | null = null;

  private stt: SarvamSttSession | null = null;
  private sttOpening: Promise<void> | null = null;
  private pending: string[] = []; // audio chunks buffered while STT is opening
  private transcript = ""; // accumulated segments for the current utterance
  private committing = false;
  private closed = false;

  constructor(private readonly ws: WsSocket) {
    ws.on("message", (raw) => this.onMessage(raw.toString()));
    ws.on("close", () => this.dispose());
    ws.on("error", () => this.dispose());
  }

  private send(msg: Record<string, unknown>): void {
    if (this.ws.readyState === this.ws.OPEN) this.ws.send(JSON.stringify(msg));
  }

  private async onMessage(raw: string): Promise<void> {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    try {
      switch (msg.type) {
        case "init":
          await this.handleInit(msg);
          break;
        case "audio":
          this.handleAudio(msg.data);
          break;
        case "commit":
          await this.handleCommit();
          break;
        case "bye":
          this.dispose();
          break;
      }
    } catch (err) {
      this.fail(err);
    }
  }

  private async handleInit(
    msg: Extract<ClientMessage, { type: "init" }>,
  ): Promise<void> {
    if (!msg.sessionId || !msg.profile) {
      this.send({ type: "error", message: "init requires sessionId and profile" });
      return;
    }
    this.ctx = {
      sessionId: msg.sessionId,
      profile: msg.profile,
      scenario: getScenario(msg.scenarioId),
      language: msg.profile.language || "en-IN",
    };
    this.send({ type: "ready" });

    // Opening turn: the tutor speaks first, no student audio involved.
    if (msg.opening) {
      this.send({ type: "state", state: "thinking" });
      const turn = await runTutorTurn({
        sessionId: this.ctx.sessionId,
        profile: this.ctx.profile,
        scenario: this.ctx.scenario,
        opening: true,
      });
      this.send({ type: "reply", text: turn.replyText });
      this.send({ type: "audio", data: turn.audioBase64, mime: "audio/wav" });
      this.send({ type: "state", state: "speaking" });
    }
  }

  private handleAudio(base64: string): void {
    if (!this.ctx || !base64) return;
    const stt = this.stt;
    if (stt) {
      stt.sendAudio(base64);
      return;
    }
    // Buffer until the Sarvam socket is open, opening it on the first chunk.
    this.pending.push(base64);
    if (!this.sttOpening) this.openStt();
  }

  private openStt(): void {
    if (!this.ctx) return;
    this.send({ type: "state", state: "listening" });
    // This promise resolves even on failure (errors are reported via fail()), so
    // awaiting it in handleCommit() never produces an unhandled rejection.
    const opening = openSarvamStt(this.ctx.language, {
      onTranscript: (text) => this.onTranscript(text),
      onSpeechEnd: () => this.send({ type: "speechEnd" }),
      onError: (m) => this.fail(new Error(m)),
    })
      .then((session) => {
        this.stt = session;
        // Drain anything captured while the socket was opening.
        for (const chunk of this.pending) session.sendAudio(chunk);
        this.pending = [];
      })
      .catch((err) => this.fail(err))
      .finally(() => {
        if (this.sttOpening === opening) this.sttOpening = null;
      });
    this.sttOpening = opening;
  }

  private onTranscript(segment: string): void {
    // Sarvam emits per-utterance segments; accumulate into the live caption.
    this.transcript = this.transcript ? `${this.transcript} ${segment}` : segment;
    this.send({ type: "partial", text: this.transcript });
  }

  private async handleCommit(): Promise<void> {
    if (!this.ctx || this.committing) return;
    this.committing = true;
    try {
      // Make sure a still-opening STT socket has finished before we flush.
      if (this.sttOpening) await this.sttOpening.catch(() => undefined);
      this.stt?.flush();
      // Give Sarvam a moment to return the final segment after flush.
      await delay(FLUSH_GRACE_MS);

      const said = this.transcript.trim();
      this.closeStt();
      this.transcript = "";

      if (!said) {
        this.send({ type: "error", message: "Could not hear anything. Please try again." });
        this.send({ type: "state", state: "idle" });
        return;
      }

      this.send({ type: "final", text: said });
      this.send({ type: "state", state: "thinking" });

      const turn = await runTutorTurn({
        sessionId: this.ctx.sessionId,
        profile: this.ctx.profile,
        scenario: this.ctx.scenario,
        userText: said,
      });
      this.send({ type: "reply", text: turn.replyText });
      this.send({ type: "audio", data: turn.audioBase64, mime: "audio/wav" });
      this.send({ type: "state", state: "speaking" });
    } finally {
      this.committing = false;
    }
  }

  private fail(err: unknown): void {
    const message = err instanceof Error ? err.message : "Streaming error";
    console.error("[stream] error:", message);
    this.send({ type: "error", message });
    this.send({ type: "state", state: "idle" });
    this.closeStt();
    this.transcript = "";
  }

  private closeStt(): void {
    this.stt?.close();
    this.stt = null;
    this.sttOpening = null;
    this.pending = [];
  }

  private dispose(): void {
    if (this.closed) return;
    this.closed = true;
    this.closeStt();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
