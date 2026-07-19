import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { BottomNav } from "@/components/BottomNav";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { clearServerHistory } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Brand, Palette, Radius } from "@/lib/ui";

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const resetConversation = useAppStore((s) => s.resetConversation);
  const resetAll = useAppStore((s) => s.resetAll);

  function onClearHistory() {
    const oldSession = resetConversation();
    clearServerHistory(oldSession);
    Alert.alert(t("settings.clearHistory"), t("settings.clearHistoryDone"));
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t("settings.title")}
          </ThemedText>
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

        <View style={styles.group}>
          <Pressable style={styles.item} onPress={() => router.replace("/onboarding")}>
            <ThemedText>{t("settings.editProfile")}</ThemedText>
          </Pressable>

          <Pressable style={styles.item} onPress={onClearHistory}>
            <ThemedText>{t("settings.clearHistory")}</ThemedText>
          </Pressable>

          <Pressable style={styles.item} onPress={onReset}>
            <ThemedText style={styles.dangerText}>{t("settings.reset")}</ThemedText>
          </Pressable>
        </View>
      </View>

      <BottomNav active="settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.four },
  header: {
    marginBottom: Spacing.four,
  },
  title: { fontSize: 34, lineHeight: 40 },
  group: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.three,
  },
  section: { gap: Spacing.two, marginBottom: Spacing.four },
  langRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  langChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  langActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  langActiveText: { color: Palette.white },
  item: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.border,
  },
  dangerText: { color: Palette.danger },
});
