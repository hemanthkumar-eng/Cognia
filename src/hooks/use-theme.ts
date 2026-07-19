/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

// Cognia is locked to light mode (see app.json `userInterfaceStyle` and the
// root `ThemeProvider`), so themed text/views always resolve against the light
// palette regardless of the device's system setting. If a dark theme is ever
// reintroduced, switch this back to reading `useColorScheme()`.
export function useTheme() {
  return Colors.light;
}
