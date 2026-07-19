import { Image } from "expo-image";

// Monochrome line icons rendered from SVG assets and recoloured at runtime via
// expo-image's tintColor — one asset per glyph, any palette colour on demand.
const ICONS = {
  home: require("../../assets/icons/home.svg"),
  tracking: require("../../assets/icons/chart.svg"),
  settings: require("../../assets/icons/settings.svg"),
  mic: require("../../assets/icons/mic.svg"),
} as const;

export type IconName = keyof typeof ICONS;

export function AppIcon({
  name,
  size = 24,
  color,
}: {
  name: IconName;
  size?: number;
  color: string;
}) {
  return (
    <Image
      source={ICONS[name]}
      style={{ width: size, height: size }}
      tintColor={color}
      contentFit="contain"
      accessibilityIgnoresInvertColors
    />
  );
}
