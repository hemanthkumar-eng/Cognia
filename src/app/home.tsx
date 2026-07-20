import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { BottomNav } from "@/components/BottomNav";
import { GlassBackground, GlassView } from "@/components/Glass";
import { Mascot } from "@/components/Mascot";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import { Brand, Glass, Palette, Radius } from "@/lib/ui";

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const name = useAppStore((s) => s.profile.name);
  const progress = useAppStore((s) => s.progress);

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Mascot state="idle" size={132} />
            <ThemedText type="title" style={styles.greeting}>
              {t("home.greeting", { name })}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {t("home.prompt")}
            </ThemedText>

            <GlassView radius={Radius.lg} style={styles.stats}>
              <View style={styles.statsRow}>
                <Stat value={progress.streak} label={t("home.streak")} />
                <View style={styles.statDivider} />
                <Stat value={progress.xp} label={t("home.xp")} />
                <View style={styles.statDivider} />
                <Stat value={progress.completedScenarios.length} label={t("home.lessonsDone")} />
              </View>
            </GlassView>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.lessons")}
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={() => router.push("/lessons")}
            >
              <ThemedText style={styles.primaryText}>{t("home.lessons")}</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.startTalking")}
              onPress={() => router.push("/conversation")}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <GlassView radius={Radius.md} tint={Glass.tintStrong}>
                <View style={styles.secondaryInner}>
                  <ThemedText style={styles.secondaryText}>
                    {t("home.startTalking")}
                  </ThemedText>
                </View>
              </GlassView>
            </Pressable>
          </View>
        </View>

        <BottomNav active="home" />
      </SafeAreaView>
    </GlassBackground>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  content: { flex: 1, padding: Spacing.four },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.three },
  greeting: { textAlign: "center", fontSize: 34, lineHeight: 40 },
  stats: { alignSelf: "stretch", marginTop: Spacing.three },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 22, fontWeight: "800", color: Palette.ink },
  statDivider: { width: 1, alignSelf: "stretch", backgroundColor: Glass.borderSoft },
  actions: { gap: Spacing.two },
  primary: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryText: { color: Palette.white, fontSize: 18, fontWeight: "700" },
  secondaryInner: { paddingVertical: Spacing.three, alignItems: "center" },
  secondaryText: { color: Brand.primaryDark, fontSize: 18, fontWeight: "700" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
