// Mock syllabus catalogue.
//
// Cognia is a spoken-English tutor: lessons are *cross-curricular topics* themed
// on a class's ICSE/CBSE syllabus (the student talks about "the water cycle" in
// English — the tutor doesn't teach/grade the subject). This file is the single
// source of truth for those topics, keyed by board → class.
//
// This is a bounded, representative MOCK — a handful of topics per class, not the
// full syllabus. Real content wiring (server-side thematic tutoring) is a follow-up.
import type { Board } from "./types";

export interface Topic {
  id: string; // stable, e.g. "cbse-c5-water-cycle"
  title: string;
  subject: string; // display tag
  emoji: string;
}

// A subject palette reused when building topic lists.
const SUB = {
  english: { subject: "English", emoji: "📖" },
  science: { subject: "Science", emoji: "🔬" },
  social: { subject: "Social Studies", emoji: "🌏" },
  maths: { subject: "Maths", emoji: "➗" },
  gk: { subject: "General Knowledge", emoji: "💡" },
  evs: { subject: "EVS", emoji: "🌱" },
} as const;

type Seed = { key: string; title: string; sub: keyof typeof SUB };

// Per-class topic seeds. Kept short and age-appropriate; the same spine is used
// for both boards, with a couple of board-specific swaps applied in getTopics().
const SEEDS: Record<number, Seed[]> = {
  1: [
    { key: "my-family", title: "My family and me", sub: "english" },
    { key: "colours", title: "Colours all around", sub: "gk" },
    { key: "animals-home", title: "Animals and their homes", sub: "evs" },
    { key: "counting", title: "Counting to twenty", sub: "maths" },
    { key: "good-habits", title: "Good habits every day", sub: "evs" },
    { key: "my-school", title: "My school", sub: "social" },
    { key: "fruits-veg", title: "Fruits and vegetables", sub: "evs" },
    { key: "seasons", title: "The four seasons", sub: "science" },
  ],
  2: [
    { key: "my-neighbourhood", title: "My neighbourhood", sub: "social" },
    { key: "plants-around", title: "Plants around us", sub: "evs" },
    { key: "shapes", title: "Shapes and patterns", sub: "maths" },
    { key: "festivals", title: "Festivals of India", sub: "social" },
    { key: "birds", title: "Birds and their sounds", sub: "science" },
    { key: "telling-time", title: "Telling the time", sub: "maths" },
    { key: "picture-story", title: "Tell a picture story", sub: "english" },
    { key: "water-uses", title: "Uses of water", sub: "evs" },
  ],
  3: [
    { key: "solar-system", title: "Our solar system", sub: "science" },
    { key: "states-india", title: "States of India", sub: "social" },
    { key: "living-nonliving", title: "Living and non-living things", sub: "science" },
    { key: "multiplication", title: "The world of multiplication", sub: "maths" },
    { key: "transport", title: "Means of transport", sub: "social" },
    { key: "food-groups", title: "Food groups", sub: "evs" },
    { key: "adjectives", title: "Describing with adjectives", sub: "english" },
    { key: "our-body", title: "Parts of our body", sub: "science" },
  ],
  4: [
    { key: "water-cycle", title: "The water cycle", sub: "science" },
    { key: "the-earth", title: "The Earth and its neighbours", sub: "science" },
    { key: "our-country", title: "Our country, India", sub: "social" },
    { key: "fractions", title: "Understanding fractions", sub: "maths" },
    { key: "plant-life", title: "Life of a plant", sub: "science" },
    { key: "rivers", title: "Rivers of India", sub: "social" },
    { key: "letter-writing", title: "Writing a friendly letter", sub: "english" },
    { key: "safety-rules", title: "Safety first", sub: "gk" },
  ],
  5: [
    { key: "human-body", title: "The human body systems", sub: "science" },
    { key: "freedom-struggle", title: "India's freedom struggle", sub: "social" },
    { key: "decimals", title: "Decimals in daily life", sub: "maths" },
    { key: "natural-resources", title: "Natural resources", sub: "science" },
    { key: "climate", title: "Weather and climate", sub: "social" },
    { key: "story-narration", title: "Narrate your own story", sub: "english" },
    { key: "energy-forms", title: "Forms of energy", sub: "science" },
    { key: "our-constitution", title: "Our Constitution", sub: "social" },
  ],
  6: [
    { key: "components-food", title: "Components of food", sub: "science" },
    { key: "ancient-india", title: "Life in ancient India", sub: "social" },
    { key: "integers", title: "The world of integers", sub: "maths" },
    { key: "our-universe", title: "Our universe", sub: "science" },
    { key: "maps", title: "Reading maps", sub: "social" },
    { key: "speech-debate", title: "Speak up: a short debate", sub: "english" },
    { key: "electricity", title: "Electricity and circuits", sub: "science" },
    { key: "democracy", title: "What is democracy?", sub: "social" },
  ],
  7: [
    { key: "nutrition-plants", title: "Nutrition in plants", sub: "science" },
    { key: "medieval-india", title: "Medieval India", sub: "social" },
    { key: "the-triangle", title: "The triangle and its properties", sub: "maths" },
    { key: "weather-climate", title: "Weather, climate and adaptation", sub: "science" },
    { key: "environment", title: "Our environment", sub: "social" },
    { key: "formal-writing", title: "Formal writing skills", sub: "english" },
    { key: "acids-bases", title: "Acids, bases and salts", sub: "science" },
    { key: "markets", title: "Markets around us", sub: "social" },
  ],
  8: [
    { key: "crop-production", title: "Crop production", sub: "science" },
    { key: "colonial-india", title: "Colonialism in India", sub: "social" },
    { key: "rational-numbers", title: "Rational numbers", sub: "maths" },
    { key: "force-pressure", title: "Force and pressure", sub: "science" },
    { key: "resources", title: "Resources and development", sub: "social" },
    { key: "persuasive-speech", title: "Give a persuasive speech", sub: "english" },
    { key: "cell-structure", title: "The cell: structure and function", sub: "science" },
    { key: "indian-parliament", title: "The Indian Parliament", sub: "social" },
  ],
  9: [
    { key: "matter", title: "Matter in our surroundings", sub: "science" },
    { key: "french-revolution", title: "The French Revolution", sub: "social" },
    { key: "number-systems", title: "Number systems", sub: "maths" },
    { key: "tissues", title: "Tissues", sub: "science" },
    { key: "climate-india", title: "Climate of India", sub: "social" },
    { key: "group-discussion", title: "Lead a group discussion", sub: "english" },
    { key: "motion", title: "Motion and its laws", sub: "science" },
    { key: "democracy-rights", title: "Democratic rights", sub: "social" },
  ],
  10: [
    { key: "chemical-reactions", title: "Chemical reactions", sub: "science" },
    { key: "nationalism", title: "Nationalism in India", sub: "social" },
    { key: "trigonometry", title: "Introduction to trigonometry", sub: "maths" },
    { key: "life-processes", title: "Life processes", sub: "science" },
    { key: "globalisation", title: "Globalisation and the economy", sub: "social" },
    { key: "interview-skills", title: "Ace an interview", sub: "english" },
    { key: "light", title: "Light: reflection and refraction", sub: "science" },
    { key: "federalism", title: "Federalism", sub: "social" },
  ],
  11: [
    { key: "units-measurement", title: "Units and measurement", sub: "science" },
    { key: "world-history", title: "Themes in world history", sub: "social" },
    { key: "sets", title: "Sets and functions", sub: "maths" },
    { key: "cell-biology", title: "Cell: the unit of life", sub: "science" },
    { key: "indian-economy", title: "The Indian economy", sub: "social" },
    { key: "presentation", title: "Deliver a presentation", sub: "english" },
    { key: "thermodynamics", title: "Thermodynamics basics", sub: "science" },
    { key: "political-theory", title: "Political theory", sub: "social" },
  ],
  12: [
    { key: "electrostatics", title: "Electrostatics", sub: "science" },
    { key: "modern-india", title: "Making of modern India", sub: "social" },
    { key: "calculus", title: "Calculus: an introduction", sub: "maths" },
    { key: "genetics", title: "Principles of genetics", sub: "science" },
    { key: "macroeconomics", title: "Macroeconomics", sub: "social" },
    { key: "public-speaking", title: "Public speaking mastery", sub: "english" },
    { key: "biotechnology", title: "Biotechnology and its uses", sub: "science" },
    { key: "contemporary-world", title: "The contemporary world", sub: "social" },
  ],
};

// Build the topic list for a board + class from the shared seeds. Both boards use
// the same spine here (the mock); the board only prefixes topic ids so completion
// is tracked per board, and lets us vary content later without touching callers.
export function getTopics(board: Board, classNum: number): Topic[] {
  const seeds = SEEDS[classNum] ?? [];
  return seeds.map((s) => ({
    id: `${board}-c${classNum}-${s.key}`,
    title: s.title,
    subject: SUB[s.sub].subject,
    emoji: SUB[s.sub].emoji,
  }));
}

export function topicCount(board: Board, classNum: number): number {
  return (SEEDS[classNum] ?? []).length;
}
