// BoloBuddy brand palette + a few shared UI constants.
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
