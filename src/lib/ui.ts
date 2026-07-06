// Cognia brand palette + a few shared UI constants.
// Layered on top of the template's Colors/Spacing (src/constants/theme.ts).

export const Brand = {
  primary: "#208AEF", // matches the splash color
  primaryDark: "#1567C2",
  accent: "#FF8A3D", // warm, kid-friendly
  good: "#36B37E",
  bubbleUser: "#208AEF",
  bubbleTutor: "#F0F0F3",
  bubbleTutorDark: "#212225",
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

// Professional, light-first neutral palette for the auth / account surfaces.
// Slate neutrals + one confident blue — deliberately calmer and more "product"
// than the playful Brand palette used inside the tutor experience.
export const Palette = {
  ink: "#0F172A", // headings — near-black with a cool cast
  inkSoft: "#334155", // body text
  inkMuted: "#64748B", // secondary / captions
  border: "#E2E8F0", // hairline dividers, input borders
  borderStrong: "#CBD5E1", // hover / stronger separation
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFC", // resting input fill, subtle cards
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF4FF", // tint for focus rings / soft fills
  danger: "#DC2626",
} as const;
