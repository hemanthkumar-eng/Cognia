// Cognia design tokens — the single source of truth for colour.
//
// The seven base colours are the agreed brand palette; the handful of extra
// entries are light/dark tints derived from them (focus rings, bubbles, error
// states) that any real UI needs. Everything in the app resolves to these —
// `Brand` below is just a semantic alias layer over the same values.
export const Palette = {
  // Base palette
  primary: "#1D4ED8", // Deep Blue — primary actions, links, brand
  secondary: "#10B981", // Emerald — success, streaks, "finish"
  background: "#F8FAFC", // Off White — app background
  surface: "#FFFFFF", // White — cards, inputs
  ink: "#0F172A", // Slate — primary text
  inkMuted: "#64748B", // Gray — secondary text
  border: "#E2E8F0", // Light Gray — borders, dividers

  // Derived tints / functional
  primaryDark: "#1E40AF", // pressed state, gradient end
  primarySoft: "#EFF4FF", // soft primary fill (focus rings, secondary buttons)
  secondarySoft: "#ECFDF5", // soft emerald fill
  surfaceMuted: "#F1F5F9", // subtle fill (resting input, tutor bubble)
  inkSoft: "#334155", // slightly softer heading/body ink
  borderStrong: "#CBD5E1", // stronger separation / disabled fill
  danger: "#DC2626", // error / destructive
  dangerSoft: "#FEF2F2", // error background
  white: "#FFFFFF",
} as const;

// Semantic aliases used inside the tutor experience (mascot, bubbles, mic).
// Kept as a thin layer so those components read naturally while still pulling
// from the one palette above.
export const Brand = {
  primary: Palette.primary,
  primaryDark: Palette.primaryDark,
  accent: Palette.secondary, // emerald — active / highlight states
  good: Palette.secondary, // success / finish
  bubbleUser: Palette.primary,
  bubbleTutor: Palette.surfaceMuted,
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;
