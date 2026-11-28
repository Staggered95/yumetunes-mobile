import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../api/axios';
import type { ApiResponse, GenreItem } from '../types';



const GENRE_COLORS = [
  'bg-rose-500',
  'bg-purple-600',
  'bg-amber-500',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-pink-500',
  'bg-indigo-600',
  'bg-cyan-600',
] as const;

const getGenreColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GENRE_COLORS[Math.abs(hash) % GENRE_COLORS.length];
};

const GenreListPage: React.FC = () => {
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get<ApiResponse<GenreItem[]>>('/genres')
      .then((res) => setGenres(res.data.data || []))
      .catch((err) => console.error('❌ Error loading genres:', err));
  }, []);

  const renderGenre = useCallback(
    ({ item }: { item: GenreItem }) => (
      <Pressable
        onPress={() => router.push(`/genre/${encodeURIComponent(item.genre)}`)}
        className={`${getGenreColor(item.genre)} flex-1 aspect-[16/10] p-4 rounded-2xl relative overflow-hidden active:scale-95`}
      >
        {/* Visual Flair: Giant background text */}
        <Text
          numberOfLines={1}
          className="absolute -bottom-3 -right-3 text-white/15 text-5xl font-black uppercase -rotate-12"
        >
          {item.genre}
        </Text>

        <Text
          numberOfLines={2}
          className="text-xl font-black text-white capitalize z-10"
        >
          {item.genre}
        </Text>
        <Text className="text-white/75 text-[11px] font-bold uppercase tracking-widest z-10 mt-1">
          {item.track_count} Tracks
        </Text>
      </Pressable>
    ),
    [router]
  );

  return (
    <FlatList
      data={genres}
      keyExtractor={(item) => item.genre}
      renderItem={renderGenre}
      numColumns={2}
      className="flex-1 bg-background-primary"
      columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 64,
        paddingBottom: 128,
      }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="mb-8">
          <Text className="text-4xl font-black tracking-tighter italic text-text-primary/20 uppercase">
            Browse Genres
          </Text>
          <Text className="text-text-secondary mt-2 font-medium text-sm">
            Explore your {genres.length} unique music tags
          </Text>
        </View>
      }
    />
  );
};

export default GenreListPage;