import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Mascot } from "@/components/Mascot";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import { Brand, Radius } from "@/lib/ui";

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const name = useAppStore((s) => s.profile.name);
  const progress = useAppStore((s) => s.progress);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("home.settings")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText style={styles.gear}>⚙️</ThemedText>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Mascot state="idle" size={140} />
        <ThemedText type="title" style={styles.greeting}>
          {t("home.greeting", { name })}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {t("home.prompt")}
        </ThemedText>

        <View style={styles.stats}>
          <Stat value={`🔥 ${progress.streak}`} label={t("home.streak")} />
          <Stat value={`⭐ ${progress.xp}`} label={t("home.xp")} />
          <Stat
            value={`✅ ${progress.completedScenarios.length}`}
            label={t("home.lessonsDone")}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("home.lessons")}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          onPress={() => router.push("/lessons")}
        >
          <ThemedText style={styles.primaryText}>📚 {t("home.lessons")}</ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("home.startTalking")}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          onPress={() => router.push("/conversation")}
        >
          <ThemedText style={styles.secondaryText}>
            🎤 {t("home.startTalking")}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="smallBold">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.four },
  header: { flexDirection: "row", justifyContent: "flex-end" },
  gear: { fontSize: 26 },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.three },
  greeting: { textAlign: "center", fontSize: 34, lineHeight: 40 },
  stats: {
    flexDirection: "row",
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  stat: { alignItems: "center", gap: 2 },
  actions: { gap: Spacing.two },
  primary: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  primaryText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  secondary: {
    backgroundColor: "#EAF3FE",
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  secondaryText: { color: Brand.primaryDark, fontSize: 18, fontWeight: "700" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
