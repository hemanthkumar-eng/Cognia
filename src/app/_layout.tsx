import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Palette } from "@/lib/ui";
import "@/lib/i18n";

const queryClient = new QueryClient();

// Cognia is a light-first, kid-friendly product: the brand palette and the
// auth surfaces are all light, so we lock the whole app to light mode (also set
// in app.json) rather than half-support a dark theme. This keeps every screen's
// colours correct-by-construction instead of drifting between the two.
const CogniaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.primary,
    background: Palette.background, // off-white app background
    card: Palette.surface,
    text: Palette.ink,
    border: Palette.border,
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={CogniaTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="home" />
            <Stack.Screen name="tracking" />
            <Stack.Screen name="lessons" />
            <Stack.Screen name="conversation" />
            <Stack.Screen name="settings" />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
