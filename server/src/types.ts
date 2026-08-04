// Shared types for the Cognia backend.
// Kept in sync (by hand) with the app's lib/api.ts.

export type Level = "beginner" | "intermediate" | "advanced";

// Sarvam BCP-47 style language codes. English-first; the rest are wired for Phase 3.
export type LanguageCode =
  | "en-IN"
  | "hi-IN"
  | "ta-IN"
  | "te-IN"
  | "bn-IN"
  | "mr-IN"
  | "gu-IN"
  | "kn-IN"
  | "ml-IN"
  | "pa-IN";

export type Board = "icse" | "cbse";

// A syllabus topic the student chose to practise (from the app's lib/syllabus
// catalogue). It themes the conversation — the tutor discusses it in English
// rather than teaching or grading the subject itself.
export interface TopicRef {
  id: string; // stable, e.g. "cbse-c5-water-cycle"
  title: string;
  subject: string; // display tag, e.g. "Science"
}

export interface Profile {
  name: string;
  grade?: number; // class / standard 1-12 (optional)
  board?: Board; // ICSE/CBSE — themes topic conversations (see TopicRef)
  level: Level; // ability — drives difficulty
  interests: string[]; // themes the tutor weaves in
  language: LanguageCode; // 'en-IN' default
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ConverseResponse {
  userText: string; // what the student said (STT)
  replyText: string; // tutor reply (LLM)
  audioBase64: string; // tutor reply spoken (TTS, base64 wav)
  mascotState: "speaking";
}
