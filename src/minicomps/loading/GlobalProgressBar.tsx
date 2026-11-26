import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoading } from "@/context/LoadingContext";

export default function GlobalProgressBar() {
  const { isLoading, progress } = useLoading();
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isLoading ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isLoading, opacity]);

  useEffect(() => {
    if (progress === 0) {
      widthAnim.setValue(0);
      return;
    }

    if (progress <= 15) {
      widthAnim.setValue(progress);
      return;
    }

    Animated.timing(widthAnim, {
      toValue: progress,
      duration: progress === 100 ? 400 : 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  if (!isLoading && progress === 0) return null;

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ top: insets.top, opacity }}
      className="absolute left-0 right-0 z-50 h-[2px]"
    >
      <Animated.View
        style={{ width: animatedWidth }}
        className="relative h-full bg-accent-primary"
      >
        <View className="absolute right-0 top-0 h-full w-6 bg-white/40" />
      </Animated.View>
    </Animated.View>
  );
}