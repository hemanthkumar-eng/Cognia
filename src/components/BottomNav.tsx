import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppIcon, type IconName } from "@/components/AppIcon";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Palette } from "@/lib/ui";

type TabKey = "home" | "tracking" | "settings";

const TABS: { key: TabKey; icon: IconName; route: Href; labelKey: string }[] = [
  { key: "home", icon: "home", route: "/home", labelKey: "nav.home" },
  { key: "tracking", icon: "tracking", route: "/tracking", labelKey: "nav.progress" },
  { key: "settings", icon: "settings", route: "/settings", labelKey: "nav.settings" },
];

// Modern bottom navigation shared by the three primary screens (Home, Progress,
// Settings). Uses router.replace so the tabs swap in place rather than stacking.
export function BottomNav({ active }: { active: TabKey }) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? Palette.primary : Palette.inkMuted;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              if (!isActive) router.replace(tab.route);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t(tab.labelKey)}
            style={styles.item}
            hitSlop={8}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <AppIcon name={tab.icon} size={22} color={color} />
            </View>
            <ThemedText style={[styles.label, { color }]}>{t(tab.labelKey)}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  iconWrap: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one + 1,
    borderRadius: 999,
  },
  iconWrapActive: { backgroundColor: Palette.primarySoft },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
});
