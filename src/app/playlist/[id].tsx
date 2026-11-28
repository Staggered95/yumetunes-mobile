import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import { useSongs } from '../../context/SongContext';
import Collage from '../../minicomps/Collage';
import { getMediaUrl } from '../../utils/media';
import ShuffleButton from '../../minicomps/ShuffleButton';
import OptionsMenu from '../../minicomps/OptionsMenu';
import PlaylistModal from '../../components/PlaylistModal';
import type { PlaylistSong } from '../../types/song';
import type { Playlist, PlaylistDetailData } from '../../types/playlist';

type ModalMode = 'edit' | 'delete' | null;

const PlaylistPage: React.FC = () => {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const playlistId = Number(id);
  const router = useRouter();
  const { playQueue, playShuffledQueue } = useSongs();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [playlistMeta, setPlaylistMeta] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data } = await api.get<{
          success: boolean;
          data: PlaylistDetailData;
        }>(`/playlists/${id}`);

        if (data.success) {
          setPlaylistMeta(data.data.playlist);
          setSongs(data.data.songs || []);
        }
      } catch (error) {
        console.error('❌ Failed to fetch playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  const renderSong = useCallback(
    ({ item, index }: { item: PlaylistSong; index: number }) => (
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
          <OptionsMenu
            song={item}
            variant="playlistSong"
            playlistId={playlistId}
            onRemove={(removedId: number) =>
              setSongs((prev) => prev.filter((s) => s.id !== removedId))
            }
          />
        </View>
      </Pressable>
    ),
    [songs, playQueue, playlistId]
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!playlistMeta) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center px-6">
        <Text className="text-text-secondary text-center text-base">
          Playlist not found.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-primary">
      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSong}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* 1. HERO HEADER */}
            <View className="px-6 pt-16 pb-8 bg-background-secondary/60 items-center">
              <View className="w-48 h-48 rounded-3xl overflow-hidden mb-6 bg-background-primary">
                <Collage covers={playlistMeta.auto_covers || []} />
              </View>

              <Text className="text-[10px] font-black tracking-[0.4em] uppercase text-accent-primary mb-2">
                Playlist
              </Text>
              <Text
                numberOfLines={2}
                className="text-4xl font-black tracking-tighter italic uppercase text-text-primary text-center"
              >
                {playlistMeta.name}
              </Text>
              <Text
                numberOfLines={2}
                className="text-text-secondary text-sm font-medium text-center mt-2 max-w-xs"
              >
                {playlistMeta.description || 'A custom YumeTunes collection.'}
              </Text>

              <View className="flex-row items-center gap-3 mt-3">
                <Text className="text-text-primary text-xs font-bold">You</Text>
                <View className="w-1.5 h-1.5 bg-border rounded-full" />
                <Text className="text-text-muted text-xs font-bold">
                  {songs.length} Tracks
                </Text>
              </View>
            </View>

            {/* 2. ACTION ROW */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border/50 bg-background-primary">
              <Pressable
                onPress={() => playQueue(songs, 0)}
                disabled={songs.length === 0}
                className={`w-14 h-14 bg-accent-primary rounded-full items-center justify-center active:scale-95 ${
                  songs.length === 0 ? 'opacity-50' : ''
                }`}
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

              <View className="ml-auto flex-row items-center gap-2">
                <Pressable
                  onPress={() => setModalMode('edit')}
                  className="p-3 rounded-full bg-background-secondary border border-border active:bg-background-hover"
                >
                  <Ionicons name="create-outline" size={20} color="#9ca3af" />
                </Pressable>

                <Pressable
                  onPress={() => setModalMode('delete')}
                  className="p-3 rounded-full bg-background-secondary border border-border active:bg-red-500/10"
                >
                  <Ionicons name="trash-outline" size={20} color="#f87171" />
                </Pressable>
              </View>
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
        ListEmptyComponent={
          <View className="items-center justify-center py-20 gap-3">
            <Ionicons
              name="musical-notes-outline"
              size={56}
              color="#6b7280"
              style={{ opacity: 0.3 }}
            />
            <Text className="text-text-muted font-bold text-sm tracking-widest uppercase">
              This playlist is empty
            </Text>
          </View>
        }
      />

      <PlaylistModal
        isOpen={Boolean(modalMode)}
        onClose={() => setModalMode(null)}
        initialView={modalMode || 'edit'}
        playlist={playlistMeta}
        onSuccess={(result?: unknown) => {
          if (modalMode === 'edit' && result && typeof result === 'object') {
            const updated = result as {
              name?: string;
              description?: string | null;
            };
            setPlaylistMeta((prev) =>
              prev
                ? {
                    ...prev,
                    name: updated.name ?? prev.name,
                    description:
                      updated.description !== undefined
                        ? updated.description
                        : prev.description,
                  }
                : prev
            );
          } else if (modalMode === 'delete') {
            router.replace('/');
          }
        }}
      />
    </View>
  );
};

export default PlaylistPage;