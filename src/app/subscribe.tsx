import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { GlassBackground } from "@/components/Glass";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import {
  GRADES,
  TIERS,
  formatRupees,
  tierInfo,
  type TierInfo,
} from "@/lib/subscription";
import type { SubscriptionTier } from "@/lib/types";
import { Glass, Palette, Radius } from "@/lib/ui";

const GRID_COLS = 4;
const GRID_GAP = Spacing.two;

// Plan + class picker. Reused in two contexts:
//   • sign-up flow  → CTA continues to profile setup
//   • settings      → `?from=settings`, CTA saves and returns to Settings
// Basic holds a single class; multi-class is gated behind Premium.
export default function Subscribe() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const manage = from === "settings";

  const existing = useAppStore((s) => s.subscription);
  const setSubscription = useAppStore((s) => s.setSubscription);

  const [tier, setTier] = useState<SubscriptionTier>(existing?.tier ?? "basic");
  const [grades, setGrades] = useState<number[]>(existing?.grades ?? []);

  const info = tierInfo(tier);
  const canSubmit = grades.length > 0;

  // Size the class cells to a 4-across grid that fills the content width
  // (screen − horizontal padding − the 3 gaps between columns).
  const { width } = useWindowDimensions();
  const cellSize = Math.floor(
    (width - Spacing.four * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS,
  );

  function selectTier(next: SubscriptionTier) {
    if (next === tier) return;
    setTier(next);
    // Basic holds one class — collapse any extra selection when downgrading.
    if (!tierInfo(next).multiGrade) setGrades((cur) => cur.slice(0, 1));
  }

  function toggleGrade(grade: number) {
    setGrades((cur) => {
      const has = cur.includes(grade);
      if (!info.multiGrade) {
        // Basic: single-select — tapping another class swaps it.
        return has ? [] : [grade];
      }
      return has
        ? cur.filter((g) => g !== grade)
        : [...cur, grade].sort((a, b) => a - b);
    });
  }

  function promptUpgrade() {
    Alert.alert(t("subscribe.upgradeTitle"), t("subscribe.upgradeBody"), [
      { text: t("subscribe.cancel"), style: "cancel" },
      { text: t("subscribe.upgradeCta"), onPress: () => selectTier("premium") },
    ]);
  }

  function commit() {
    setSubscription({ tier, grades });
    router.replace(manage ? "/settings" : "/onboarding");
  }

  const countLabel =
    grades.length === 1
      ? t("subscribe.oneClass")
      : t("subscribe.classCount", { count: grades.length });

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {t(manage ? "subscribe.manageTitle" : "subscribe.title")}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t(manage ? "subscribe.manageSubtitle" : "subscribe.subtitle")}
          </ThemedText>
        </View>

        {/* Plan tiers */}
        <View style={styles.tiers}>
          {TIERS.map((tierData) => (
            <TierCard
              key={tierData.id}
              tier={tierData}
              selected={tier === tierData.id}
              onPress={() => selectTier(tierData.id)}
            />
          ))}
        </View>

        {/* Class picker */}
        <View style={styles.gradeSection}>
          <View style={styles.gradeHeader}>
            <ThemedText style={styles.sectionTitle}>
              {t(info.multiGrade ? "subscribe.selectGrades" : "subscribe.selectGrade")}
            </ThemedText>
            {!info.multiGrade && (
              <Pressable onPress={promptUpgrade} hitSlop={8} accessibilityRole="button">
                <ThemedText style={styles.addMore}>+ {t("subscribe.tierPremium")}</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.gradeGrid}>
            {GRADES.map((grade) => (
              <GradeChip
                key={grade}
                grade={grade}
                selected={grades.includes(grade)}
                multi={info.multiGrade}
                size={cellSize}
                onPress={() => toggleGrade(grade)}
              />
            ))}
          </View>

          <ThemedText style={styles.note}>
            {t(info.multiGrade ? "subscribe.premiumNote" : "subscribe.basicNote")}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Sticky summary + CTA */}
      <View style={styles.footer}>
        <View style={styles.summary}>
          <ThemedText style={styles.summaryLabel}>{t("subscribe.totalLabel")}</ThemedText>
          <View style={styles.summaryRight}>
            <ThemedText style={styles.price}>
              {formatRupees(info.priceMonthly)}
              <ThemedText style={styles.perMonth}>{t("subscribe.perMonth")}</ThemedText>
            </ThemedText>
            {canSubmit && <ThemedText style={styles.summaryCount}>{countLabel}</ThemedText>}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          onPress={commit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.cta,
            !canSubmit && styles.ctaDisabled,
            pressed && canSubmit && styles.pressed,
          ]}
        >
          <ThemedText style={styles.ctaText}>
            {t(manage ? "subscribe.save" : "subscribe.continue")}
          </ThemedText>
        </Pressable>
      </View>
      </SafeAreaView>
    </GlassBackground>
  );
}

function TierCard({
  tier,
  selected,
  onPress,
}: {
  tier: TierInfo;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const name = t(tier.id === "premium" ? "subscribe.tierPremium" : "subscribe.tierBasic");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.tierCard,
        selected && styles.tierCardSelected,
        pressed && styles.pressed,
      ]}
    >
      {tier.highlight && (
        <View style={styles.ribbon}>
          <ThemedText style={styles.ribbonText}>{t("subscribe.mostPopular")}</ThemedText>
        </View>
      )}

      <View style={styles.tierTop}>
        <View style={styles.tierNameWrap}>
          <View style={[styles.radio, selected && styles.radioOn]}>
            {selected && <View style={styles.radioDot} />}
          </View>
          <ThemedText style={styles.tierName}>{name}</ThemedText>
        </View>
        <ThemedText style={styles.tierPrice}>
          {formatRupees(tier.priceMonthly)}
          <ThemedText style={styles.tierPerMonth}>{t("subscribe.perMonth")}</ThemedText>
        </ThemedText>
      </View>

      <View style={styles.featureList}>
        {tier.featureKeys.map((key) => (
          <View key={key} style={styles.featureRow}>
            <View style={styles.check}>
              <ThemedText style={styles.checkMark}>✓</ThemedText>
            </View>
            <ThemedText style={styles.featureText}>
              {t(`subscribe.features.${key}`)}
            </ThemedText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function GradeChip({
  grade,
  selected,
  multi,
  size,
  onPress,
}: {
  grade: number;
  selected: boolean;
  multi: boolean; // Premium multi-select → show a check badge
  size: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? "checkbox" : "radio"}
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={t("subscribe.gradeShort", { grade })}
      style={({ pressed }) => [
        styles.gradeChip,
        { width: size, height: size },
        selected && styles.gradeChipSelected,
        pressed && styles.pressed,
      ]}
    >
      {multi && selected && (
        <View style={styles.checkBadge}>
          <ThemedText style={styles.checkBadgeText}>✓</ThemedText>
        </View>
      )}
      <ThemedText style={[styles.gradeCap, selected && styles.gradeCapSelected]}>
        {t("subscribe.classTag")}
      </ThemedText>
      <ThemedText style={[styles.gradeNum, selected && styles.gradeNumSelected]}>
        {grade}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  content: { padding: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.four },

  header: { gap: Spacing.two },
  title: { color: Palette.ink, fontSize: 28, fontWeight: "700", letterSpacing: -0.4 },
  subtitle: { color: Palette.inkMuted, fontSize: 15, lineHeight: 22, maxWidth: 320 },

  // Tiers
  tiers: { gap: Spacing.three },
  tierCard: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Glass.border,
    backgroundColor: Glass.tint,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  tierCardSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primarySoft,
    shadowColor: Palette.primary,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ribbon: {
    position: "absolute",
    top: -10,
    right: Spacing.three,
    backgroundColor: Palette.secondary,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  ribbonText: { color: Palette.white, fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },

  tierTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tierNameWrap: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Palette.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: Palette.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.primary },
  tierName: { color: Palette.ink, fontSize: 18, fontWeight: "700" },
  tierPrice: { color: Palette.ink, fontSize: 20, fontWeight: "800" },
  tierPerMonth: { color: Palette.inkMuted, fontSize: 13, fontWeight: "600" },

  featureList: { gap: Spacing.one + 2 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: Palette.secondary, fontSize: 12, fontWeight: "800", lineHeight: 14 },
  featureText: { color: Palette.inkSoft, fontSize: 14 },

  // Classes
  gradeSection: { gap: Spacing.three },
  gradeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: Palette.ink, fontSize: 16, fontWeight: "700" },
  addMore: { color: Palette.primary, fontSize: 13, fontWeight: "700" },
  gradeGrid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  gradeChip: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Glass.border,
    backgroundColor: Glass.tint,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  gradeChipSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gradeCap: {
    color: Palette.inkMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gradeCapSelected: { color: "rgba(255,255,255,0.8)" },
  gradeNum: { color: Palette.ink, fontSize: 22, fontWeight: "800", lineHeight: 26 },
  gradeNumSelected: { color: Palette.white },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadgeText: { color: Palette.primary, fontSize: 11, fontWeight: "900", lineHeight: 13 },
  note: { color: Palette.inkMuted, fontSize: 13, lineHeight: 19 },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: Glass.border,
    backgroundColor: Glass.tintStrong,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },
  summary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryLabel: { color: Palette.inkMuted, fontSize: 14, fontWeight: "600" },
  summaryRight: { alignItems: "flex-end" },
  price: { color: Palette.ink, fontSize: 22, fontWeight: "800" },
  perMonth: { color: Palette.inkMuted, fontSize: 13, fontWeight: "600" },
  summaryCount: { color: Palette.inkMuted, fontSize: 12, fontWeight: "600" },

  cta: {
    height: 54,
    borderRadius: Radius.md - 2,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.primary,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaDisabled: { backgroundColor: Palette.borderStrong, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: Palette.white, fontSize: 16, fontWeight: "700" },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
