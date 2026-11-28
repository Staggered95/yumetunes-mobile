import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SongCard from '../../components/SongCard';
import SkeletonCard from '../../components/loading/SkeletonCard';
import { usePagination } from '../../hooks/usePagination';
import { useSongs } from '../../context/SongContext';
import ShuffleButton from '../../minicomps/ShuffleButton';
import type { Song } from '../../types/song';

const SKELETON_INITIAL = Array.from({ length: 12 }, (_, i) => i);
const SKELETON_APPEND = Array.from({ length: 4 }, (_, i) => i);

const GenrePage: React.FC = () => {
  const { genreName: rawGenreName } = useLocalSearchParams<{
    genreName: string | string[];
  }>();

  const genreName = Array.isArray(rawGenreName)
    ? rawGenreName[0]
    : rawGenreName;

  const { playQueue, playShuffledQueue } = useSongs();

  const params = useMemo(() => ({ genre: genreName }), [genreName]);

  const {
    data: songs,
    loading,
    hasMore,
    loadNextPage,
  } = usePagination<Song>('/songs/search', params, genreName);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNextPage();
    }
  }, [loading, hasMore, loadNextPage]);

  const renderSong = useCallback(
    ({ item, index }: { item: Song; index: number }) => (
      <View className="flex-1">
        <SongCard
          song={item}
          queue={songs}
          index={index}
          shape="responsive_square"
        />
      </View>
    ),
    [songs]
  );

  if (loading && songs.length === 0) {
    return (
      <View className="flex-1 bg-background-primary px-4 pt-16">
        <View className="h-10 w-56 bg-border/40 rounded-lg mb-8 opacity-60" />
        <View className="flex-row flex-wrap gap-4">
          {SKELETON_INITIAL.map((i) => (
            <View key={`ghost-${i}`} className="w-[47%]">
              <SkeletonCard shape="responsive_square" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={(item, index) => `genre-song-${item.id}-${index}`}
      renderItem={renderSong}
      numColumns={2}
      className="flex-1 bg-background-primary"
      columnWrapperStyle={{ gap: 14, marginBottom: 14 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 64,
        paddingBottom: 128,
      }}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View className="mb-8">
          <Text className="text-4xl font-black text-text-primary mb-2 uppercase tracking-tighter">
            {genreName}
          </Text>
          <Text className="text-text-secondary italic text-sm font-medium mb-6">
            Showing {songs.length} tracks
          </Text>

          {songs.length > 0 && (
            <View className="flex-row items-center gap-4">
              {/* Play All Button */}
              <Pressable
                onPress={() => playQueue(songs, 0)}
                className="w-12 h-12 bg-accent-primary rounded-full items-center justify-center active:scale-95"
              >
                <Ionicons
                  name="play"
                  size={24}
                  color="#000"
                  style={{ marginLeft: 3 }}
                />
              </Pressable>

              {/* Shuffle Play Button */}
              <ShuffleButton
                variant="action"
                onPress={() => playShuffledQueue(songs)}
              />
            </View>
          )}
        </View>
      }
      ListFooterComponent={
        <>
          {loading && songs.length > 0 && (
            <View className="flex-row flex-wrap gap-4 mt-2">
              {SKELETON_APPEND.map((i) => (
                <View key={`append-${i}`} className="w-[47%]">
                  <SkeletonCard shape="responsive_square" />
                </View>
              ))}
            </View>
          )}

          {!hasMore && songs.length > 0 && (
            <Text className="text-center text-text-muted mt-10 mb-6 italic text-sm">
              You've reached the end of the {genreName} collection.
            </Text>
          )}
        </>
      }
    />
  );
};

export default GenrePage;