import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Brand, Radius } from "@/lib/ui";
import type { Message } from "@/lib/types";

// The on-screen caption area: every spoken line from both the student and the
// tutor, as chat bubbles. Auto-scrolls to the newest line.
export function Transcript({ messages }: { messages: Message[] }) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    // Defer so layout has happened before we scroll.
    const t = setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages.length]);

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, alignSelf: "stretch" },
  content: { gap: Spacing.two, paddingVertical: Spacing.three },
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
  bubbleTutor: { backgroundColor: Brand.bubbleTutor, borderBottomLeftRadius: 4 },
  userText: { color: "#ffffff" },
});
