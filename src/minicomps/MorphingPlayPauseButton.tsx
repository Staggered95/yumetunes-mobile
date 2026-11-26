import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/context/ThemeContext";

interface MorphingPlayPauseButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const PLAY_PATH = "M 7 5 L 7 19 L 19 12 Z";
const PAUSE_PATH = "M 6 5 L 10 5 L 10 19 L 6 19 Z M 14 5 L 18 5 L 18 19 L 14 19 Z";

export default function MorphingPlayPauseButton({
  isPlaying,
  onToggle,
}: MorphingPlayPauseButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scaleAnim.setValue(0.8);
    Animated.spring(scaleAnim, {
      toValue: 1,
      stiffness: 260,
      damping: 18,
      useNativeDriver: true,
    }).start();
  }, [isPlaying, scaleAnim]);

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={6}
      accessibilityLabel={isPlaying ? "Pause" : "Play"}
      className="h-9 w-9 items-center justify-center active:opacity-80"
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d={isPlaying ? PAUSE_PATH : PLAY_PATH}
            fill={colors["--txt-primary"]}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}