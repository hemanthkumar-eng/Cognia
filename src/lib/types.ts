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

// Examination board — content is themed on each class's ICSE/CBSE syllabus.
export type Board = "icse" | "cbse";

export interface Profile {
  name: string;
  grade?: number;
  board?: Board; // one board per account (chosen in onboarding)
  level: Level;
  interests: string[];
  language: LanguageCode;
}

export type SubscriptionTier = "basic" | "premium";

// A subscription binds a plan tier to one or more classes (grades 1–12).
// Basic covers a single class; multi-class is a Premium feature.
export interface Subscription {
  tier: SubscriptionTier;
  grades: number[]; // subscribed classes, sorted ascending
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
  completedTopics: string[]; // syllabus topic ids finished (see lib/syllabus)
  bestStreak: number; // longest streak ever reached
  history: Record<string, number>; // YYYY-MM-DD → xp earned that day (activity heatmap)
}
