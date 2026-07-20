import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { BottomNav } from "@/components/BottomNav";
import { GlassBackground, GlassView } from "@/components/Glass";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { dayStr, useAppStore } from "@/lib/store";
import { getTopics, topicCount, type Topic } from "@/lib/syllabus";
import type { Board } from "@/lib/types";
import { Glass, Palette, Radius } from "@/lib/ui";

// GitHub-style contribution calendar: small square cells, laid out as week columns
// × 7 day rows, coloured on a 5-step green scale by the day's XP.
const HEAT_CELL = 13; // cell size (px)
const HEAT_GAP = 3;
const HEAT_ROWS = 7; // days of the week
const HEAT_GREENS = ["#EBEDF0", "#9BE9A8", "#40C463", "#30A14E", "#216E39"];
function levelOf(xp: number): number {
  if (!xp) return 0;
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

export default function Tracking() {
  const { t } = useTranslation();
  const router = useRouter();
  const progress = useAppStore((s) => s.progress);
  const board = useAppStore((s) => s.profile.board);
  const grade = useAppStore((s) => s.profile.grade);
  const subscription = useAppStore((s) => s.subscription);

  const history = progress.history ?? {};
  const completedTopics = progress.completedTopics ?? [];

  // Classes to track: the subscribed ones, else the single profile class, else none.
  const classes =
    subscription?.grades && subscription.grades.length > 0
      ? subscription.grades
      : grade
        ? [grade]
        : [];

  const stats = [
    { value: progress.streak, label: t("tracking.streak"), accent: Palette.primary },
    { value: progress.xp, label: t("tracking.xp"), accent: Palette.secondary },
    {
      value: progress.completedScenarios.length,
      label: t("tracking.lessonsDone"),
      accent: Palette.primary,
    },
  ];

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <GlassView key={s.label} radius={Radius.lg} style={styles.card}>
              <View style={styles.cardInner}>
                <View style={[styles.accent, { backgroundColor: s.accent }]} />
                <ThemedText style={styles.value}>{s.value}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>
                  {s.label}
                </ThemedText>
              </View>
            </GlassView>
          ))}
        </View>

        {/* Syllabus coverage */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              {t("tracking.syllabusTitle")}
            </ThemedText>
            {board && (
              <View style={styles.boardBadge}>
                <ThemedText style={styles.boardBadgeText}>{t(`board.${board}`)}</ThemedText>
              </View>
            )}
          </View>

          {!board ? (
            <Pressable
              onPress={() => router.replace("/onboarding")}
              accessibilityRole="button"
            >
              <GlassView radius={Radius.md}>
                <View style={styles.panel}>
                  <ThemedText type="smallBold">{t("tracking.noBoardTitle")}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t("tracking.noBoardBody")}
                  </ThemedText>
                  <ThemedText style={styles.link}>{t("tracking.chooseBoard")}</ThemedText>
                </View>
              </GlassView>
            </Pressable>
          ) : classes.length === 0 ? (
            <GlassView radius={Radius.md}>
              <View style={styles.panel}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t("tracking.noClassBody")}
                </ThemedText>
              </View>
            </GlassView>
          ) : (
            classes.map((c) => (
              <CoverageCard
                key={c}
                board={board}
                classNum={c}
                completedTopics={completedTopics}
                onPractice={(topic) =>
                  router.push({
                    pathname: "/conversation",
                    params: { topicId: topic.id, title: topic.title },
                  })
                }
              />
            ))
          )}
        </View>

        {/* Activity heatmap */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            {t("tracking.activityTitle")}
          </ThemedText>
          <GlassView radius={Radius.md}>
            <View style={styles.panel}>
              <Heatmap history={history} />
              <View style={styles.activityStats}>
                <ActivityStat
                  value={progress.bestStreak ?? progress.streak}
                  label={t("tracking.bestStreak")}
                />
                <View style={styles.activityDivider} />
                <ActivityStat value={daysThisWeek(history)} label={t("tracking.daysThisWeek")} />
              </View>
            </View>
          </GlassView>
        </View>
        </ScrollView>

        <BottomNav active="tracking" />
      </SafeAreaView>
    </GlassBackground>
  );
}

// A per-class card: coverage bar + expandable topic list with a Practice action.
function CoverageCard({
  board,
  classNum,
  completedTopics,
  onPractice,
}: {
  board: Board;
  classNum: number;
  completedTopics: string[];
  onPractice: (topic: Topic) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const topics = getTopics(board, classNum);
  const total = topicCount(board, classNum);
  const done = topics.filter((tp) => completedTopics.includes(tp.id)).length;
  const pct = total > 0 ? done / total : 0;

  return (
    <GlassView radius={Radius.md} style={styles.coverCard}>
      <View style={styles.coverInner}>
        <Pressable
          style={styles.coverHead}
          onPress={() => setOpen((v) => !v)}
          accessibilityRole="button"
        >
          <View style={styles.coverHeadRow}>
            <ThemedText type="smallBold">
              {t("tracking.classLabel", { grade: classNum })}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t("tracking.topicsProgress", { done, total })}
            </ThemedText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
        </Pressable>

        {open && (
          <View style={styles.topicList}>
            {topics.map((tp) => {
            const isDone = completedTopics.includes(tp.id);
            return (
              <View key={tp.id} style={styles.topicRow}>
                <ThemedText style={styles.topicEmoji}>{tp.emoji}</ThemedText>
                <View style={styles.topicBody}>
                  <ThemedText type="small" style={styles.topicTitle}>
                    {tp.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.topicSubject}>
                    {tp.subject}
                  </ThemedText>
                </View>
                {isDone ? (
                  <View style={styles.doneTag}>
                    <ThemedText style={styles.doneTagText}>✓ {t("tracking.done")}</ThemedText>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => onPractice(tp)}
                    hitSlop={6}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.practiceBtn, pressed && styles.pressed]}
                  >
                    <ThemedText style={styles.practiceText}>{t("tracking.practice")}</ThemedText>
                  </Pressable>
                )}
              </View>
              );
            })}
          </View>
        )}
      </View>
    </GlassView>
  );
}

function Heatmap({ history }: { history: Record<string, number> }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  // Panel has Spacing.four screen padding + Spacing.three inner padding each side.
  const inner = width - Spacing.four * 2 - Spacing.three * 2;
  // As many week-columns as fit; the last column is the current week.
  const cols = Math.max(1, Math.floor((inner + HEAT_GAP) / (HEAT_CELL + HEAT_GAP)));

  const today = new Date();
  // Back up to the Sunday that starts the oldest visible week.
  const start = new Date(today);
  start.setDate(today.getDate() - ((cols - 1) * 7 + today.getDay()));

  const columns: { key: string; xp: number; future: boolean }[][] = [];
  for (let c = 0; c < cols; c++) {
    const col: { key: string; xp: number; future: boolean }[] = [];
    for (let r = 0; r < HEAT_ROWS; r++) {
      const d = new Date(start);
      d.setDate(start.getDate() + c * 7 + r);
      const key = dayStr(d);
      col.push({ key, xp: history[key] ?? 0, future: d > today });
    }
    columns.push(col);
  }

  return (
    <View>
      <View style={styles.heatGrid}>
        {columns.map((col, ci) => (
          <View key={ci} style={styles.heatCol}>
            {col.map((d) => (
              <View
                key={d.key}
                style={[
                  styles.heatCell,
                  { backgroundColor: d.future ? "transparent" : HEAT_GREENS[levelOf(d.xp)] },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <ThemedText style={styles.legendText}>{t("tracking.less")}</ThemedText>
        {HEAT_GREENS.map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <ThemedText style={styles.legendText}>{t("tracking.more")}</ThemedText>
      </View>
    </View>
  );
}

function ActivityStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.activityStat}>
      <ThemedText style={styles.activityValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.cardLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

// Distinct days with any activity in the last 7 days (including today).
function daysThisWeek(history: Record<string, number>): number {
  let n = 0;
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    if ((history[dayStr(d)] ?? 0) > 0) n++;
  }
  return n;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  content: { padding: Spacing.four, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { gap: Spacing.one },
  title: { fontSize: 34, lineHeight: 40 },
  cards: { flexDirection: "row", gap: Spacing.three },
  card: { flex: 1 },
  cardInner: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: "center",
    gap: Spacing.one,
  },
  accent: { width: 28, height: 4, borderRadius: 999, marginBottom: Spacing.one },
  value: { fontSize: 30, fontWeight: "800", color: Palette.ink, lineHeight: 34 },
  cardLabel: { textAlign: "center" },

  section: { gap: Spacing.two },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: {},
  boardBadge: {
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  boardBadgeText: { color: Palette.primary, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 },
  link: { color: Palette.primary, fontWeight: "700", fontSize: 13, marginTop: Spacing.one },

  panel: { padding: Spacing.three, gap: Spacing.two },

  // Coverage card
  coverCard: {},
  coverInner: { padding: Spacing.three, gap: Spacing.two },
  coverHead: { gap: Spacing.two },
  coverHeadRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Palette.surfaceMuted,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 999, backgroundColor: Palette.primary },
  topicList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Glass.borderSoft,
    paddingTop: Spacing.two,
  },
  topicRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  topicEmoji: { fontSize: 20 },
  topicBody: { flex: 1 },
  topicTitle: { color: Palette.ink, fontWeight: "600" },
  topicSubject: {},
  practiceBtn: {
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  practiceText: { color: Palette.primary, fontSize: 13, fontWeight: "700" },
  doneTag: {
    backgroundColor: Palette.secondarySoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  doneTagText: { color: Palette.secondary, fontSize: 12, fontWeight: "800" },

  // Heatmap (GitHub-style: week columns × 7 day rows)
  heatGrid: { flexDirection: "row", gap: HEAT_GAP, justifyContent: "center" },
  heatCol: { gap: HEAT_GAP },
  heatCell: { width: HEAT_CELL, height: HEAT_CELL, borderRadius: 3 },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    marginTop: Spacing.two,
  },
  legendText: { color: Palette.inkMuted, fontSize: 11, fontWeight: "600" },
  legendCell: { width: 11, height: 11, borderRadius: 3 },
  activityStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Glass.borderSoft,
  },
  activityStat: { flex: 1, alignItems: "center", gap: 2 },
  activityValue: { fontSize: 22, fontWeight: "800", color: Palette.ink },
  activityDivider: { width: 1, alignSelf: "stretch", backgroundColor: Palette.border },

  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
