import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppStore } from "@/lib/store";
import { Brand } from "@/lib/ui";

// Entry point: wait for persisted state, then route to onboarding or home.
export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const authed = useAppStore((s) => s.authed);
  const onboarded = useAppStore((s) => s.onboarded);

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  // New user → sign up → profile setup → home. (Already-onboarded users from
  // before auth existed skip straight to home.)
  if (!authed && !onboarded) return <Redirect href="/signup" />;
  return <Redirect href={onboarded ? "/home" : "/onboarding"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
