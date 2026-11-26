import React, { useMemo, useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";
import { usePlayback } from "@/context/PlaybackContext";
import { formatDuration } from "@/utils";

interface ProgressBarProps {
  variant?: "bottom" | "fullscreen";
}

export default function ProgressBar({ variant = "bottom" }: ProgressBarProps) {
  const { currentTime, duration, seekTo } = usePlayback();
  const [barWidth, setBarWidth] = useState(0);
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const barWidthRef = useRef(0);
  const durationRef = useRef(0);
  barWidthRef.current = barWidth;
  durationRef.current = duration;

  const displayTime = scrubTime ?? currentTime;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  const calcTimeFromX = (locationX: number) => {
    const w = barWidthRef.current;
    const d = durationRef.current;
    if (w <= 0 || d <= 0) return 0;
    const ratio = Math.min(1, Math.max(0, locationX / w));
    return ratio * d;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          setScrubTime(calcTimeFromX(e.nativeEvent.locationX));
        },
        onPanResponderMove: (e) => {
          setScrubTime(calcTimeFromX(e.nativeEvent.locationX));
        },
        onPanResponderRelease: (e) => {
          const target = calcTimeFromX(e.nativeEvent.locationX);
          setScrubTime(null);
          seekTo(target);
        },
        onPanResponderTerminate: () => {
          setScrubTime(null);
        },
      }),
    [seekTo]
  );

  // VARIANT A: Bottom Player (edge-to-edge thin bar)
  if (variant === "bottom") {
    return (
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
        className="w-full py-1.5"
      >
        <View className="h-1 w-full overflow-hidden bg-background-active">
          <View
            className="h-full bg-accent-secondary"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>
    );
  }

  // VARIANT B: Fullscreen
  return (
    <View className="w-full gap-2 px-4">
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
        className="w-full py-2"
      >
        <View className="h-1.5 w-full overflow-hidden rounded-full bg-text-primary/15">
          <View
            className="h-full rounded-full bg-text-primary"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <View className="flex-row justify-between">
        <Text className="font-mono text-xs font-bold tracking-widest text-text-secondary">
          {formatDuration(displayTime)}
        </Text>
        <Text className="font-mono text-xs font-bold tracking-widest text-text-secondary">
          {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}