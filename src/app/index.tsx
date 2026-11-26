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
import { useTheme } from "@/context/ThemeContext";
import api from "@/api/axios";

interface Song {
  id: number;
  title: string;
  song_type: string | null;
  file_path: string;
  cover_path: string | null;
  duration_seconds: number;
  season: number | null;
  anime: string | null;
  artist: string | null;
  genres: string[];
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getCoverUri = (path: string | null) => {
  if (!path) return undefined;
  return path.startsWith("http")
    ? path
    : `https://yumetunes.duckdns.org${path}`;
};

export default function HomeScreen() {
  const { themeFamily, setThemeFamily, themeMode, toggleThemeMode, colors } =
    useTheme();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/songs/all")
      .then((res) => setSongs(res.data?.data ?? []))
      .catch((err) =>
        setError(err.response?.status ? `HTTP ${err.response.status}` : err.message)
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-primary px-4 pt-4">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-accent-primary">YumeTunes</Text>
          <Text className="text-xs text-text-muted">{songs.length} tracks loaded</Text>
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
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const coverUri = getCoverUri(item.cover_path);
          return (
            <Pressable className="mb-2.5 flex-row items-center gap-3 rounded-xl border border-border bg-background-secondary p-2.5 active:bg-background-hover">
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
                  className="text-sm font-semibold text-text-primary"
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

                {item.genres?.length > 0 && (
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
    </SafeAreaView>
  );
}