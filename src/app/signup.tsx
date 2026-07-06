import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import { Palette, Radius } from "@/lib/ui";

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const completeAuth = useAppStore((s) => s.completeAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Placeholder auth. Real Supabase email/OAuth calls land here later; for now
  // every path just marks the user authed and continues to profile setup.
  function proceed() {
    completeAuth();
    router.replace("/onboarding");
  }

  const canSubmit = email.trim().length > 3 && password.length >= 8;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand mark */}
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <ThemedText style={styles.logoGlyph}>C</ThemedText>
            </View>
            <ThemedText style={styles.wordmark}>Cognia</ThemedText>
          </View>

          <View style={styles.heading}>
            <ThemedText style={styles.title}>{t("auth.createTitle")}</ThemedText>
            <ThemedText style={styles.subtitle}>{t("auth.subtitle")}</ThemedText>
          </View>

          {/* Social auth */}
          <View style={styles.social}>
            <SocialButton
              label={t("auth.continueGoogle")}
              mark={<ThemedText style={styles.googleMark}>G</ThemedText>}
              onPress={proceed}
            />
            {Platform.OS === "ios" && (
              <SocialButton
                label={t("auth.continueApple")}
                mark={<ThemedText style={styles.appleMark}></ThemedText>}
                onPress={proceed}
              />
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <ThemedText style={styles.dividerText}>{t("auth.or")}</ThemedText>
            <View style={styles.line} />
          </View>

          {/* Email + password */}
          <Field label={t("auth.email")}>
            <TextInput
              style={styles.input}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor={Palette.inkMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
            />
          </Field>

          <Field label={t("auth.password")}>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.inputFlush]}
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor={Palette.inkMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
                style={styles.showToggle}
              >
                <ThemedText style={styles.showText}>
                  {showPassword ? t("auth.hide") : t("auth.show")}
                </ThemedText>
              </Pressable>
            </View>
          </Field>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("auth.createCta")}
            accessibilityState={{ disabled: !canSubmit }}
            onPress={proceed}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.cta,
              !canSubmit && styles.ctaDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            <ThemedText style={styles.ctaText}>{t("auth.createCta")}</ThemedText>
          </Pressable>

          <ThemedText style={styles.terms}>{t("auth.terms")}</ThemedText>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {t("auth.haveAccount")}{" "}
            </ThemedText>
            <Pressable onPress={proceed} hitSlop={8} accessibilityRole="button">
              <ThemedText style={styles.footerLink}>{t("auth.login")}</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// A labelled field wrapper — label above the control, consistent spacing.
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

function SocialButton({
  label,
  mark,
  onPress,
}: {
  label: string;
  mark: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
    >
      <View style={styles.socialMark}>{mark}</View>
      <ThemedText style={styles.socialText}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.surface },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },

  brandRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  logo: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm + 2,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: { color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 26 },
  wordmark: { color: Palette.ink, fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },

  heading: { gap: Spacing.one, marginTop: Spacing.three },
  title: { color: Palette.ink, fontSize: 28, fontWeight: "700", letterSpacing: -0.4 },
  subtitle: { color: Palette.inkMuted, fontSize: 15, lineHeight: 22 },

  social: { gap: Spacing.two, marginTop: Spacing.two },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    height: 52,
    borderRadius: Radius.md - 4,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  socialMark: { width: 22, alignItems: "center" },
  socialText: { color: Palette.ink, fontSize: 15, fontWeight: "600" },
  googleMark: { color: "#4285F4", fontSize: 18, fontWeight: "800" },
  appleMark: { color: Palette.ink, fontSize: 18, lineHeight: 20 },

  divider: { flexDirection: "row", alignItems: "center", gap: Spacing.two, marginVertical: Spacing.one },
  line: { flex: 1, height: 1, backgroundColor: Palette.border },
  dividerText: { color: Palette.inkMuted, fontSize: 13, fontWeight: "500" },

  field: { gap: Spacing.one + 2 },
  label: { color: Palette.inkSoft, fontSize: 13, fontWeight: "600", letterSpacing: 0.1 },
  input: {
    height: 52,
    borderRadius: Radius.md - 4,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceMuted,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    color: Palette.ink,
  },
  passwordRow: { position: "relative", justifyContent: "center" },
  inputFlush: { paddingRight: 68 },
  showToggle: { position: "absolute", right: Spacing.three },
  showText: { color: Palette.primary, fontSize: 13, fontWeight: "600" },

  cta: {
    height: 54,
    borderRadius: Radius.md - 4,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
    shadowColor: Palette.primary,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaDisabled: { backgroundColor: Palette.borderStrong, shadowOpacity: 0, elevation: 0 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  terms: {
    color: Palette.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: Spacing.one,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  footerText: { color: Palette.inkMuted, fontSize: 14 },
  footerLink: { color: Palette.primary, fontSize: 14, fontWeight: "700" },

  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
