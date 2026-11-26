import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";

interface ShuffleButtonProps {
  variant?: "bottomplayer" | "fullscreen" | "action";
  className?: string;
  onPress?: () => void;
}

export default function ShuffleButton({
  variant = "bottomplayer",
  className = "",
  onPress,
}: ShuffleButtonProps) {
  const { isShuffle, toggleShuffle } = useSongs();
  const { colors } = useTheme();

  const activeColor = colors["--acc-primary"];
  const inactiveColor = colors["--txt-secondary"];

  // VARIANT 1: PLAYLIST ACTION (Big Hero Button)
  if (variant === "action") {
    return (
      <Pressable
        onPress={onPress}
        className={`flex-row items-center justify-center gap-2 rounded-full border border-border bg-background-secondary px-6 py-3 active:scale-95 ${className}`}
      >
        <Feather name="shuffle" size={16} color={colors["--txt-primary"]} />
        <Text className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
          Shuffle Play
        </Text>
      </Pressable>
    );
  }

  const handleToggle = () => {
    toggleShuffle();
    onPress?.();
  };

  // VARIANT 2: FULLSCREEN
  if (variant === "fullscreen") {
    return (
      <Pressable
        onPress={handleToggle}
        hitSlop={8}
        accessibilityLabel={isShuffle ? "Order: Shuffled" : "Order: Sequential"}
        className={`p-2 active:scale-95 ${className}`}
      >
        <Feather
          name="shuffle"
          size={26}
          color={isShuffle ? activeColor : inactiveColor}
        />
      </Pressable>
    );
  }

  // VARIANT 3: BOTTOM PLAYER (Default)
  return (
    <Pressable
      onPress={handleToggle}
      hitSlop={8}
      accessibilityLabel={isShuffle ? "Order: Shuffled" : "Order: Sequential"}
      className={`relative items-center justify-center p-2 active:scale-90 ${className}`}
    >
      <Feather
        name="shuffle"
        size={19}
        color={isShuffle ? activeColor : inactiveColor}
      />
      {isShuffle && (
        <View className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent-primary" />
      )}
    </Pressable>
  );
}