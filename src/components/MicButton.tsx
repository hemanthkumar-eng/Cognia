import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
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
  // Pulsing halo while recording so the mic feels "alive" and listening.
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    pulse.setValue(0);
    if (!active) return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <View style={styles.wrap}>
      {active && (
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: ringScale }], opacity: ringOpacity },
          ]}
        />
      )}
      <Pressable
        onPressIn={() => !disabled && onStart()}
        onPressOut={() => !disabled && onStop()}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={active ? "Recording, release to send" : "Hold to speak"}
        accessibilityState={{ disabled: !!disabled, busy: !!active }}
        style={({ pressed }) => [
          styles.button,
          active && styles.buttonActive,
          disabled && styles.buttonDisabled,
          pressed && !disabled && !active && styles.buttonPressed,
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
  ring: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Brand.accent,
  },
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
  buttonPressed: { transform: [{ scale: 0.94 }] },
  buttonDisabled: { opacity: 0.4 },
  icon: { fontSize: 34, color: "#ffffff" },
});
