import React, { useCallback } from 'react';
import { View, Text, Image, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { getMediaUrl } from '../utils/media';
import { usePagination } from '../hooks/usePagination';
import type { ArtistListItem } from '../types';



const SKELETON_INITIAL = Array.from({ length: 12 }, (_, i) => i);
const SKELETON_APPEND = Array.from({ length: 4 }, (_, i) => i);

const ArtistListPage: React.FC = () => {
  const router = useRouter();

  const {
    data: artists,
    loading,
    hasMore,
    loadNextPage,
  } = usePagination<ArtistListItem>('/artists', {});

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNextPage();
    }
  }, [loading, hasMore, loadNextPage]);

  const renderArtist = useCallback(
    ({ item }: { item: ArtistListItem }) => (
      <Pressable
        onPress={() => router.push(`/artist/${encodeURIComponent(item.name)}`)}
        className="flex-1 items-center mb-8 px-2 active:opacity-80"
      >
        <View className="w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-transparent bg-border/20">
          <Image
            source={{ uri: getMediaUrl(item.profile_pic) }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <Text
          numberOfLines={1}
          className="font-bold text-center text-text-primary text-sm"
        >
          {item.name}
        </Text>
        <Text className="text-[11px] text-text-muted uppercase tracking-widest mt-1">
          {item.track_count} Songs
        </Text>
      </Pressable>
    ),
    [router]
  );

  if (loading && artists.length === 0) {
    return (
      <View className="flex-1 bg-background-primary px-4 pt-16">
        <Text className="text-4xl font-black mb-8 text-text-primary/20 uppercase italic">
          Artists
        </Text>
        <View className="flex-row flex-wrap">
          {SKELETON_INITIAL.map((i) => (
            <View
              key={`ghost-${i}`}
              className="w-1/2 items-center mb-8 px-2 opacity-60"
            >
              <View className="w-32 h-32 rounded-full bg-border/40 mb-3" />
              <View className="h-4 w-24 bg-border/40 rounded-full mb-2" />
              <View className="h-3 w-16 bg-border/20 rounded-full" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={artists}
      keyExtractor={(item, index) => `artist-${item.id}-${index}`}
      renderItem={renderArtist}
      numColumns={2}
      className="flex-1 bg-background-primary"
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 64,
        paddingBottom: 128,
      }}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <Text className="text-4xl font-black mb-8 px-2 text-text-primary/20 uppercase italic">
          Artists
        </Text>
      }
      ListFooterComponent={
        <>
          {loading && artists.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {SKELETON_APPEND.map((i) => (
                <View
                  key={`append-ghost-${i}`}
                  className="w-1/2 items-center mb-8 px-2 opacity-60"
                >
                  <View className="w-32 h-32 rounded-full bg-border/20 mb-3" />
                  <View className="h-4 w-24 bg-border/30 rounded-full mb-2" />
                </View>
              ))}
            </View>
          )}

          {!hasMore && artists.length > 0 && (
            <Text className="text-center text-text-muted mt-8 italic text-sm">
              You've reached the end of the artist directory.
            </Text>
          )}
        </>
      }
    />
  );
};

export default ArtistListPage;