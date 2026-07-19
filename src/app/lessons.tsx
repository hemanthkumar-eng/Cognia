import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { getScenarios } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Scenario } from "@/lib/types";
import { Brand, Palette, Radius } from "@/lib/ui";

export default function Lessons() {
  const { t } = useTranslation();
  const router = useRouter();
  const level = useAppStore((s) => s.profile.level);
  const completed = useAppStore((s) => s.progress.completedScenarios);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["scenarios"],
    queryFn: getScenarios,
  });

  // Suitable-for-this-level lessons first, then the rest.
  const ordered = (data ?? [])
    .slice()
    .sort(
      (a, b) =>
        Number(b.levels.includes(level)) - Number(a.levels.includes(level)),
    );

  function open(s: Scenario) {
    router.push({
      pathname: "/conversation",
      params: { scenarioId: s.id, title: s.title },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("conversation.back")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="link">‹</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{t("lessons.title")}</ThemedText>
        <View style={{ width: 16 }} />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="large" />
          <ThemedText type="small" themeColor="textSecondary">
            {t("lessons.loading")}
          </ThemedText>
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <ThemedText type="small" themeColor="textSecondary">
            {t("lessons.error")}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.retryText}>{t("lessons.retry")}</ThemedText>
          </Pressable>
        </View>
      )}

      {data && (
        <ScrollView contentContainerStyle={styles.list}>
          {ordered.map((s) => {
            const done = completed.includes(s.id);
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={`${s.title}. ${s.blurb}${done ? ". " + t("lessons.completed") : ""}`}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => open(s)}
              >
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>
                    {s.title.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.cardBody}>
                  <ThemedText type="smallBold">{s.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {s.blurb}
                  </ThemedText>
                </View>
                {done && (
                  <ThemedText type="small" style={styles.done}>
                    {t("lessons.completed")}
                  </ThemedText>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.four },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.two },
  list: { gap: Spacing.two, paddingBottom: Spacing.four },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md - 4,
    backgroundColor: Palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: Palette.primary, fontSize: 20, fontWeight: "800" },
  cardBody: { flex: 1, gap: 2 },
  done: { color: Brand.good, fontWeight: "700" },
  retry: {
    marginTop: Spacing.two,
    backgroundColor: Brand.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  retryText: { color: Palette.white, fontWeight: "700" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
