import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Brand } from "@/lib/ui";
import type { MascotState } from "@/lib/types";

// The Cognia mascot: the brand's gradient "brain" mark that gently bobs, with a
// pulse ring whose colour reflects the current state (listening / thinking /
// speaking / celebrate). Emoji-free and on-brand. To get a richer character
// later, swap the <Image> for a Lottie/Rive animation driven by `state`.

const BRAIN = require("../../assets/logos/brain.svg");

const RING_COLOR: Record<MascotState, string> = {
  idle: "transparent",
  listening: Brand.accent,
  thinking: Brand.primary,
  speaking: Brand.accent,
  celebrate: Brand.accent,
};

export function Mascot({ state, size = 140 }: { state: MascotState; size?: number }) {
  const [bob] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  // Gentle idle bob — always running.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  // Active-state pulse ring (listening / thinking / speaking / celebrate).
  useEffect(() => {
    pulse.setValue(0);
    if (state === "idle") return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: state === "thinking" ? 900 : 1100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const radius = size * 0.28;

  return (
    <View style={[styles.wrap, { width: size * 1.7, height: size * 1.7 }]}>
      {state !== "idle" && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderColor: RING_COLOR[state],
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
      )}
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Image
          source={BRAIN}
          style={{ width: size, height: size }}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 4 },
});
