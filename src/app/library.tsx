import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { ApiResponse, Playlist } from '../types';
import Collage from '../minicomps/Collage';
import PlaylistModal from '../components/PlaylistModal';



const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];

const LibraryPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchLibrary = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<ApiResponse<Playlist[]>>('/playlists');
        if (data.success) {
          setPlaylists(data.data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching library:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary px-6">
        <Text className="text-text-secondary text-center text-base">
          Please log in to view your library.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 64,
          paddingBottom: 128,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-8 gap-4">
          <View className="gap-1">
            <Text className="text-4xl font-black tracking-tighter uppercase italic text-text-primary">
              Your Library
            </Text>
            <Text className="text-text-muted text-xs font-bold tracking-widest uppercase">
              {playlists.length + 1} Collections
            </Text>
          </View>

          <Pressable
            onPress={() => setIsModalOpen(true)}
            className="self-start px-5 py-3 bg-background-secondary active:bg-background-hover border border-border rounded-xl active:scale-95"
          >
            <Text className="text-accent-primary font-black text-xs uppercase tracking-widest">
              + Create New Playlist
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          /* Skeleton Loader Grid */
          <View className="flex-row flex-wrap justify-between">
            {SKELETON_ITEMS.map((i) => (
              <View key={i} className="w-[48%] mb-5 opacity-60">
                <View className="aspect-square bg-background-secondary rounded-2xl border border-border mb-3" />
                <View className="h-4 w-3/4 bg-background-secondary rounded" />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {/* 1. THE LIKED SONGS HERO CARD */}
            <Pressable
              onPress={() => router.push('/likedsongs' as Href)}
              className="w-[48%] mb-4 bg-background-secondary/20 p-3 rounded-3xl active:bg-background-hover border border-border/50"
            >
              <View className="w-full aspect-square mb-3 rounded-2xl overflow-hidden bg-accent-primary items-center justify-center">
                <Ionicons name="heart" size={56} color="#000" />
              </View>
              <Text
                numberOfLines={1}
                className="font-black text-sm tracking-tight text-text-primary"
              >
                Liked Songs
              </Text>
              <Text className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                Special Collection
              </Text>
            </Pressable>

            {/* 2. USER PLAYLISTS GRID */}
            {playlists.map((playlist) => (
              <Pressable
                key={playlist.id}
                onPress={() =>
                  router.push(`/playlist/${playlist.id}` as Href)
                }
                className="w-[48%] mb-4 bg-background-secondary/20 p-3 rounded-3xl active:bg-background-hover border border-border/50"
              >
                <View className="w-full aspect-square mb-3 rounded-2xl overflow-hidden bg-background-primary">
                  <Collage covers={playlist.auto_covers || []} />
                </View>
                <Text
                  numberOfLines={1}
                  className="font-black text-sm tracking-tight text-text-primary"
                >
                  {playlist.name}
                </Text>
                <Text className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                  {playlist.song_count ?? 0} tracks
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <PlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialView="create"
      />
    </View>
  );
};

export default LibraryPage;