import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Href, useRouter } from "expo-router";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "@/context/ThemeContext";
import { getMediaUrl } from "@/utils";

export interface HomeBanner {
  id: number | string;
  image_path: string;
  title?: string | null;
  subtitle?: string | null;
  target_url?: string | null;
}

interface HeroCarouselProps {
  dbBanners?: HomeBanner[];
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const OVERLAY_COLOR_KEYS = [
  "--acc-primary",
  "--acc-secondary",
  "--bg-active",
  "--acc-tertiary",
] as const;

export default function HeroCarousel({ dbBanners = [] }: HeroCarouselProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const [active, setActive] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(SCREEN_WIDTH);

  // Autoplay every 5 seconds
  useEffect(() => {
    if (dbBanners.length <= 1 || carouselWidth === 0) return;

    const timer = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % dbBanners.length;
        scrollRef.current?.scrollTo({
          x: next * carouselWidth,
          animated: true,
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [dbBanners.length, carouselWidth]);

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (carouselWidth <= 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / carouselWidth);
    setActive(index);
  };

  const goToSlide = (index: number) => {
    setActive(index);
    scrollRef.current?.scrollTo({
      x: index * carouselWidth,
      animated: true,
    });
  };

  // Loading / Skeleton State
  if (dbBanners.length === 0) {
    return (
      <View className="h-60 w-full rounded-2xl bg-background-secondary" />
    );
  }

  return (
    <View
      onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
      className="relative h-60 w-full overflow-hidden rounded-2xl bg-background-primary"
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {dbBanners.map((b, i) => {
          const imageUrl = getMediaUrl(b.image_path, "image", 900);
          const colorKey = OVERLAY_COLOR_KEYS[i % OVERLAY_COLOR_KEYS.length];
          const gradientHex = colors[colorKey] ?? "#9D5CFA";
          const gradId = `hero-grad-${i}`;

          return (
            <Pressable
              key={b.id}
              onPress={() => {
                if (b.target_url) router.push(b.target_url as Href);
              }}
              style={{ width: carouselWidth }}
              className="relative h-60 justify-end p-5"
            >
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  className="absolute inset-0 h-full w-full"
                  resizeMode="cover"
                />
              )}

              {/* Theme Gradient Overlay */}
              <View
                pointerEvents="none"
                className="absolute inset-0"
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
                      <Stop
                        offset="0%"
                        stopColor={gradientHex}
                        stopOpacity="0.85"
                      />
                      <Stop
                        offset="100%"
                        stopColor={gradientHex}
                        stopOpacity="0"
                      />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
                </Svg>
              </View>

              {/* Banner Copy */}
              <View className="z-10 max-w-[85%] items-start gap-2 pb-2">
                {Boolean(b.title) && (
                  <Text
                    className="text-3xl font-black leading-tight text-text-primary"
                    numberOfLines={2}
                  >
                    {b.title}
                  </Text>
                )}

                {Boolean(b.subtitle) && (
                  <View className="rounded-md border border-border bg-background-secondary/75 px-3 py-1">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-text-primary">
                      {b.subtitle}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View className="absolute bottom-4 right-5 z-20 flex-row gap-2">
        {dbBanners.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => goToSlide(i)}
            hitSlop={6}
            className={`h-1.5 rounded-full ${
              i === active ? "w-6 bg-accent-primary" : "w-2 bg-text-muted"
            }`}
          />
        ))}
      </View>
    </View>
  );
}