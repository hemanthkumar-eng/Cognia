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

// Liquid-glass surfaces (iOS 26/27 inspired). Frosted BlurView + a translucent
// white tint + a bright top edge, over the soft gradient backdrop. Same palette —
// these are just translucent forms of the existing surface/border tokens.
export const Glass = {
  tint: "rgba(255,255,255,0.55)", // overlay lightening the blur into a frosted panel
  tintStrong: "rgba(255,255,255,0.7)", // nav / primary surfaces
  border: "rgba(255,255,255,0.65)", // bright glass edge
  borderSoft: "rgba(148,163,184,0.28)", // subtle separation (slate @ low alpha)
  intensity: 36, // BlurView intensity for cards
  intensityNav: 28,
  // Subtle primary→emerald backdrop the frosted glass refracts.
  gradient: ["#E9F1FF", "#F8FAFC", "#E7FBF2"] as const,
  blobPrimary: "rgba(29,78,216,0.12)", // Deep Blue pool, top-right
  blobEmerald: "rgba(16,185,129,0.12)", // Emerald pool, bottom-left
} as const;
