import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { BottomNav } from "@/components/BottomNav";
import { GlassBackground, GlassView } from "@/components/Glass";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { clearServerHistory } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatRupees, tierInfo } from "@/lib/subscription";
import { Brand, Glass, Palette, Radius } from "@/lib/ui";

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const subscription = useAppStore((s) => s.subscription);
  const logout = useAppStore((s) => s.logout);
  const resetConversation = useAppStore((s) => s.resetConversation);
  const resetAll = useAppStore((s) => s.resetAll);

  function onClearHistory() {
    const oldSession = resetConversation();
    clearServerHistory(oldSession);
    Alert.alert(t("settings.clearHistory"), t("settings.clearHistoryDone"));
  }

  function onLogout() {
    Alert.alert(t("settings.logout"), t("settings.logoutConfirm"), [
      { text: t("settings.cancel"), style: "cancel" },
      {
        text: t("settings.confirmLogout"),
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/signup");
        },
      },
    ]);
  }

  function onReset() {
    Alert.alert(t("settings.reset"), t("settings.resetConfirm"), [
      { text: t("settings.cancel"), style: "cancel" },
      {
        text: t("settings.confirmReset"),
        style: "destructive",
        onPress: () => {
          resetAll();
          router.replace("/signup");
        },
      },
    ]);
  }

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t("settings.title")}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">{t("settings.subscription")}</ThemedText>
            <Pressable
              onPress={() =>
                router.push({ pathname: "/subscribe", params: { from: "settings" } })
              }
              accessibilityRole="button"
            >
              <GlassView radius={Radius.md}>
                <View style={styles.planInner}>
                  {subscription ? (
                    <View style={styles.planInfo}>
                      <View style={styles.planTop}>
                        <ThemedText style={styles.planName}>
                          {t(
                            subscription.tier === "premium"
                              ? "settings.planPremium"
                              : "settings.planBasic",
                          )}
                        </ThemedText>
                        <ThemedText style={styles.planPrice}>
                          {formatRupees(tierInfo(subscription.tier).priceMonthly)}
                          <ThemedText style={styles.planPerMonth}>
                            {t("subscribe.perMonth")}
                          </ThemedText>
                        </ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {t("settings.classesLabel")}:{" "}
                        {subscription.grades.length
                          ? subscription.grades.join(", ")
                          : t("settings.noPlan")}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.choosePlan}>
                      {t("settings.choosePlan")}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.manageLink}>{t("settings.managePlan")}</ThemedText>
                </View>
              </GlassView>
            </Pressable>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">{t("settings.language")}</ThemedText>
            <View style={styles.langRow}>
              <View style={[styles.langChip, styles.langActive]}>
                <ThemedText style={styles.langActiveText}>English</ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {t("settings.comingSoon")}
              </ThemedText>
            </View>
          </View>

          <GlassView radius={Radius.md}>
            <View style={styles.group}>
              <Pressable style={styles.item} onPress={() => router.replace("/onboarding")}>
                <ThemedText>{t("settings.editProfile")}</ThemedText>
              </Pressable>

              <Pressable style={styles.item} onPress={onClearHistory}>
                <ThemedText>{t("settings.clearHistory")}</ThemedText>
              </Pressable>

              <Pressable style={styles.item} onPress={onLogout}>
                <ThemedText>{t("settings.logout")}</ThemedText>
              </Pressable>

              <Pressable style={[styles.item, styles.itemLast]} onPress={onReset}>
                <ThemedText style={styles.dangerText}>{t("settings.reset")}</ThemedText>
              </Pressable>
            </View>
          </GlassView>
        </View>

        <BottomNav active="settings" />
      </SafeAreaView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  content: { flex: 1, padding: Spacing.four },
  header: {
    marginBottom: Spacing.four,
  },
  title: { fontSize: 34, lineHeight: 40 },
  group: { paddingHorizontal: Spacing.three },
  section: { gap: Spacing.two, marginBottom: Spacing.four },
  planInner: { padding: Spacing.three, gap: Spacing.two },
  planInfo: { gap: Spacing.one },
  planTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: { color: Palette.ink, fontSize: 17, fontWeight: "700" },
  planPrice: { color: Palette.ink, fontSize: 17, fontWeight: "800" },
  planPerMonth: { color: Palette.inkMuted, fontSize: 12, fontWeight: "600" },
  choosePlan: { color: Palette.ink, fontSize: 16, fontWeight: "600" },
  manageLink: {
    color: Palette.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: Spacing.one,
  },
  langRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  langChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Glass.border,
  },
  langActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  langActiveText: { color: Palette.white },
  item: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Glass.borderSoft,
  },
  itemLast: { borderBottomWidth: 0 },
  dangerText: { color: Palette.danger },
});
