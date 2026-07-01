import type { Level } from "./types.js";

// Guided conversation scenarios. The server is the single source of truth — the
// app fetches these via GET /api/scenarios, so content can change without an app
// update. Each scenario shapes the tutor's system prompt and provides a "kickoff"
// instruction used to open the conversation.

export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  blurb: string; // one-line card description
  levels: Level[]; // which ability levels it suits
  goal: string; // what the student practises (goes in the prompt)
  guidance: string; // extra tutor instructions for this scenario
  kickoff: string; // hidden instruction that opens the conversation
}

export const SCENARIOS: Scenario[] = [
  {
    id: "greetings",
    emoji: "👋",
    title: "Saying Hello",
    blurb: "Greet people and introduce yourself",
    levels: ["beginner", "intermediate"],
    goal: "greeting people, introducing themselves, and asking how someone is",
    guidance:
      "Model simple greetings (Hello, Good morning, How are you?). Take turns. Keep it light.",
    kickoff:
      "Greet the student warmly by name, say hello, and ask them how they are today.",
  },
  {
    id: "school",
    emoji: "🏫",
    title: "All About School",
    blurb: "Talk about your school day",
    levels: ["beginner", "intermediate", "advanced"],
    goal: "talking about subjects, teachers, friends and a typical school day",
    guidance:
      "Ask about favourite subjects and what they did at school. Encourage full sentences.",
    kickoff:
      "Greet the student and ask them what their favourite subject in school is and why.",
  },
  {
    id: "market",
    emoji: "🛒",
    title: "At the Market",
    blurb: "Buy things and ask prices",
    levels: ["beginner", "intermediate"],
    goal: "asking prices, naming items and quantities, and being polite while shopping",
    guidance:
      "Role-play as a friendly shopkeeper. Ask what they want to buy and how many. Teach 'How much is...?'.",
    kickoff:
      "You are a friendly shopkeeper at an Indian market. Greet the student and ask what they would like to buy today.",
  },
  {
    id: "friends",
    emoji: "🧑‍🤝‍🧑",
    title: "Making Friends",
    blurb: "Meet someone new and chat",
    levels: ["intermediate", "advanced"],
    goal: "starting a conversation with someone new and finding things in common",
    guidance:
      "Pretend you are a new classmate. Ask about their hobbies and interests and share your own.",
    kickoff:
      "Pretend you are a friendly new classmate meeting the student for the first time. Introduce yourself and ask their name.",
  },
  {
    id: "story",
    emoji: "📖",
    title: "Tell a Story",
    blurb: "Make up a story together",
    levels: ["intermediate", "advanced"],
    goal: "narrating events in order using past tense and descriptive words",
    guidance:
      "Build a story together, one or two sentences each. Gently model past-tense verbs. Use their interests as the theme.",
    kickoff:
      "Invite the student to make up a fun story together. Suggest a theme based on their interests and start the first sentence.",
  },
  {
    id: "favourites",
    emoji: "⭐",
    title: "My Favourite Things",
    blurb: "Talk about what you love",
    levels: ["beginner", "intermediate", "advanced"],
    goal: "expressing likes and dislikes and giving reasons",
    guidance:
      "Ask about favourite food, game, or movie. Push for a reason ('because...'). Use their interests.",
    kickoff:
      "Greet the student and ask them to tell you about one thing they really love, and why.",
  },
  {
    id: "directions",
    emoji: "🧭",
    title: "Asking for Directions",
    blurb: "Find your way around",
    levels: ["advanced"],
    goal: "asking for and giving simple directions (left, right, near, opposite)",
    guidance:
      "Role-play being a helpful stranger. Practise 'Where is...?', 'How do I get to...?' and direction words.",
    kickoff:
      "Pretend the student is new in town and looking for the railway station. Greet them and ask if they need any help.",
  },
];

export function getScenario(id: string | undefined): Scenario | undefined {
  if (!id) return undefined;
  return SCENARIOS.find((s) => s.id === id);
}
