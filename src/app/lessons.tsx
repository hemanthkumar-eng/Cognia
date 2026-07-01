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
import { Brand, Radius } from "@/lib/ui";

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
        <Pressable onPress={() => router.back()} hitSlop={12}>
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
          <Pressable style={styles.retry} onPress={() => refetch()}>
            <ThemedText style={styles.retryText}>{t("lessons.retry")}</ThemedText>
          </Pressable>
        </View>
      )}

      {data && (
        <ScrollView contentContainerStyle={styles.list}>
          {ordered.map((s) => {
            const done = completed.includes(s.id);
            return (
              <Pressable key={s.id} style={styles.card} onPress={() => open(s)}>
                <ThemedText style={styles.emoji}>{s.emoji}</ThemedText>
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
    borderColor: "#E2E5E9",
  },
  emoji: { fontSize: 30 },
  cardBody: { flex: 1, gap: 2 },
  done: { color: Brand.good, fontWeight: "700" },
  retry: {
    marginTop: Spacing.two,
    backgroundColor: Brand.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  retryText: { color: "#fff", fontWeight: "700" },
});
