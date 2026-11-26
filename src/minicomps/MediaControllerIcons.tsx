import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayback } from "@/context/PlaybackContext";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import LikeButton from "./LikeButton";
import MorphingPlayPauseButton from "./MorphingPlayPauseButton";
import ShuffleButton from "./ShuffleButton";
import Spinner from "./Spinner";

interface MediaControllersProps {
  variant?: "bottomplayer" | "fullscreen" | "utility";
  songId?: number;
  className?: string;
}

export default function MediaControllers({
  variant = "bottomplayer",
  songId,
  className = "",
}: MediaControllersProps) {
  const { nextSong, prevSong } = useSongs();
  const { isPlaying, isBuffering, togglePlay } = usePlayback();
  const { colors } = useTheme();

  // VARIANT 1: FULLSCREEN (Minimal View)
  if (variant === "fullscreen") {
    return (
      <View className={`flex-row items-center gap-8 ${className}`}>
        <Pressable
          onPress={() => prevSong()}
          hitSlop={8}
          accessibilityLabel="Previous Song"
          className="p-2 active:scale-95"
        >
          <Ionicons
            name="play-skip-back"
            size={36}
            color={colors["--txt-secondary"]}
          />
        </Pressable>

        <Pressable
          onPress={togglePlay}
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          style={{ elevation: 8 }}
          className="h-[72px] w-[72px] items-center justify-center rounded-full bg-text-primary active:scale-95"
        >
          {isBuffering ? (
            <Spinner size="lg" color={colors["--bg-primary"]} />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={34}
              color={colors["--bg-primary"]}
              style={!isPlaying ? { marginLeft: 3 } : undefined}
            />
          )}
        </Pressable>

        <Pressable
          onPress={() => nextSong()}
          hitSlop={8}
          accessibilityLabel="Next Song"
          className="p-2 active:scale-95"
        >
          <Ionicons
            name="play-skip-forward"
            size={36}
            color={colors["--txt-secondary"]}
          />
        </Pressable>
      </View>
    );
  }

  // VARIANT 2: UTILITY (Split-Pane View)
  if (variant === "utility") {
    return (
      <View
        className={`flex-row items-center justify-center gap-4 rounded-full border border-border/50 bg-background-secondary/80 px-5 py-2.5 ${className}`}
      >
        <ShuffleButton variant="fullscreen" className="p-1.5" />

        <Pressable
          onPress={() => prevSong()}
          hitSlop={8}
          accessibilityLabel="Previous Song"
          className="p-1.5 active:scale-95"
        >
          <Ionicons
            name="play-skip-back"
            size={26}
            color={colors["--txt-muted"]}
          />
        </Pressable>

        <Pressable
          onPress={togglePlay}
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          style={{ elevation: 6 }}
          className="h-[58px] w-[58px] items-center justify-center rounded-full bg-accent-primary active:scale-95"
        >
          {isBuffering ? (
            <Spinner size="md" color="#ffffff" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#ffffff"
              style={!isPlaying ? { marginLeft: 2 } : undefined}
            />
          )}
        </Pressable>

        <Pressable
          onPress={() => nextSong()}
          hitSlop={8}
          accessibilityLabel="Next Song"
          className="p-1.5 active:scale-95"
        >
          <Ionicons
            name="play-skip-forward"
            size={26}
            color={colors["--txt-muted"]}
          />
        </Pressable>

        {songId !== undefined && (
          <LikeButton songId={songId} variant="fullscreen" />
        )}
      </View>
    );
  }

  // VARIANT 3: BOTTOM PLAYER (Default Mobile)
  return (
    <View className={`flex-row items-center justify-center gap-2 ${className}`}>
      <View className="items-center justify-center rounded-full border-2 border-accent-primary">
        {isBuffering ? (
          <View className="h-9 w-9 items-center justify-center">
            <Spinner size="md" />
          </View>
        ) : (
          <MorphingPlayPauseButton
            isPlaying={isPlaying}
            onToggle={togglePlay}
          />
        )}
      </View>

      <Pressable
        onPress={() => nextSong()}
        hitSlop={8}
        accessibilityLabel="Next Song"
        className="p-1.5 active:scale-90"
      >
        <Ionicons
          name="play-skip-forward"
          size={24}
          color={colors["--txt-secondary"]}
        />
      </Pressable>
    </View>
  );
}