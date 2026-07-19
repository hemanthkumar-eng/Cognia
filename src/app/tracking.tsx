import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { BottomNav } from "@/components/BottomNav";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import { Palette, Radius } from "@/lib/ui";

export default function Tracking() {
  const { t } = useTranslation();
  const progress = useAppStore((s) => s.progress);

  const stats = [
    { value: progress.streak, label: t("tracking.streak"), accent: Palette.primary },
    { value: progress.xp, label: t("tracking.xp"), accent: Palette.secondary },
    {
      value: progress.completedScenarios.length,
      label: t("tracking.lessonsDone"),
      accent: Palette.primary,
    },
  ];

  const hasActivity =
    progress.xp > 0 || progress.streak > 0 || progress.completedScenarios.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t("tracking.title")}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {t("tracking.subtitle")}
          </ThemedText>
        </View>

        <View style={styles.cards}>
          {stats.map((s) => (
            <View key={s.label} style={styles.card}>
              <View style={[styles.accent, { backgroundColor: s.accent }]} />
              <ThemedText style={styles.value}>{s.value}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>
                {s.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {t("tracking.recentTitle")}
          </ThemedText>
          <View style={styles.panel}>
            <ThemedText type="small" themeColor="textSecondary">
              {hasActivity
                ? `${t("tracking.lastActive")}: ${progress.lastActiveDate ?? t("tracking.never")}`
                : t("tracking.empty")}
            </ThemedText>
          </View>
        </View>
      </View>

      <BottomNav active="tracking" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  header: { gap: Spacing.one },
  title: { fontSize: 34, lineHeight: 40 },
  cards: { flexDirection: "row", gap: Spacing.three },
  card: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
    gap: Spacing.one,
  },
  accent: { width: 28, height: 4, borderRadius: 999, marginBottom: Spacing.one },
  value: { fontSize: 30, fontWeight: "800", color: Palette.ink, lineHeight: 34 },
  cardLabel: { textAlign: "center" },
  section: { gap: Spacing.two },
  sectionTitle: {},
  panel: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: Spacing.three,
  },
});
