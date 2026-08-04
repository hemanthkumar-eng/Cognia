import { buildSystemPrompt } from "./prompt.js";
import type { Scenario } from "./scenarios.js";
import { chat, textToSpeech, toMessages } from "./sarvam.js";
import type { ChatTurn, LanguageCode, Profile, TopicRef } from "./types.js";

// Conversation history keyed by sessionId. Shared by the REST route
// (/api/converse) and the streaming WebSocket bridge (/api/stream) so a student
// can move between the two without losing context. Phase 2 swaps this for
// Supabase so history survives a server restart.
export const sessions = new Map<string, ChatTurn[]>();

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

interface TutorTurnArgs {
  sessionId: string;
  profile: Profile;
  scenario?: Scenario;
  /** Syllabus topic being practised — themes the conversation (see prompt.ts). */
  topic?: TopicRef;
  /** What the student said (from STT or the text fallback). Ignored when opening. */
  userText?: string;
  /** Ask the tutor to speak first — no student input this turn. */
  opening?: boolean;
}

export interface TutorTurn {
  userText: string; // echoed student text ("" for an opening turn)
  replyText: string; // tutor reply (LLM)
  audioBase64: string; // reply spoken (Bulbul TTS, base64 wav)
}

/**
 * One tutor turn: append the student input to history, get the LLM reply, speak
 * it, and persist the updated history. Transport-agnostic — the caller has
 * already produced `userText` (via batch STT, streaming STT, or the text box).
 */
export async function runTutorTurn({
  sessionId,
  profile,
  scenario,
  topic,
  userText,
  opening,
}: TutorTurnArgs): Promise<TutorTurn> {
  const language: LanguageCode = profile.language || "en-IN";
  const history = sessions.get(sessionId) ?? [];

  if (opening) {
    // Seed a hidden kickoff so the tutor opens the conversation on-topic.
    const topicKickoff = topic
      ? `Greet the student warmly by name and tell them that today you will talk together about "${topic.title}". ` +
        `Ask one simple, open question to find out what they already know about it.`
      : undefined;
    const kickoff =
      scenario?.kickoff ??
      topicKickoff ??
      "Greet the student warmly by name and ask what they would like to talk about today.";
    history.push({ role: "user", content: `(${kickoff})` });
  } else {
    const said = (userText ?? "").trim();
    if (!said) throw new Error("runTutorTurn needs userText unless opening");
    history.push({ role: "user", content: said });
  }

  const messages = toMessages(buildSystemPrompt(profile, scenario, topic), history);
  const replyText = await chat(messages);
  history.push({ role: "assistant", content: replyText });
  sessions.set(sessionId, history);

  const audioBase64 = await textToSpeech(replyText, language);

  return { userText: opening ? "" : (userText ?? "").trim(), replyText, audioBase64 };
}
