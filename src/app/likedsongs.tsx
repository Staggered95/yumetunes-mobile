import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useSongs } from '../context/SongContext';
import ShuffleButton from '../minicomps/ShuffleButton';
import SkeletonCard from '../components/loading/SkeletonCard';
import { getMediaUrl } from '../utils/media';
import { usePagination } from '../hooks/usePagination';
import OptionsMenu from '../minicomps/OptionsMenu';
import type { LikedSong } from '../types/song';

const SKELETON_APPEND = Array.from({ length: 5 }, (_, i) => i);

const LikedSongsPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { userProfile } = useUser();
  const { playQueue, playShuffledQueue } = useSongs();

  const {
    data: songs,
    loading,
    hasMore,
    loadNextPage,
  } = usePagination<LikedSong>('/user/likedsongs', {}, isLoggedIn);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadNextPage();
    }
  }, [loading, hasMore, loadNextPage]);

  const renderSong = useCallback(
    ({ item, index }: { item: LikedSong; index: number }) => (
      <Pressable
        onPress={() => playQueue(songs, index)}
        className="flex-row items-center gap-3 px-4 py-2.5 mx-2 rounded-2xl active:bg-background-secondary"
      >
        {/* Index */}
        <Text className="w-7 text-center text-text-muted text-xs font-bold">
          {index + 1}
        </Text>

        {/* Cover & Title */}
        <View className="flex-1 flex-row items-center gap-3 min-w-0">
          <Image
            source={{ uri: getMediaUrl(item.cover_path) }}
            className="w-11 h-11 rounded-lg bg-border/20"
            resizeMode="cover"
          />
          <View className="flex-1 min-w-0">
            <Text
              numberOfLines={1}
              className="text-text-primary font-bold text-sm"
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-text-secondary text-xs mt-0.5"
            >
              {item.artist || 'Unknown Artist'}
            </Text>
          </View>
        </View>

        {/* Options Menu */}
        <View className="items-end justify-center">
          <OptionsMenu song={item} />
        </View>
      </Pressable>
    ),
    [songs, playQueue]
  );

  if (loading && songs.length === 0) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center px-6">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-text-secondary font-black text-xs uppercase tracking-widest">
          Waking up your favorites...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={songs}
      keyExtractor={(item, index) => `liked-${item.id}-${index}`}
      renderItem={renderSong}
      className="flex-1 bg-background-primary"
      contentContainerStyle={{ paddingBottom: 128 }}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          {/* 1. HERO HEADER */}
          <View className="px-6 pt-16 pb-8 bg-accent-primary/15 items-center">
            <View className="w-44 h-44 rounded-3xl bg-accent-primary items-center justify-center mb-6">
              <Ionicons name="heart" size={88} color="#000" />
            </View>

            <Text className="text-[10px] font-black tracking-[0.3em] uppercase text-accent-primary mb-2">
              Personal Collection
            </Text>
            <Text className="text-4xl font-black tracking-tighter italic uppercase text-text-primary text-center">
              Liked Songs
            </Text>

            <View className="flex-row items-center gap-3 mt-3">
              <Text className="text-text-primary text-sm font-bold">
                {userProfile?.username || 'You'}
              </Text>
              <View className="w-1 h-1 bg-text-muted rounded-full" />
              <Text className="text-text-secondary text-sm font-bold">
                {songs.length} Tracks
              </Text>
            </View>
          </View>

          {/* 2. ACTION BAR */}
          <View className="px-6 py-4 flex-row items-center gap-5 border-b border-border/50 bg-background-primary">
            <Pressable
              onPress={() => {
                if (songs.length > 0) playQueue(songs, 0);
              }}
              className="w-14 h-14 bg-accent-primary rounded-full items-center justify-center active:scale-95"
            >
              <Ionicons
                name="play"
                size={28}
                color="#000"
                style={{ marginLeft: 3 }}
              />
            </Pressable>

            <ShuffleButton
              variant="action"
              onPress={() => {
                if (songs.length > 0) playShuffledQueue(songs);
              }}
            />
          </View>

          {/* 3. TABLE HEADER */}
          <View className="flex-row items-center gap-3 px-6 py-3 border-b border-border mb-2">
            <Text className="w-7 text-center text-text-muted text-[10px] font-black uppercase tracking-widest">
              #
            </Text>
            <Text className="flex-1 text-text-muted text-[10px] font-black uppercase tracking-widest">
              Title
            </Text>
            <View className="w-8" />
          </View>
        </View>
      }
      ListFooterComponent={
        <>
          {loading && songs.length > 0 && (
            <View className="px-4 mt-4 gap-2">
              {SKELETON_APPEND.map((i) => (
                <SkeletonCard key={`append-${i}`} shape="list" />
              ))}
            </View>
          )}

          {!hasMore && songs.length > 0 && (
            <Text className="text-center text-text-muted mt-10 italic text-sm">
              That's everything in your collection.
            </Text>
          )}
        </>
      }
    />
  );
};

export default LikedSongsPage;