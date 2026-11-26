import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { usePlayback } from "@/context/PlaybackContext";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import LikeButton from "@/minicomps/LikeButton";
import MediaControllers from "@/minicomps/MediaControllerIcons";
import ProgressBar from "@/minicomps/ProgressBar";
import ScrollingText from "@/minicomps/ScrollingText";
import Spinner from "@/minicomps/Spinner";
import { getMediaUrl } from "@/utils";

interface BottomPlayerProps {
  onExpand: () => void;
}

export default function BottomPlayer({ onExpand }: BottomPlayerProps) {
  const { currentSong } = useSongs();
  const { isBuffering } = usePlayback();
  const { colors } = useTheme();

  if (!currentSong) return null;

  const coverUrl = getMediaUrl(currentSong.cover_path, "image", 160);

  return (
    <View
      className={`border-t border-border bg-background-secondary ${
        isBuffering ? "opacity-80" : "opacity-100"
      }`}
    >
      {/* Top Edge-to-Edge Progress Bar */}
      <View className="-mt-1.5">
        <ProgressBar variant="bottom" />
      </View>

      <View className="h-16 flex-row items-center justify-between gap-2 px-3">
        {/* 1. LEFT SECTION (Cover & Scrolling Info) */}
        <Pressable
          onPress={onExpand}
          className="flex-1 flex-row items-center gap-3 pr-2"
        >
          <View className="relative h-11 w-11 overflow-hidden rounded-md bg-background-primary">
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Feather
                  name="music"
                  size={18}
                  color={colors["--txt-muted"]}
                />
              </View>
            )}

            {isBuffering && (
              <View className="absolute inset-0 items-center justify-center bg-black/50">
                <Spinner size="sm" />
              </View>
            )}
          </View>

          <View className="flex-1 justify-center">
            <ScrollingText
              text={currentSong.title}
              className="text-sm font-bold text-text-primary"
            />
            <Text className="text-xs text-text-secondary" numberOfLines={1}>
              {currentSong.artist || currentSong.anime || "YumeTunes"}
            </Text>
          </View>
        </Pressable>

        {/* 2. RIGHT SECTION (Like + Playback Controls) */}
        <View className="flex-row items-center gap-3">
          <LikeButton songId={currentSong.id} />
          <MediaControllers variant="bottomplayer" />
        </View>
      </View>
    </View>
  );
}