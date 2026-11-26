import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Href, useRouter } from "expo-router";
import { GENRES } from "@/utils/constants";

interface TagChipsProps {
  currentGenre?: string | null;
}

export default function TagChips({ currentGenre = null }: TagChipsProps) {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 10,
        alignItems: "center",
      }}
    >
      {GENRES.map((genre) => {
        const isActive = currentGenre === genre;

        return (
          <Pressable
            key={genre}
            onPress={() =>
              router.push(`/genre/${encodeURIComponent(genre)}` as Href)
            }
            className={`rounded-full border px-5 py-2 active:scale-95 ${
              isActive
                ? "border-accent-primary bg-accent-primary"
                : "border-border bg-background-secondary active:bg-background-hover"
            }`}
          >
            <Text
              className={`text-sm font-bold tracking-tight ${
                isActive ? "text-background-primary" : "text-text-secondary"
              }`}
            >
              {genre}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => router.push("/genres" as Href)}
        className="px-4 py-2 active:opacity-75"
      >
        <Text className="text-sm font-black text-accent-primary">Show all</Text>
      </Pressable>
    </ScrollView>
  );
}