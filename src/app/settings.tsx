import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { clearServerHistory } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Brand, Radius } from "@/lib/ui";

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const resetConversation = useAppStore((s) => s.resetConversation);
  const resetAll = useAppStore((s) => s.resetAll);

  function onClearHistory() {
    const oldSession = resetConversation();
    clearServerHistory(oldSession);
    Alert.alert(t("settings.clearHistory"), "✓");
  }

  function onReset() {
    Alert.alert(t("settings.reset"), "?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: () => {
          resetAll();
          router.replace("/onboarding");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{t("settings.title")}</ThemedText>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ThemedText type="link">✕</ThemedText>
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

      <Pressable style={styles.item} onPress={() => router.replace("/onboarding")}>
        <ThemedText>{t("settings.editProfile")}</ThemedText>
      </Pressable>

      <Pressable style={styles.item} onPress={onClearHistory}>
        <ThemedText>{t("settings.clearHistory")}</ThemedText>
      </Pressable>

      <Pressable style={[styles.item, styles.danger]} onPress={onReset}>
        <ThemedText style={styles.dangerText}>{t("settings.reset")}</ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: Spacing.four },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  section: { gap: Spacing.two, marginBottom: Spacing.four },
  langRow: { flexDirection: "row", alignItems: "center", gap: Spacing.three },
  langChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "#D5D8DC",
  },
  langActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  langActiveText: { color: "#fff" },
  item: {
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#D5D8DC",
  },
  danger: {},
  dangerText: { color: "#B3261E" },
});
