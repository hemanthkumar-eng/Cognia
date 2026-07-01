import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Brand, Radius } from "@/lib/ui";

// Push-to-talk: press and hold to record, release to send.
// Disabled while the tutor is thinking/speaking so turns don't overlap.
export function MicButton({
  onStart,
  onStop,
  disabled,
  active,
}: {
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPressIn={() => !disabled && onStart()}
        onPressOut={() => !disabled && onStop()}
        disabled={disabled}
        style={[
          styles.button,
          active && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        hitSlop={12}
      >
        <ThemedText style={styles.icon}>{active ? "●" : "🎤"}</ThemedText>
      </Pressable>
    </View>
  );
}

const SIZE = 88;

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonActive: { backgroundColor: Brand.accent, transform: [{ scale: 1.08 }] },
  buttonDisabled: { opacity: 0.4 },
  icon: { fontSize: 34, color: "#ffffff" },
});
