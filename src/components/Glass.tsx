import { BlurView, BlurTargetView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  createContext,
  useContext,
  useRef,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import { Glass, Radius } from "@/lib/ui";

type GlassTargetRef = RefObject<ComponentRef<typeof BlurTargetView> | null>;

// The backdrop that frosted glass refracts. On Android a BlurView can only blur a
// referenced BlurTargetView, so the background lives inside one and we hand its ref
// down through context; iOS blurs live and ignores the target.
const GlassTargetContext = createContext<GlassTargetRef | null>(null);

export function useGlassTarget() {
  return useContext(GlassTargetContext);
}

// Full-screen glass backdrop: a soft primary→emerald gradient with two colour
// pools, wrapped so descendant <GlassView>s can sample it. Use as a screen root.
export function GlassBackground({ children }: { children: ReactNode }) {
  const targetRef = useRef<ComponentRef<typeof BlurTargetView> | null>(null);
  return (
    <View style={styles.root}>
      <BlurTargetView ref={targetRef} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={Glass.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.blob, styles.blobTop, { backgroundColor: Glass.blobPrimary }]} />
        <View
          style={[styles.blob, styles.blobBottom, { backgroundColor: Glass.blobEmerald }]}
        />
      </BlurTargetView>
      <GlassTargetContext.Provider value={targetRef}>
        <View style={styles.fill}>{children}</View>
      </GlassTargetContext.Provider>
    </View>
  );
}

// A frosted glass surface. `radius`/`intensity` tunable; `tint` selects the white
// overlay strength. Always renders the translucent overlay + bright edge so it
// still reads as glass even if the platform can't blur.
export function GlassView({
  children,
  style,
  radius = Radius.md,
  intensity = Glass.intensity,
  tint = Glass.tint,
  border = true,
}: {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  radius?: number;
  intensity?: number;
  tint?: string;
  border?: boolean;
}) {
  const target = useGlassTarget();
  return (
    <View style={[styles.shadow, { borderRadius: radius }, style]}>
      <View style={[styles.clip, { borderRadius: radius }]}>
        <BlurView
          intensity={intensity}
          tint="light"
          blurMethod="dimezisBlurView"
          blurTarget={Platform.OS === "android" ? (target ?? undefined) : undefined}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: tint,
              borderRadius: radius,
              borderWidth: border ? 1 : 0,
              borderColor: Glass.border,
            },
          ]}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  fill: { flex: 1 },
  blob: { position: "absolute", width: 340, height: 340, borderRadius: 999 },
  blobTop: { top: -120, right: -110 },
  blobBottom: { bottom: -140, left: -120 },
  // Outer: casts the soft shadow (no clipping here so the shadow shows).
  shadow: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  // Middle: clips the blur + tint to the rounded corners.
  clip: { overflow: "hidden" },
});
