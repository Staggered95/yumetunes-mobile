import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';
import SongCard from '../components/SongCard';
import { getMediaUrl } from '../utils/media';
import type { ApiResponse, GlobalSearchData } from '../types';

interface FilterPillProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

const GENRE_FILTERS = ['Soft', 'Rock', 'Vibe', 'Masterclass'] as const;
const TYPE_FILTERS = ['OP', 'ED', 'OST'] as const;
const SKELETON_ITEMS = [1, 2, 3, 4];

const FilterPill: React.FC<FilterPillProps> = ({ active, label, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`px-4 py-1.5 rounded-full border active:scale-95 ${
      active
        ? 'bg-accent-primary border-accent-primary'
        : 'bg-background-secondary border-border'
    }`}
  >
    <Text
      className={`text-xs font-bold ${
        active ? 'text-white' : 'text-text-secondary'
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

const SearchResultPage: React.FC = () => {
  const params = useLocalSearchParams<{
    q?: string | string[];
    genre?: string | string[];
    type?: string | string[];
  }>();
  const router = useRouter();

  const query = (Array.isArray(params.q) ? params.q[0] : params.q) || '';
  const activeGenre =
    (Array.isArray(params.genre) ? params.genre[0] : params.genre) || '';
  const activeType =
    (Array.isArray(params.type) ? params.type[0] : params.type) || '';

  const [results, setResults] = useState<GlobalSearchData>({
    songs: [],
    artists: [],
    animes: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFilteredResults = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<ApiResponse<GlobalSearchData>>(
          '/search',
          {
            params: {
              q: query,
              genre: activeGenre || undefined,
              type: activeType || undefined,
            },
          }
        );

        if (data.success) {
          setResults({
            songs: data.data.songs || [],
            artists: data.data.artists || [],
            animes: data.data.animes || [],
          });
        }
      } catch (err) {
        console.error('❌ Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchFilteredResults();
    } else {
      setResults({ songs: [], artists: [], animes: [] });
    }
  }, [query, activeGenre, activeType]);

  const updateFilter = (key: 'genre' | 'type', value: string) => {
    const currentValue = key === 'genre' ? activeGenre : activeType;
    router.setParams({
      [key]: currentValue === value ? '' : value,
    });
  };

  const resetFilters = () => {
    router.setParams({ genre: '', type: '' });
  };

  const hasNoResults =
    !results.songs.length && !results.artists.length && !results.animes.length;

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 64,
        paddingBottom: 128,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. HORIZONTAL FILTER BAR */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-black uppercase tracking-widest text-text-muted">
            Filters
          </Text>
          {(activeGenre || activeType) && (
            <Pressable onPress={resetFilters}>
              <Text className="text-[10px] font-black uppercase tracking-widest text-accent-primary">
                Reset
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, alignItems: 'center' }}
        >
          {GENRE_FILTERS.map((g) => (
            <FilterPill
              key={g}
              label={g}
              active={activeGenre === g}
              onPress={() => updateFilter('genre', g)}
            />
          ))}

          <View className="w-px h-6 bg-border mx-1" />

          {TYPE_FILTERS.map((t) => (
            <FilterPill
              key={t}
              label={t}
              active={activeType === t}
              onPress={() => updateFilter('type', t)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 2. HEADER */}
      <View className="mb-6">
        <Text className="text-3xl font-black tracking-tighter italic uppercase text-text-primary">
          Search Results
        </Text>
        <Text className="text-text-muted text-xs font-bold mt-1">
          Found results for{' '}
          <Text className="text-accent-primary">"{query}"</Text>
        </Text>
      </View>

      {/* 3. RESULTS AREA */}
      {isLoading ? (
        <View className="flex-row flex-wrap justify-between">
          {SKELETON_ITEMS.map((i) => (
            <View
              key={i}
              className="w-[48%] aspect-square rounded-2xl bg-background-secondary/50 border border-border mb-4 opacity-60"
            />
          ))}
        </View>
      ) : hasNoResults && query ? (
        <View className="items-center justify-center py-20 bg-background-secondary/30 rounded-3xl border border-border px-6">
          <Ionicons
            name="search-outline"
            size={56}
            color="#6b7280"
            style={{ opacity: 0.3, marginBottom: 16 }}
          />
          <Text className="text-xl font-black tracking-tighter uppercase text-text-primary mb-2">
            Ghost Town
          </Text>
          <Text className="text-text-secondary text-xs font-medium text-center">
            No results found with those specific filters.
          </Text>
        </View>
      ) : (
        <View className="gap-10">
          {/* CATEGORY: ARTISTS */}
          {results.artists.length > 0 && (
            <View>
              <Text className="text-[10px] font-black mb-4 text-text-muted uppercase tracking-[0.3em]">
                Top Artists
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
              >
                {results.artists.map((artist) => {
                  const uri = getMediaUrl(artist.image);
                  return (
                    <Pressable
                      key={artist.id}
                      onPress={() =>
                        router.push(
                          `/artist/${encodeURIComponent(artist.name)}` as Href
                        )
                      }
                      className="items-center gap-2 w-20 active:opacity-80"
                    >
                      <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent bg-background-secondary items-center justify-center">
                        {uri ? (
                          <Image
                            source={{ uri }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons name="person" size={28} color="#6b7280" />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        className="font-bold text-xs text-center text-text-primary w-full tracking-tight"
                      >
                        {artist.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* CATEGORY: ANIME */}
          {results.animes.length > 0 && (
            <View>
              <Text className="text-[10px] font-black mb-4 text-text-muted uppercase tracking-[0.3em]">
                Anime Series
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
              >
                {results.animes.map((anime) => {
                  const uri = getMediaUrl(anime.image);
                  return (
                    <Pressable
                      key={anime.id}
                      onPress={() =>
                        router.push(
                          `/anime/${encodeURIComponent(anime.name)}` as Href
                        )
                      }
                      className="gap-2 w-36 active:opacity-80"
                    >
                      <View className="aspect-video rounded-xl overflow-hidden border border-border bg-background-secondary">
                        {uri ? (
                          <Image
                            source={{ uri }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : null}
                      </View>
                      <Text
                        numberOfLines={1}
                        className="font-bold text-xs text-text-primary w-full tracking-tight"
                      >
                        {anime.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* CATEGORY: SONGS */}
          {results.songs.length > 0 && (
            <View>
              <Text className="text-[10px] font-black mb-4 text-text-muted uppercase tracking-[0.3em]">
                Songs Found
              </Text>
              <View className="gap-2">
                {results.songs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    queue={results.songs}
                    index={index}
                    shape="list"
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default SearchResultPage;