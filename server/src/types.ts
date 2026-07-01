// Shared types for the BoloBuddy backend.
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

export interface Profile {
  name: string;
  grade?: number; // class / standard 1-12 (optional)
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
