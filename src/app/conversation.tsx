import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { Mascot } from "@/components/Mascot";
import { MicButton } from "@/components/MicButton";
import { ThemedText } from "@/components/themed-text";
import { Transcript } from "@/components/Transcript";
import { Spacing } from "@/constants/theme";
import { converse } from "@/lib/api";
import { playBase64Wav, useVoiceRecorder } from "@/lib/audio";
import { STREAMING_ENABLED } from "@/lib/config";
import { useStreamingSession, type StreamHandlers } from "@/lib/streaming";
import { useAppStore } from "@/lib/store";
import type { MascotState } from "@/lib/types";
import { Brand, Palette, Radius } from "@/lib/ui";

let idCounter = 0;
const nextId = () => `m_${Date.now()}_${idCounter++}`;

const TURN_XP = 10;
const FINISH_XP = 50;

type TurnInput = { audioUri?: string; text?: string; opening?: boolean };

export default function Conversation() {
  const { t } = useTranslation();
  const router = useRouter();
  const recorder = useVoiceRecorder();

  const params = useLocalSearchParams<{ scenarioId?: string; title?: string }>();
  const scenarioId = typeof params.scenarioId === "string" ? params.scenarioId : undefined;
  const title = typeof params.title === "string" ? params.title : undefined;

  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const resetConversation = useAppStore((s) => s.resetConversation);
  const recordActivity = useAppStore((s) => s.recordActivity);
  const completeScenario = useAppStore((s) => s.completeScenario);

  const [mascot, setMascot] = useState<MascotState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const [draft, setDraft] = useState("");
  const [partial, setPartial] = useState(""); // live STT caption (streaming mode)
  const disposeRef = useRef<(() => void) | null>(null);
  const expectingOpeningRef = useRef(false); // skip XP for the tutor's opening line
  const lastReplyRef = useRef(""); // reply text, for playback duration

  // Play a base64 WAV reply and cycle the mascot speaking → idle. Shared by the
  // turn-based mutation and the streaming session.
  const playReply = useCallback(async (base64: string, replyText: string) => {
    try {
      disposeRef.current?.();
      disposeRef.current = await playBase64Wav(base64);
      setMascot("speaking");
      const ms = Math.min(12000, 1500 + replyText.length * 60);
      setTimeout(() => setMascot("idle"), ms);
    } catch {
      setMascot("idle");
    }
  }, []);

  // --- Turn-based path (record → upload → STT/LLM/TTS) ---
  const mutation = useMutation({
    // Read sessionId/profile fresh so a reset right before an opening turn is honoured.
    mutationFn: (input: TurnInput) => {
      const { sessionId, profile } = useAppStore.getState();
      return converse({ sessionId, profile, scenarioId, ...input });
    },
    onMutate: () => {
      setError(null);
      setMascot("thinking");
    },
    onSuccess: async (res, variables) => {
      if (res.userText) {
        addMessage({ id: nextId(), speaker: "user", text: res.userText });
      }
      addMessage({ id: nextId(), speaker: "tutor", text: res.replyText });
      if (!variables.opening) recordActivity(TURN_XP);
      await playReply(res.audioBase64, res.replyText);
    },
    onError: (err: unknown) => {
      setMascot("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    },
  });

  // --- Streaming path (live PCM → WebSocket → live captions) ---
  const streamHandlers = useMemo<StreamHandlers>(
    () => ({
      onPartial: (text) => setPartial(text),
      onFinal: (text) => {
        setPartial("");
        if (text) addMessage({ id: nextId(), speaker: "user", text });
      },
      onReply: (text) => {
        lastReplyRef.current = text;
        addMessage({ id: nextId(), speaker: "tutor", text });
        if (expectingOpeningRef.current) expectingOpeningRef.current = false;
        else recordActivity(TURN_XP);
      },
      onAudio: (base64) => {
        void playReply(base64, lastReplyRef.current);
      },
      onState: (state) => setMascot(state),
      onError: (message) => {
        setPartial("");
        setMascot("idle");
        setError(message);
      },
    }),
    [addMessage, recordActivity, playReply],
  );
  const stream = useStreamingSession(streamHandlers);

  // Kick off the conversation. For a lesson we start fresh; the tutor speaks first.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const opening = scenarioId ? true : messages.length === 0;
    if (scenarioId) resetConversation();

    if (STREAMING_ENABLED) {
      if (opening) expectingOpeningRef.current = true;
      const { sessionId, profile } = useAppStore.getState();
      stream.connect({ sessionId, profile, scenarioId, opening }).catch((e) => {
        setError(e instanceof Error ? e.message : "Could not connect to the tutor.");
      });
    } else if (opening) {
      mutation.mutate({ opening: true });
    }

    return () => disposeRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStart() {
    try {
      setError(null);
      setPartial("");
      setMascot("listening");
      if (STREAMING_ENABLED) await stream.startTurn();
      else await recorder.start();
    } catch (e) {
      setMascot("idle");
      setError(e instanceof Error ? e.message : "Could not start recording.");
    }
  }

  async function handleStop() {
    try {
      if (STREAMING_ENABLED) {
        setMascot("thinking");
        await stream.endTurn();
        return;
      }
      const uri = await recorder.stop();
      if (!uri) {
        setMascot("idle");
        return;
      }
      mutation.mutate({ audioUri: uri });
    } catch (e) {
      setMascot("idle");
      setError(e instanceof Error ? e.message : "Could not stop recording.");
    }
  }

  // Text fallback always uses the REST turn — it shares the same server session
  // as the streaming socket, so history stays consistent across both paths.
  function handleSendText() {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    mutation.mutate({ text });
  }

  function handleFinish() {
    if (scenarioId) {
      completeScenario(scenarioId);
      recordActivity(FINISH_XP);
    }
    setMascot("celebrate");
    setError(null);
    disposeRef.current?.();
    if (STREAMING_ENABLED) stream.disconnect();
    setTimeout(() => router.back(), 1300);
  }

  const busy =
    mutation.isPending || mascot === "speaking" || mascot === "thinking";
  const stateLabel =
    mascot === "listening"
      ? t("conversation.listening")
      : mascot === "thinking"
        ? t("conversation.thinking")
        : mascot === "speaking"
          ? t("conversation.speaking")
          : mascot === "celebrate"
            ? t("conversation.wellDone")
            : t("conversation.idle");

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText type="link">‹ {t("conversation.back")}</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">
            {title ?? t("conversation.freeChat")}
          </ThemedText>
          {scenarioId ? (
            <Pressable onPress={handleFinish} hitSlop={12}>
              <ThemedText type="link" style={styles.finish}>
                {t("conversation.finish")}
              </ThemedText>
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <View style={styles.mascotRow}>
          <Mascot state={mascot} size={96} />
          <ThemedText type="smallBold" themeColor="textSecondary">
            {stateLabel}
          </ThemedText>
        </View>

        <Transcript
          messages={messages}
          pending={mutation.isPending || (STREAMING_ENABLED && mascot === "thinking")}
          liveUserText={partial}
          emptyHint={t("conversation.idle")}
        />

        {error && (
          <View style={styles.errorBox}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        )}

        {showText ? (
          <View style={styles.textRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message…"
              placeholderTextColor={Palette.inkMuted}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={handleSendText}
              returnKeyType="send"
            />
            <Pressable
              style={styles.sendBtn}
              onPress={handleSendText}
              disabled={busy}
            >
              <ThemedText style={styles.sendText}>
                {t("conversation.send")}
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.controls}>
            <MicButton
              onStart={handleStart}
              onStop={handleStop}
              disabled={busy}
              active={mascot === "listening"}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {t("conversation.tapToSpeak")}
            </ThemedText>
          </View>
        )}

        <Pressable
          onPress={() => setShowText((v) => !v)}
          style={styles.toggle}
          hitSlop={8}
        >
          <ThemedText type="link">
            {showText ? t("conversation.tapToSpeak") : t("conversation.typeInstead")}
          </ThemedText>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1, paddingHorizontal: Spacing.four },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
  },
  finish: { color: Brand.good, fontWeight: "700" },
  mascotRow: { alignItems: "center", gap: Spacing.one, paddingBottom: Spacing.two },
  errorBox: {
    backgroundColor: Palette.dangerSoft,
    borderRadius: Radius.sm,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  errorText: { color: Palette.danger },
  controls: { alignItems: "center", gap: Spacing.two, paddingVertical: Spacing.three },
  textRow: { flexDirection: "row", gap: Spacing.two, paddingVertical: Spacing.three },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    color: Palette.ink,
  },
  sendBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  sendText: { color: Palette.white, fontWeight: "700" },
  toggle: { alignItems: "center", paddingBottom: Spacing.two },
});
