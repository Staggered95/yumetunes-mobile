import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "@/context/ThemeContext";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
}

const SIZE_MAP: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export default function Spinner({ size = "sm", color }: SpinnerProps) {
  const { colors } = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const px = SIZE_MAP[size] ?? SIZE_MAP.sm;
  const strokeColor = color ?? colors["--acc-primary"];

  return (
    <Animated.View
      style={{ width: px, height: px, transform: [{ rotate }] }}
      className="items-center justify-center"
    >
      <Svg width={px} height={px} viewBox="0 0 24 24" fill="none">
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={strokeColor}
          strokeWidth="4"
          opacity={0.25}
        />
        <Path
          fill={strokeColor}
          opacity={0.85}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </Svg>
    </Animated.View>
  );
}