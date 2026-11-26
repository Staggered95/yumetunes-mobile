import React from "react";
import { Image, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { getMediaUrl } from "@/utils";

interface CollageProps {
  covers?: string[] | null;
}

export default function Collage({ covers }: CollageProps) {
  const { colors } = useTheme();
  const validCovers = (covers ?? []).filter(Boolean);
  const count = validCovers.length;

  // STATE 1: EMPTY STATE
  if (count === 0) {
    return (
      <View className="aspect-square w-full items-center justify-center overflow-hidden bg-background-secondary">
        <Feather name="music" size={40} color={colors["--txt-muted"]} />
      </View>
    );
  }

  // STATE 2: 2x2 GRID (4 or more covers)
  if (count >= 4) {
    return (
      <View className="aspect-square w-full flex-row flex-wrap overflow-hidden bg-background-primary">
        {validCovers.slice(0, 4).map((path, idx) => {
          const uri = getMediaUrl(path, "image", 240);
          return (
            <View
              key={`${path}-${idx}`}
              className="h-1/2 w-1/2 border-[0.5px] border-border/40 bg-background-active"
            >
              {uri ? (
                <Image
                  source={{ uri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : null}
            </View>
          );
        })}
      </View>
    );
  }

  // STATE 3: SINGLE IMAGE (1 to 3 covers)
  const singleUri = getMediaUrl(validCovers[0], "image", 400);

  return (
    <View className="aspect-square w-full overflow-hidden bg-background-primary">
      {singleUri ? (
        <Image
          source={{ uri: singleUri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-background-secondary">
          <Feather name="music" size={40} color={colors["--txt-muted"]} />
        </View>
      )}
    </View>
  );
}