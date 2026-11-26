import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import api from "@/api/axios";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import ShuffleButton from "@/minicomps/ShuffleButton";
import Spinner from "@/minicomps/Spinner";
import { Song } from "@/types";
import { getMediaUrl } from "@/utils";

const getTypeWeight = (type?: string | null) => {
  const t = (type || "").toUpperCase();
  if (t.startsWith("OP")) return 1;
  if (t.startsWith("ED")) return 2;
  if (t.startsWith("OST")) return 3;
  return 4;
};

const formatSongType = (type?: string | null) => {
  if (!type) return "OST";
  const t = type.toUpperCase();
  if (t.startsWith("OP")) return "OP";
  if (t.startsWith("ED")) return "ED";
  return t;
};

export default function AnimePage() {
  const { title: rawTitle } = useLocalSearchParams<{ title?: string }>();
  const title = rawTitle ? decodeURIComponent(rawTitle) : "";

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { playQueue, playShuffledQueue, currentSong } = useSongs();
  const { colors } = useTheme();

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/songs/anime/${encodeURIComponent(title)}`
        );
        const rawList = data.data || data;
        const validSongs: Song[] = Array.isArray(rawList) ? rawList : [];

        const sortedSongs = [...validSongs].sort((a, b) => {
          const seasonA = parseInt(String(a.season ?? 1), 10) || 1;
          const seasonB = parseInt(String(b.season ?? 1), 10) || 1;
          if (seasonA !== seasonB) return seasonA - seasonB;

          const weightA = getTypeWeight(a.song_type);
          const weightB = getTypeWeight(b.song_type);
          if (weightA !== weightB) return weightA - weightB;

          return (a.song_type || "").localeCompare(b.song_type || "");
        });

        setSongs(sortedSongs);
      } catch (err) {
        console.error("Failed to fetch anime songs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (title) fetchSongs();
  }, [title]);

  const groupedSongs = useMemo(() => {
    return songs.reduce<
      Record<number, { song: Song; absoluteIndex: number }[]>
    >((acc, song, index) => {
      const s = parseInt(String(song.season ?? 1), 10) || 1;
      if (!acc[s]) acc[s] = [];
      acc[s].push({ song, absoluteIndex: index });
      return acc;
    }, {});
  }, [songs]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background-primary">
        <Spinner size="lg" />
        <Text className="text-sm font-black uppercase tracking-widest text-text-muted">
          Loading...
        </Text>
      </View>
    );
  }

  const heroCoverUrl = getMediaUrl(songs[0]?.cover_path, "image", 500);

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* HERO HEADER */}
      <View className="relative overflow-hidden bg-background-secondary px-6 pb-8 pt-8">
        {heroCoverUrl && (
          <Image
            source={{ uri: heroCoverUrl }}
            blurRadius={24}
            className="absolute inset-0 h-full w-full opacity-20"
            resizeMode="cover"
          />
        )}

        <View className="z-10 items-center gap-5">
          {/* Cover Art */}
          <View
            style={{ elevation: 14 }}
            className="h-48 w-48 overflow-hidden rounded-2xl border border-border bg-background-primary"
          >
            {heroCoverUrl ? (
              <Image
                source={{ uri: heroCoverUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Feather name="music" size={48} color={colors["--txt-muted"]} />
              </View>
            )}
          </View>

          {/* Title & Actions */}
          <View className="w-full items-center">
            <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-accent-primary">
              Anime Series
            </Text>
            <Text className="mb-5 text-center text-3xl font-black tracking-tighter text-text-primary">
              {title}
            </Text>

            {songs.length > 0 && (
              <View className="flex-row items-center gap-4">
                <Pressable
                  onPress={() => playQueue(songs, 0)}
                  style={{ elevation: 6 }}
                  accessibilityLabel="Play all"
                  className="h-12 w-12 items-center justify-center rounded-full bg-accent-primary active:scale-95"
                >
                  <Ionicons
                    name="play"
                    size={24}
                    color={colors["--bg-primary"]}
                    style={{ marginLeft: 2 }}
                  />
                </Pressable>

                <ShuffleButton
                  variant="action"
                  onPress={() => playShuffledQueue(songs)}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* SEASON TRACKLISTS */}
      <View className="px-4 pt-6">
        {songs.length > 0 ? (
          Object.keys(groupedSongs).map((seasonKey) => {
            const season = Number(seasonKey);
            return (
              <View key={`season-${season}`} className="mb-8">
                <View className="mb-4 flex-row items-center gap-3">
                  <Text className="text-lg font-black uppercase tracking-widest text-text-primary">
                    Season {season}
                  </Text>
                  <View className="h-px flex-1 bg-border" />
                </View>

                <View className="gap-1.5">
                  {groupedSongs[season].map(({ song, absoluteIndex }, idx) => {
                    const isCurrent = currentSong?.id === song.id;

                    return (
                      <Pressable
                        key={song.id}
                        onPress={() => playQueue(songs, absoluteIndex)}
                        className={`flex-row items-center gap-3 rounded-xl p-3 active:bg-background-active ${
                          isCurrent ? "bg-background-secondary" : ""
                        }`}
                      >
                        <Text
                          className={`w-6 text-center text-xs font-bold ${
                            isCurrent
                              ? "text-accent-primary"
                              : "text-text-muted"
                          }`}
                        >
                          {(idx + 1).toString().padStart(2, "0")}
                        </Text>

                        <View className="flex-1 pr-2">
                          <Text
                            className={`text-sm font-bold ${
                              isCurrent
                                ? "text-accent-primary"
                                : "text-text-primary"
                            }`}
                            numberOfLines={1}
                          >
                            {song.title}
                          </Text>
                          <Text
                            className="mt-0.5 text-xs text-text-secondary"
                            numberOfLines={1}
                          >
                            {song.artist}
                          </Text>
                        </View>

                        <View className="rounded-full border border-accent-primary/30 bg-accent-primary/10 px-2.5 py-1">
                          <Text className="text-[10px] font-black uppercase tracking-wider text-accent-primary">
                            {formatSongType(song.song_type)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })
        ) : (
          <Text className="py-16 text-center text-sm italic text-text-muted">
            No songs found for this series.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}