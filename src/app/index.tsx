import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/api/axios";
import { usePlayback } from "@/context/PlaybackContext";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import { PaginatedResponse, Song } from "@/types";
import { formatDuration, getMediaUrl } from "@/utils";

export default function HomeScreen() {
  const { themeFamily, setThemeFamily, themeMode, toggleThemeMode, colors } =
    useTheme();
  const { currentSong, isShuffle, playQueue, nextSong, prevSong, toggleShuffle } =
    useSongs();
  const { isPlaying, isBuffering, currentTime, duration, togglePlay } =
    usePlayback();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PaginatedResponse<Song>>("/songs/all")
      .then((res) => setSongs(res.data?.data ?? []))
      .catch((err) =>
        setError(
          err.response?.status ? `HTTP ${err.response.status}` : err.message
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-primary px-4 pt-4">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-accent-primary">
            YumeTunes
          </Text>
          <Text className="text-xs text-text-muted">
            {songs.length} tracks loaded
          </Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() =>
              setThemeFamily(themeFamily === "default" ? "gruvbox" : "default")
            }
            className="rounded-lg border border-border bg-background-secondary px-3 py-1.5"
          >
            <Text className="text-xs font-medium text-text-primary">
              {themeFamily}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleThemeMode}
            className="rounded-lg bg-accent-primary px-3 py-1.5"
          >
            <Text className="text-xs font-medium text-text-primary">
              {themeMode}
            </Text>
          </Pressable>
        </View>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color={colors["--acc-primary"]}
          className="mt-10"
        />
      )}
      {error && <Text className="text-error">Error: {error}</Text>}

      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item, index }) => {
          const coverUri = getMediaUrl(item.cover_path, "image", 200);
          const isCurrent = currentSong?.id === item.id;

          return (
            <Pressable
              onPress={() => playQueue(songs, index)}
              className={`mb-2.5 flex-row items-center gap-3 rounded-xl border p-2.5 active:bg-background-hover ${
                isCurrent
                  ? "border-accent-primary bg-background-active"
                  : "border-border bg-background-secondary"
              }`}
            >
              {coverUri ? (
                <Image
                  source={{ uri: coverUri }}
                  className="h-14 w-14 rounded-lg bg-background-hover"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-14 w-14 items-center justify-center rounded-lg bg-background-hover">
                  <Text className="text-lg text-text-muted">♪</Text>
                </View>
              )}

              <View className="flex-1">
                <Text
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-accent-primary" : "text-text-primary"
                  }`}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  className="mt-0.5 text-xs text-text-secondary"
                  numberOfLines={1}
                >
                  {[item.artist, item.anime].filter(Boolean).join(" • ")}
                </Text>

                {item.genres && item.genres.length > 0 && (
                  <View className="mt-1.5 flex-row flex-wrap gap-1">
                    {item.genres.slice(0, 2).map((genre) => (
                      <View
                        key={genre}
                        className="rounded-full bg-background-hover px-2 py-0.5"
                      >
                        <Text className="text-[10px] text-accent-tertiary">
                          {genre}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Text className="text-xs text-text-muted">
                {formatDuration(item.duration_seconds)}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Temporary Test Mini-Player */}
      {currentSong && (
        <View className="mb-2 mt-2 rounded-xl border border-border bg-background-secondary px-3.5 py-3">
          <View className="flex-row items-center justify-between">
            <View className="mr-3 flex-1">
              <Text
                className="text-sm font-semibold text-accent-primary"
                numberOfLines={1}
              >
                {currentSong.title}
              </Text>
              <Text className="mt-0.5 text-xs text-text-muted">
                {isBuffering
                  ? "Buffering..."
                  : `${formatDuration(currentTime)} / ${formatDuration(
                      duration || currentSong.duration_seconds
                    )}`}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Pressable
                onPress={toggleShuffle}
                className={`rounded-lg px-2.5 py-2 ${
                  isShuffle ? "bg-accent-secondary" : "bg-background-hover"
                }`}
              >
                <Text className="text-xs font-medium text-text-primary">
                  Shuf
                </Text>
              </Pressable>
              <Pressable
                onPress={() => prevSong()}
                className="rounded-lg bg-background-hover px-2.5 py-2"
              >
                <Text className="text-xs font-medium text-text-primary">
                  Prev
                </Text>
              </Pressable>
              <Pressable
                onPress={togglePlay}
                className="rounded-lg bg-accent-primary px-3 py-2"
              >
                <Text className="text-xs font-semibold text-text-primary">
                  {isPlaying ? "Pause" : "Play"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => nextSong()}
                className="rounded-lg bg-background-hover px-2.5 py-2"
              >
                <Text className="text-xs font-medium text-text-primary">
                  Next
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}