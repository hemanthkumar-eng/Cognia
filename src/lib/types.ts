// Mirrors server/src/types.ts (kept in sync by hand).

export type Level = "beginner" | "intermediate" | "advanced";

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
  grade?: number;
  level: Level;
  interests: string[];
  language: LanguageCode;
}

export type Speaker = "user" | "tutor";

export interface Message {
  id: string;
  speaker: Speaker;
  text: string;
}

export interface ConverseResponse {
  userText: string;
  replyText: string;
  audioBase64: string;
  mascotState: "speaking";
}

// What the mascot is doing — drives its animation.
export type MascotState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "celebrate";

// Lesson card, as returned by GET /api/scenarios.
export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  levels: Level[];
}

// Local gamification state.
export interface Progress {
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD (local)
  xp: number;
  completedScenarios: string[];
}
