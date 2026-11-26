import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export type CardShape =
  | "square"
  | "small_square"
  | "responsive_square"
  | "circle"
  | "wide"
  | "list"
  | "trending";

interface SkeletonCardProps {
  shape?: CardShape;
}

const SKELETON_STYLES: Record<
  CardShape,
  { container: string; image: string; text: string }
> = {
  square: {
    container: "w-32 flex-col gap-2",
    image: "h-32 w-32 rounded-xl bg-border/40",
    text: "mt-1 gap-2 px-1",
  },
  small_square: {
    container: "w-28 flex-col gap-2",
    image: "h-28 w-28 rounded-lg bg-border/40",
    text: "mt-1 gap-2 px-1",
  },
  responsive_square: {
    container: "w-28 flex-col gap-2",
    image: "h-28 w-28 rounded-lg bg-border/40",
    text: "mt-1 gap-2 px-1",
  },
  circle: {
    container: "w-24 flex-col items-center gap-2",
    image: "h-24 w-24 rounded-full bg-border/40",
    text: "mt-1 w-full items-center gap-2 px-1",
  },
  wide: {
    container:
      "h-16 w-[280px] flex-row items-center gap-3 rounded-xl bg-background-secondary/50 p-2",
    image: "h-12 w-12 rounded-md bg-border/40",
    text: "flex-1 gap-2",
  },
  list: {
    container: "w-full flex-row items-center gap-3 rounded-xl p-2",
    image: "h-12 w-12 rounded-md bg-border/40",
    text: "flex-1 gap-2",
  },
  trending: {
    container:
      "h-20 w-[300px] flex-row items-center gap-4 rounded-2xl border border-border/30 bg-background-secondary/40 p-3",
    image: "h-14 w-14 rounded-lg bg-border/40",
    text: "flex-1 gap-2",
  },
};

export default function SkeletonCard({ shape = "square" }: SkeletonCardProps) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const currentStyle = SKELETON_STYLES[shape] || SKELETON_STYLES.square;

  return (
    <Animated.View style={{ opacity: pulse }} className={currentStyle.container}>
      <View className={currentStyle.image} />
      <View className={currentStyle.text}>
        <View className="h-3 w-3/4 rounded-full bg-border/50" />
        <View className="h-2.5 w-1/2 rounded-full bg-border/30" />
      </View>
    </Animated.View>
  );
}