import type { ChatTurn, LanguageCode } from "./types.js";

// Thin client for the three Sarvam AI endpoints we use.
// Docs: https://docs.sarvam.ai  —  endpoint shapes verified June 2026; if Sarvam
// changes a field name, this file is the only place to update.
//
// Auth: Sarvam's speech endpoints use the `api-subscription-key` header.
// The OpenAI-compatible chat endpoint accepts the same key as a Bearer token.

const BASE = "https://api.sarvam.ai";

function apiKey(): string {
  const key = process.env.SARVAM_API_KEY;
  if (!key) {
    throw new Error(
      "SARVAM_API_KEY is not set. Copy server/.env.example to server/.env and add your key.",
    );
  }
  return key;
}

const STT_MODEL = () => process.env.SARVAM_STT_MODEL || "saaras:v2.5";
const TTS_MODEL = () => process.env.SARVAM_TTS_MODEL || "bulbul:v2";
const LLM_MODEL = () => process.env.SARVAM_LLM_MODEL || "sarvam-m";
const TTS_SPEAKER = () => process.env.SARVAM_TTS_SPEAKER || "anushka";

/**
 * Speech-to-Text. Sends the recorded utterance, returns the transcript.
 * `audio` is the raw recording bytes; `filename` carries the extension so
 * Sarvam can detect the container (wav/m4a/mp3).
 */
export async function speechToText(
  audio: Buffer,
  filename: string,
  language: LanguageCode,
): Promise<string> {
  const form = new FormData();
  const blob = new Blob([audio]);
  form.append("file", blob, filename);
  form.append("model", STT_MODEL());
  form.append("language_code", language);

  const res = await fetch(`${BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": apiKey() },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Sarvam STT ${res.status}: ${await safeBody(res)}`);
  }
  const data = (await res.json()) as { transcript?: string };
  return (data.transcript ?? "").trim();
}

/**
 * Chat completion (Sarvam-M). OpenAI-compatible shape.
 * `messages` already includes the system prompt as the first element.
 */
export async function chat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<string> {
  const maxTokens = Number(process.env.MAX_LLM_OUTPUT_TOKENS || 300);

  const res = await fetch(`${BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL(),
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    throw new Error(`Sarvam LLM ${res.status}: ${await safeBody(res)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

/**
 * Text-to-Speech (Bulbul). Returns base64-encoded WAV that the app plays.
 */
export async function textToSpeech(
  text: string,
  language: LanguageCode,
): Promise<string> {
  const res = await fetch(`${BASE}/text-to-speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey(),
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language,
      speaker: TTS_SPEAKER(),
      model: TTS_MODEL(),
      pitch: 0,
      pace: 1.0,
      loudness: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
    }),
  });
  if (!res.ok) {
    throw new Error(`Sarvam TTS ${res.status}: ${await safeBody(res)}`);
  }
  const data = (await res.json()) as { audios?: string[] };
  const audio = data.audios?.[0];
  if (!audio) throw new Error("Sarvam TTS returned no audio");
  return audio;
}

// Helper: convert ChatTurn[] history into OpenAI message shape, trimmed to the cap.
export function toMessages(
  system: string,
  history: ChatTurn[],
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const maxTurns = Number(process.env.MAX_HISTORY_TURNS || 12);
  const trimmed = history.slice(-maxTurns);
  return [{ role: "system", content: system }, ...trimmed];
}

async function safeBody(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "<no body>";
  }
}
