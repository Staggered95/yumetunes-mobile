import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { usePlayback } from "@/context/PlaybackContext";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import OptionsMenu from "@/minicomps/OptionsMenu";
import { Song } from "@/types";
import { getMediaUrl } from "@/utils";
import { CardShape } from "./loading/SkeletonCard";

interface SongCardProps {
  song: Song;
  queue?: Song[];
  index?: number;
  shape?: CardShape;
}

const CARD_STYLES: Record<
  CardShape,
  { container: string; image: string; radius: string; text: string }
> = {
  square: {
    container: "w-32 flex-col gap-2",
    image: "h-32 w-32",
    radius: "rounded-xl",
    text: "px-1",
  },
  small_square: {
    container: "w-28 flex-col gap-2",
    image: "h-28 w-28",
    radius: "rounded-lg",
    text: "px-1",
  },
  responsive_square: {
    container: "w-28 flex-col gap-2",
    image: "h-28 w-28",
    radius: "rounded-lg",
    text: "px-1",
  },
  circle: {
    container: "w-24 flex-col items-center gap-2",
    image: "h-24 w-24 border border-border",
    radius: "rounded-full",
    text: "items-center px-1",
  },
  wide: {
    container:
      "h-16 w-[280px] flex-row items-center gap-3 rounded-xl bg-background-secondary/60 p-2 active:bg-background-hover",
    image: "h-12 w-12",
    radius: "rounded-md",
    text: "flex-1",
  },
  list: {
    container:
      "w-full flex-row items-center gap-3 rounded-xl p-2 active:bg-background-active",
    image: "h-12 w-12",
    radius: "rounded-md",
    text: "flex-1",
  },
  trending: {
    container:
      "h-20 w-[300px] flex-row items-center gap-3.5 rounded-2xl border border-border/60 bg-background-secondary/60 p-3 active:bg-background-hover",
    image: "h-14 w-14",
    radius: "rounded-lg",
    text: "flex-1",
  },
};

function SongCardComponent({
  song,
  queue,
  index = 0,
  shape = "square",
}: SongCardProps) {
  const { playQueue, currentSong } = useSongs();
  const { isPlaying } = usePlayback();
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);

  if (!song) return null;

  const currentStyle = CARD_STYLES[shape] || CARD_STYLES.square;
  const isCurrentTrack = currentSong?.id === song.id;
  const isHorizontal =
    shape === "wide" || shape === "list" || shape === "trending";
  const coverUrl = getMediaUrl(
    song.cover_path,
    "image",
    isHorizontal ? 160 : 320
  );

  const handlePlay = () => playQueue(queue || [song], index);

  return (
    <Pressable
      onPress={handlePlay}
      className={`${currentStyle.container} relative active:scale-95`}
    >
      {/* Top-right OptionsMenu on vertical cards */}
      {!isHorizontal && (
        <View className="absolute right-1.5 top-1.5 z-20">
          <OptionsMenu
            song={song}
            className="bg-background-primary/75 p-1"
          />
        </View>
      )}

      {/* Cover Artwork */}
      <View
        className={`relative overflow-hidden bg-background-secondary ${currentStyle.image} ${currentStyle.radius}`}
      >
        {coverUrl && !imgError ? (
          <Image
            source={{ uri: coverUrl }}
            onError={() => setImgError(true)}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-background-hover">
            <Feather name="music" size={20} color={colors["--txt-muted"]} />
          </View>
        )}

        {/* Active Track Play/Pause Overlay */}
        {isCurrentTrack && (
          <View className="absolute inset-0 items-center justify-center bg-background-primary/65">
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={isHorizontal ? 22 : 34}
              color={colors["--acc-primary"]}
            />
          </View>
        )}
      </View>

      {/* Title & Artist */}
      <View className={`${currentStyle.text} justify-center`}>
        <Text
          className={`text-sm font-bold ${
            isCurrentTrack ? "text-accent-primary" : "text-text-primary"
          }`}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text
          className="mt-0.5 text-xs text-text-secondary"
          numberOfLines={1}
        >
          {song.artist || song.anime || "Single"}
        </Text>
      </View>

      {/* Right-aligned OptionsMenu on horizontal cards */}
      {isHorizontal && (
        <View className="ml-auto">
          <OptionsMenu song={song} />
        </View>
      )}
    </Pressable>
  );
}

const SongCard = React.memo(
  SongCardComponent,
  (prevProps, nextProps) =>
    prevProps.song.id === nextProps.song.id &&
    prevProps.index === nextProps.index &&
    prevProps.shape === nextProps.shape
);

export default SongCard;