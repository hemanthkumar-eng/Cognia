import { Image } from "expo-image";
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

type FocusTarget = null | "email" | "password";

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const completeAuth = useAppStore((s) => s.completeAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<FocusTarget>(null);

  // Placeholder auth. Real Supabase email/OAuth calls land here later; for now
  // every path just marks the user authed and continues to profile setup.
  function proceed() {
    completeAuth();
    router.replace("/onboarding");
  }

  const canSubmit = email.trim().length > 3 && password.length >= 8;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
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
          {/* Brand + heading — centred lockup */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/logos/brain.svg")}
                style={styles.logoMark}
                contentFit="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
            <ThemedText style={styles.wordmark}>{t("appName")}</ThemedText>
            <ThemedText style={styles.title}>{t("auth.createTitle")}</ThemedText>
            <ThemedText style={styles.subtitle}>{t("auth.subtitle")}</ThemedText>
          </View>

          {/* Social auth */}
          <View style={styles.social}>
            <SocialButton
              label={t("auth.continueGoogle")}
              mark={
                <Image
                  source={require("../../assets/logos/google.svg")}
                  style={styles.googleMark}
                  contentFit="contain"
                  accessibilityIgnoresInvertColors
                />
              }
              onPress={proceed}
            />
            {Platform.OS === "ios" && (
              <SocialButton
                label={t("auth.continueApple")}
                mark={
                  <Image
                    source={require("../../assets/logos/apple.svg")}
                    style={styles.appleMark}
                    contentFit="contain"
                    accessibilityIgnoresInvertColors
                  />
                }
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
              style={[styles.input, focused === "email" && styles.inputFocused]}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor={Palette.inkMuted}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
            />
          </Field>

          <Field label={t("auth.password")}>
            {/* The TextInput itself is the full-size box (so its native hit
                target covers the whole field); the Show/Hide button floats
                over its right edge. */}
            <View style={styles.passwordWrap}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlush,
                  focused === "password" && styles.inputFocused,
                ]}
                placeholder={t("auth.passwordPlaceholder")}
                placeholderTextColor={Palette.inkMuted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
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
      {/* Icon is absolutely positioned so the label stays optically centred. */}
      <View style={styles.socialMark}>{mark}</View>
      <ThemedText style={styles.socialText}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.surface },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },

  // Brand + heading
  header: { alignItems: "center", gap: Spacing.two, marginBottom: Spacing.two },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 17,
    // Soft coloured shadow under the gradient tile (the tile itself is drawn
    // inside the SVG, so this View is just the shadow caster).
    backgroundColor: "#1E3A8A",
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  logoMark: { width: 64, height: 64 },
  wordmark: {
    color: Palette.inkMuted,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: Spacing.one,
  },
  title: {
    color: Palette.ink,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    color: Palette.inkMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
  },

  // Social
  social: { gap: Spacing.two },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: Radius.md - 2,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  socialMark: { position: "absolute", left: Spacing.four, width: 22, alignItems: "center" },
  socialText: { color: Palette.ink, fontSize: 15, fontWeight: "600" },
  googleMark: { width: 20, height: 20 },
  appleMark: { width: 19, height: 22, marginTop: -2 },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginVertical: Spacing.one,
  },
  line: { flex: 1, height: 1, backgroundColor: Palette.border },
  dividerText: { color: Palette.inkMuted, fontSize: 13, fontWeight: "600" },

  // Fields
  field: { gap: Spacing.one + 2 },
  label: { color: Palette.inkSoft, fontSize: 13, fontWeight: "600", letterSpacing: 0.1 },
  input: {
    height: 54,
    borderRadius: Radius.md - 2,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceMuted,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    color: Palette.ink,
  },
  inputFocused: {
    borderColor: Palette.primary,
    backgroundColor: Palette.surface,
    shadowColor: Palette.primary,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  passwordWrap: { position: "relative", justifyContent: "center" },
  inputFlush: { paddingRight: 76 },
  showToggle: { position: "absolute", right: Spacing.three },
  showText: { color: Palette.primary, fontSize: 13, fontWeight: "700" },

  // CTA
  cta: {
    height: 54,
    borderRadius: Radius.md - 2,
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
    maxWidth: 320,
    alignSelf: "center",
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
