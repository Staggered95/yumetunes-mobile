import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { usePagination } from "@/hooks/usePagination";
import Collage from "@/minicomps/Collage";
import Spinner from "@/minicomps/Spinner";

interface AnimeItem {
  id: number | string;
  title: string;
  track_count: number;
  collage_covers?: string[] | null;
}

export default function AnimeListPage() {
  const router = useRouter();
  const params = useMemo(() => ({}), []);

  const {
    data: animes,
    loading,
    hasMore,
    loadNextPage,
  } = usePagination<AnimeItem>("/animes", params);

  if (loading && animes.length === 0) {
    return (
      <View className="flex-1 bg-background-primary px-4 pt-6">
        <View className="mb-6 h-9 w-56 rounded-lg bg-border/50" />
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={`grid-skeleton-${i}`}
              className="aspect-square w-[48%] rounded-2xl border border-border/30 bg-border/40"
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={animes}
      numColumns={2}
      keyExtractor={(item, index) => `anime-${item.id}-${index}`}
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-background-primary"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
      }}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: 16,
      }}
      onEndReached={() => {
        if (hasMore && !loading) {
          loadNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <Text className="mb-6 text-3xl font-black uppercase italic tracking-tighter text-text-primary/30">
          Browse by Series
        </Text>
      }
      renderItem={({ item: anime }) => (
        <Pressable
          onPress={() =>
            router.push(`/anime/${encodeURIComponent(anime.title)}` as Href)
          }
          className="relative w-[48%] overflow-hidden rounded-2xl border border-border bg-background-secondary active:scale-95"
        >
          <Collage covers={anime.collage_covers} />

          <View className="absolute bottom-0 left-0 right-0 bg-black/75 px-3 py-2.5">
            <Text
              className="text-sm font-bold text-white"
              numberOfLines={1}
            >
              {anime.title}
            </Text>
            <Text className="mt-0.5 text-[10px] uppercase tracking-widest text-white/80">
              {anime.track_count} Tracks
            </Text>
          </View>
        </Pressable>
      )}
      ListFooterComponent={
  loading && animes.length > 0 ? (
    <View className="items-center py-6">
      <Spinner size="md" />
    </View>
  ) : !hasMore && animes.length > 0 ? (
    <Text className="mt-6 text-center text-sm italic text-text-muted">
      You&apos;ve reached the end of the catalog.
    </Text>
  ) : undefined
}
    />
  );
}