import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../api/axios';
import { useSongs } from '../../context/SongContext';
import { getMediaUrl } from '../../utils/media';
import type {
  ApiResponse,
  ArtistDetailsData,
  FeaturedAnime,
  Song,
} from '../../types';

interface ArtistData {
  songs: Song[];
  animes: FeaturedAnime[];
}

const ArtistPage: React.FC = () => {
  const { artistName: rawArtistName } = useLocalSearchParams<{
    artistName: string | string[];
  }>();
  const router = useRouter();
  const { playQueue } = useSongs();

  const artistName = Array.isArray(rawArtistName)
    ? rawArtistName[0]
    : rawArtistName;

  const [data, setData] = useState<ArtistData>({ songs: [], animes: [] });
  const [loading, setLoading] = useState<boolean>(true);

  const formatTime = (seconds?: number | null): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!artistName) return;
      setLoading(true);
      try {
        const encodedName = encodeURIComponent(artistName);

        const [songsRes, detailsRes] = await Promise.all([
            api.get<ApiResponse<Song[]>>(`/songs/artist/${encodedName}`),
            api.get<ApiResponse<ArtistDetailsData>>(`/artists/${encodedName}`),
        ]);

        setData({
          songs: songsRes.data.data || [],
          animes: detailsRes.data.data?.featuredAnimes || [],
        });
      } catch (err) {
        console.error('❌ Error loading artist page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistName]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-text-muted font-black text-lg tracking-widest uppercase">
          LOADING ARTIST...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HERO HEADER */}
      <View className="px-6 pt-16 pb-8 bg-background-secondary border-b border-border">
        <Text className="text-accent-primary font-bold tracking-[0.35em] text-xs uppercase mb-2 italic">
          Verified Artist
        </Text>
        <Text className="text-4xl font-black tracking-tight text-text-primary">
          {artistName}
        </Text>

        <View className="mt-4 flex-row items-center gap-4">
          <Text className="text-text-secondary text-sm font-medium">
            {data.songs.length} Tracks
          </Text>
          <View className="w-1.5 h-1.5 rounded-full bg-border" />
          <Text className="text-text-secondary text-sm font-medium">
            {data.animes.length} Appearances
          </Text>
        </View>
      </View>

      {/* 2. MAIN CONTENT */}
      <View className="px-5 pt-8 gap-10">
        {/* POPULAR TRACKS */}
        <View>
          <Text className="text-xl font-black mb-5 tracking-tight text-text-muted uppercase italic">
            Popular Tracks
          </Text>

          <View className="gap-1">
            {data.songs.map((song, index) => (
              <Pressable
                key={song.id}
                onPress={() => playQueue(data.songs, index)}
                className="flex-row items-center gap-4 p-2.5 rounded-2xl active:bg-background-hover"
              >
                {/* Track Number */}
                <Text className="w-7 text-center text-text-muted font-mono text-xs">
                  {(index + 1).toString().padStart(2, '0')}
                </Text>

                {/* Cover Art */}
                <Image
                  source={{ uri: getMediaUrl(song.cover_path) }}
                  className="w-14 h-14 rounded-xl border border-border"
                  resizeMode="cover"
                />

                {/* Song Info */}
                <View className="flex-1 min-w-0">
                  <Text
                    numberOfLines={1}
                    className="font-bold text-base text-text-primary"
                  >
                    {song.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs text-text-secondary mt-0.5"
                  >
                    {song.anime || 'Single'}
                  </Text>
                </View>

                {/* Duration */}
                <Text className="text-xs font-mono text-text-muted pr-1">
                  {formatTime(song.duration_seconds) || '---'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FEATURED IN (ANIME COLLECTION) */}
        <View className="gap-6">
          <View>
            <Text className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
              Featured In
            </Text>

            <View className="gap-3">
              {data.animes.map((anime) => (
                <Pressable
                  key={anime.id}
                  onPress={() =>
                    router.push(`/anime/${encodeURIComponent(anime.title)}`)
                  }
                  className="flex-row items-center gap-4 p-3 bg-background-secondary/50 border border-border rounded-2xl active:bg-background-hover"
                >
                  <Image
                    source={{ uri: getMediaUrl(anime.anime_cover) }}
                    className="w-16 h-16 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1 min-w-0">
                    <Text
                      numberOfLines={1}
                      className="font-bold text-sm text-text-primary"
                    >
                      {anime.title}
                    </Text>
                    <Text className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                      Series Collection
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Subtle Artist Bio / Fact Card */}
          <View className="p-5 rounded-3xl bg-accent-primary/5 border border-accent-primary/10">
            <Text className="text-accent-primary text-xs font-bold uppercase tracking-widest mb-2">
              Artist Note
            </Text>
            <Text className="text-sm text-text-secondary leading-relaxed italic">
              "This artist has contributed several iconic themes to your library.
              Explore their discography through the series links above."
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ArtistPage;