import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { usePlayback } from "@/context/PlaybackContext";
import { LyricLine } from "@/types";

interface LiveLyricsProps {
  lyrics: LyricLine[];
  language?: string;
}

export default function LiveLyrics({ lyrics }: LiveLyricsProps) {
  const { currentTime, seekTo } = usePlayback();
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const linePositionsRef = useRef<Record<number, number>>({});
  const [containerHeight, setContainerHeight] = useState(0);

  // Find the latest lyric line whose timestamp has passed
  const activeIndex = useMemo(() => {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) return i;
    }
    return -1;
  }, [lyrics, currentTime]);

  // Reset stored positions when lyrics change
  useEffect(() => {
    linePositionsRef.current = {};
  }, [lyrics]);

  // Smoothly scroll active line toward the vertical center
  useEffect(() => {
    if (activeIndex < 0 || !scrollViewRef.current) return;
    const lineY = linePositionsRef.current[activeIndex];
    if (lineY === undefined) return;

    const targetY = Math.max(0, lineY - containerHeight * 0.35);
    scrollViewRef.current.scrollTo({ y: targetY, animated: true });
  }, [activeIndex, containerHeight]);

  return (
    <ScrollView
      ref={scrollViewRef}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: Math.max(120, containerHeight * 0.35),
        paddingHorizontal: 16,
      }}
      className="w-full flex-1"
    >
      {lyrics.map((line, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <Pressable
            key={`${line.time}-${i}`}
            onPress={() => seekTo(line.time)}
            onLayout={(e) => {
              linePositionsRef.current[i] = e.nativeEvent.layout.y;
            }}
            className="py-3.5"
          >
            <View
              style={
                isActive ? { transform: [{ scale: 1.03 }] } : undefined
              }
            >
              <Text
                className={`text-2xl font-black leading-snug ${
                  isActive
                    ? "text-accent-primary"
                    : isPast
                      ? "text-text-secondary opacity-55"
                      : "text-text-muted opacity-35"
                }`}
              >
                {line.text}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}