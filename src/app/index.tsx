import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppStore } from "@/lib/store";
import { Brand } from "@/lib/ui";

// Entry point: wait for persisted state, then route to onboarding or home.
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const authed = useAppStore((s) => s.authed);
  const subscription = useAppStore((s) => s.subscription);
  const onboarded = useAppStore((s) => s.onboarded);

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  // Auth gates everything: a signed-out user always lands on sign up. Once
  // authed, walk the funnel — choose plan → profile setup → home — resuming at
  // whatever step is still incomplete (so re-login skips straight to home).
  if (!authed) return <Redirect href="/signup" />;
  if (!subscription) return <Redirect href="/subscribe" />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
