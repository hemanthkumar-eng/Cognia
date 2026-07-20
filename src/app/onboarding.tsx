import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { GlassBackground } from "@/components/Glass";
import { Mascot } from "@/components/Mascot";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import type { Board, Level } from "@/lib/types";
import { Brand, Glass, Palette, Radius } from "@/lib/ui";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const BOARDS: Board[] = ["icse", "cbse"];
const INTEREST_KEYS = [
  "cricket",
  "space",
  "animals",
  "stories",
  "music",
  "science",
  "movies",
  "food",
  "games",
  "nature",
];

export default function Onboarding() {
  const { t } = useTranslation();
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  // Pre-fill from the saved profile so Settings → "Edit profile" keeps existing values.
  const profile = useAppStore((s) => s.profile);

  const [name, setName] = useState(profile.name === "friend" ? "" : profile.name);
  const [grade, setGrade] = useState(profile.grade ? String(profile.grade) : "");
  const [board, setBoard] = useState<Board | undefined>(profile.board);
  const [level, setLevel] = useState<Level>(profile.level);
  const [interests, setInterests] = useState<string[]>(profile.interests);

  function toggleInterest(key: string) {
    setInterests((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
    );
  }

  function onStart() {
    const parsedGrade = parseInt(grade, 10);
    completeOnboarding({
      name: name.trim() || "friend",
      grade: Number.isFinite(parsedGrade) ? parsedGrade : undefined,
      board,
      level,
      interests,
      language: "en-IN",
    });
    router.replace("/home");
  }

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Mascot state="celebrate" size={110} />
          <ThemedText type="subtitle" style={styles.title}>
            {t("onboarding.title")}
          </ThemedText>
        </View>

        <TextInput
          style={styles.input}
          placeholder={t("onboarding.namePlaceholder")}
          placeholderTextColor={Palette.inkMuted}
          value={name}
          onChangeText={setName}
        />

        <ThemedText type="smallBold">{t("onboarding.gradeLabel")}</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="1–12"
          placeholderTextColor={Palette.inkMuted}
          keyboardType="number-pad"
          value={grade}
          onChangeText={setGrade}
          maxLength={2}
        />

        <ThemedText type="smallBold">{t("onboarding.boardLabel")}</ThemedText>
        <View style={styles.row}>
          {BOARDS.map((b) => (
            <Chip
              key={b}
              label={t(`board.${b}`)}
              selected={board === b}
              onPress={() => setBoard(b)}
            />
          ))}
        </View>

        <ThemedText type="smallBold">{t("onboarding.levelLabel")}</ThemedText>
        <View style={styles.row}>
          {LEVELS.map((lv) => (
            <Chip
              key={lv}
              label={t(`onboarding.level${cap(lv)}`)}
              selected={level === lv}
              onPress={() => setLevel(lv)}
            />
          ))}
        </View>

        <ThemedText type="smallBold">{t("onboarding.interestsLabel")}</ThemedText>
        <View style={styles.wrapRow}>
          {INTEREST_KEYS.map((key) => (
            <Chip
              key={key}
              label={t(`interests.${key}`)}
              selected={interests.includes(key)}
              onPress={() => toggleInterest(key)}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("onboarding.start")}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={onStart}
        >
          <ThemedText style={styles.ctaText}>{t("onboarding.start")}</ThemedText>
        </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <ThemedText style={selected ? styles.chipTextSelected : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  content: { padding: Spacing.four, gap: Spacing.three },
  hero: { alignItems: "center", gap: Spacing.two, marginBottom: Spacing.two },
  title: { textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: Glass.border,
    borderRadius: Radius.md,
    backgroundColor: Glass.tint,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: Palette.ink,
  },
  row: { flexDirection: "row", gap: Spacing.two },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Glass.border,
    backgroundColor: Glass.tint,
  },
  chipSelected: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  chipTextSelected: { color: Palette.white },
  cta: {
    marginTop: Spacing.three,
    backgroundColor: Brand.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  ctaText: { color: Palette.white, fontSize: 18, fontWeight: "700" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});
