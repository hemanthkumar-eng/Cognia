import { useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Brand, Palette, Radius } from "@/lib/ui";
import type { Message } from "@/lib/types";

// The on-screen caption area: every spoken line from both the student and the
// tutor, as chat bubbles. Auto-scrolls to the newest line. While the tutor is
// working out a reply, a "typing…" bubble keeps the conversation feeling live.
export function Transcript({
  messages,
  pending,
  emptyHint,
  liveUserText,
}: {
  messages: Message[];
  pending?: boolean;
  emptyHint?: string;
  // Live (not-yet-committed) student caption during streaming STT — shown as a
  // dimmed provisional bubble that firms up into a real message on commit.
  liveUserText?: string;
}) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    // Defer so layout has happened before we scroll.
    const t = setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages.length, pending, liveUserText]);

  if (messages.length === 0 && !pending && !liveUserText && emptyHint) {
    return (
      <View style={styles.empty}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
          {emptyHint}
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      ref={ref}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((m) => (
        <View
          key={m.id}
          style={[
            styles.row,
            m.speaker === "user" ? styles.rowUser : styles.rowTutor,
          ]}
        >
          <View
            style={[
              styles.bubble,
              m.speaker === "user" ? styles.bubbleUser : styles.bubbleTutor,
            ]}
          >
            <ThemedText
              style={m.speaker === "user" ? styles.userText : undefined}
            >
              {m.text}
            </ThemedText>
          </View>
        </View>
      ))}

      {liveUserText ? (
        <View style={[styles.row, styles.rowUser]}>
          <View style={[styles.bubble, styles.bubbleUser, styles.bubbleLive]}>
            <ThemedText style={styles.userText}>{liveUserText}</ThemedText>
          </View>
        </View>
      ) : null}

      {pending && (
        <View style={[styles.row, styles.rowTutor]}>
          <View style={[styles.bubble, styles.bubbleTutor, styles.typingBubble]}>
            <TypingDots />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// Three dots that fade in sequence — the classic "typing" cue.
function TypingDots() {
  const [dots] = useState(() => [
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(d, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dots}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, alignSelf: "stretch" },
  content: { gap: Spacing.two, paddingVertical: Spacing.three },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.four },
  emptyText: { textAlign: "center" },
  row: { flexDirection: "row" },
  rowUser: { justifyContent: "flex-end" },
  rowTutor: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  bubbleUser: { backgroundColor: Brand.bubbleUser, borderBottomRightRadius: 4 },
  bubbleLive: { opacity: 0.6 },
  bubbleTutor: { backgroundColor: Brand.bubbleTutor, borderBottomLeftRadius: 4 },
  userText: { color: "#ffffff" },
  typingBubble: { flexDirection: "row", alignItems: "center" },
  dots: { flexDirection: "row", gap: 5, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Palette.inkMuted },
});
