import { Hono } from "hono";
import { buildSystemPrompt } from "../prompt.js";
import { getScenario } from "../scenarios.js";
import { chat, speechToText, textToSpeech, toMessages } from "../sarvam.js";
import type { ChatTurn, ConverseResponse, Profile } from "../types.js";

// In-memory conversation store keyed by sessionId.
// Phase 2 swaps this for Supabase so history survives restarts.
const sessions = new Map<string, ChatTurn[]>();

export const converse = new Hono();

/**
 * POST /api/converse  (multipart/form-data)
 *   - audio:   the recorded utterance (file)
 *   - profile: JSON-stringified Profile
 *   - sessionId: string (stable per conversation)
 *   - text:    optional — text fallback instead of audio (noisy/low-bandwidth)
 *
 * Returns ConverseResponse: { userText, replyText, audioBase64, mascotState }.
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
    const history = sessions.get(sessionId) ?? [];

    // 1. Decide what the student "said".
    //    - opening turn: no input; we seed a hidden kickoff so the tutor speaks first.
    //    - otherwise: from STT, or the text fallback.
    let userText = "";
    if (opening) {
      const kickoff =
        scenario?.kickoff ??
        "Greet the student warmly by name and ask what they would like to talk about today.";
      history.push({ role: "user", content: `(${kickoff})` });
    } else {
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
      history.push({ role: "user", content: userText });
    }

    // 2. LLM reply with personalized + scenario-aware system prompt + history.
    const messages = toMessages(buildSystemPrompt(profile, scenario), history);
    const replyText = await chat(messages);
    history.push({ role: "assistant", content: replyText });
    sessions.set(sessionId, history);

    // 3. Speak the reply.
    const audioBase64 = await textToSpeech(replyText, language);

    const payload: ConverseResponse = {
      userText,
      replyText,
      audioBase64,
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
  sessions.delete(c.req.param("sessionId"));
  return c.json({ ok: true });
});
