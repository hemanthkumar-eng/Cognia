import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Brand } from "@/lib/ui";
import type { MascotState } from "@/lib/types";

// The Cognia owl mascot. For the MVP scaffold this is a pure-Animated
// placeholder so the app runs with zero extra assets. To get the Duolingo feel,
// swap this for a Lottie animation (lottie-react-native is already installed):
//   <LottieView source={require('@/assets/mascot.json')} autoPlay loop />
// driven by `state`, or a Rive state-machine. The state prop already models
// idle / listening / thinking / speaking / celebrate.

const FACE: Record<MascotState, string> = {
  idle: "🦉",
  listening: "🦉",
  thinking: "🤔",
  speaking: "🦉",
  celebrate: "🥳",
};

const RING_COLOR: Record<MascotState, string> = {
  idle: "transparent",
  listening: Brand.accent,
  thinking: Brand.primary,
  speaking: Brand.good,
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
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={[styles.wrap, { width: size * 1.7, height: size * 1.7 }]}>
      {state !== "idle" && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: RING_COLOR[state],
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.body,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.5 }}>{FACE[state]}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 4 },
  body: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F4FE",
  },
});
