import React, { useState } from "react";
import { Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import Spinner from "./Spinner";

interface LikeButtonProps {
  songId: number;
  variant?: "default" | "fullscreen" | "massive";
  className?: string;
}

export default function LikeButton({
  songId,
  variant = "default",
  className = "",
}: LikeButtonProps) {
  const { isLoggedIn } = useAuth();
  const { likedSongIds, toggleLike } = useUser();
  const { addToast } = useToast();
  const { colors } = useTheme();

  const [isLiking, setIsLiking] = useState(false);
  const isLiked = likedSongIds.has(songId);

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      addToast("Please log in to save songs", "info");
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const ok = await toggleLike(songId);
    if (!ok) {
      addToast("Couldn't sync with server", "error");
    }

    setIsLiking(false);
  };

  const iconSize = variant === "massive" ? 160 : variant === "fullscreen" ? 26 : 22;
  const strokeWidth = variant === "massive" ? 1.2 : 2;
  const strokeColor = isLiked
    ? colors["--acc-primary"]
    : variant === "massive"
      ? colors["--txt-muted"]
      : colors["--txt-secondary"];
  const fillColor = isLiked ? colors["--acc-primary"] : "none";

  return (
    <Pressable
      onPress={handleLikeClick}
      disabled={isLiking}
      hitSlop={8}
      accessibilityLabel={
        isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"
      }
      className={`items-center justify-center active:scale-90 ${className}`}
    >
      {isLiking ? (
        <Spinner size={variant === "massive" ? "xl" : "md"} />
      ) : (
        <Svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </Svg>
      )}
    </Pressable>
  );
}