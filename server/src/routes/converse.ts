import { Hono } from "hono";
import { getScenario } from "../scenarios.js";
import { speechToText } from "../sarvam.js";
import { clearSession, runTutorTurn } from "../tutor.js";
import type { ConverseResponse, Profile } from "../types.js";

export const converse = new Hono();

/**
 * POST /api/converse  (multipart/form-data)
 *   - audio:   the recorded utterance (file)
 *   - profile: JSON-stringified Profile
 *   - sessionId: string (stable per conversation)
 *   - text:    optional — text fallback instead of audio (noisy/low-bandwidth)
 *   - opening: optional "true" — tutor speaks first, no student input
 *   - scenarioId: optional active lesson
 *
 * Returns ConverseResponse: { userText, replyText, audioBase64, mascotState }.
 *
 * This is the turn-based path (record → upload → STT → LLM → TTS). The streaming
 * path (/api/stream) does the same tutor turn but with live STT over WebSocket;
 * both share runTutorTurn() so history and behaviour stay identical.
 */
converse.post("/", async (c) => {
  let body: FormData;
  try {
    body = await c.req.formData();
  } catch {
    return c.json({ error: "Expected multipart/form-data" }, 400);
  }

  const sessionId = String(body.get("sessionId") || "");
  if (!sessionId) return c.json({ error: "sessionId is required" }, 400);

  let profile: Profile;
  try {
    profile = JSON.parse(String(body.get("profile") || "{}"));
  } catch {
    return c.json({ error: "profile must be valid JSON" }, 400);
  }
  const language = profile.language || "en-IN";
  const scenario = getScenario(String(body.get("scenarioId") || "") || undefined);
  const opening = String(body.get("opening") || "") === "true";

  try {
    // Decide what the student "said": opening turn (none), text fallback, or STT.
    let userText: string | undefined;
    if (!opening) {
      userText = String(body.get("text") || "").trim();
      if (!userText) {
        const audio = body.get("audio");
        if (!(audio instanceof File)) {
          return c.json({ error: "Provide either 'audio' file or 'text'" }, 400);
        }
        const buf = Buffer.from(await audio.arrayBuffer());
        userText = await speechToText(buf, audio.name || "speech.wav", language);
      }
      if (!userText) {
        return c.json({ error: "Could not hear anything. Please try again." }, 422);
      }
    }

    const turn = await runTutorTurn({ sessionId, profile, scenario, userText, opening });

    const payload: ConverseResponse = {
      userText: turn.userText,
      replyText: turn.replyText,
      audioBase64: turn.audioBase64,
      mascotState: "speaking",
    };
    return c.json(payload);
  } catch (err) {
    console.error("[converse] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 502);
  }
});

// Lets the app start a fresh conversation (e.g. "clear history" in Settings).
converse.delete("/:sessionId", (c) => {
  clearSession(c.req.param("sessionId"));
  return c.json({ ok: true });
});
