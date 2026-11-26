import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import api from "@/api/axios";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import { PaginatedResponse, Song } from "@/types";
import { getMediaUrl } from "@/utils";

interface SearchAutocompleteProps {
  autoFocus?: boolean;
  onSelectComplete?: () => void;
}

export default function SearchAutocomplete({
  autoFocus = false,
  onSelectComplete,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const router = useRouter();
  const { playQueue } = useSongs();
  const { colors } = useTheme();

  // 600ms Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed.length > 1) {
        fetchResults(trimmed);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const fetchResults = async (searchTerm: string) => {
    try {
      const { data } = await api.get<PaginatedResponse<Song>>("/songs/search", {
        params: { q: searchTerm },
      });
      setResults(data.data ?? []);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowDropdown(false);
    Keyboard.dismiss();
    onSelectComplete?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}` as Href);
  };

  const handleSelectSong = (index: number) => {
    playQueue(results, index);
    setShowDropdown(false);
    setQuery("");
    Keyboard.dismiss();
    onSelectComplete?.();
  };

  return (
    <View className="relative z-50 w-full">
      {/* Input Bar */}
      <View
        className={`flex-row items-center rounded-full border px-3.5 py-2 ${
          isFocused
            ? "border-accent-primary/50 bg-background-active"
            : "border-border bg-background-secondary"
        }`}
      >
        <Feather
          name="search"
          size={18}
          color={isFocused ? colors["--acc-primary"] : colors["--txt-muted"]}
        />

        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length > 1) setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          placeholder="Search for songs, artists, or anime..."
          placeholderTextColor={colors["--txt-muted"]}
          className="ml-2.5 flex-1 text-sm text-text-primary"
        />

        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
              setShowDropdown(false);
            }}
            hitSlop={8}
            className="ml-1 p-0.5"
          >
            <Feather name="x" size={16} color={colors["--txt-muted"]} />
          </Pressable>
        )}
      </View>

      {/* Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <View
          style={{ elevation: 12 }}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-2xl"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 8 }}
          >
            {results.map((song, index) => {
              const coverUri = getMediaUrl(song.cover_path, "image", 120);
              return (
                <Pressable
                  key={song.id}
                  onPress={() => handleSelectSong(index)}
                  className="flex-row items-center gap-3 rounded-xl p-2.5 active:bg-background-hover"
                >
                  {coverUri ? (
                    <Image
                      source={{ uri: coverUri }}
                      className="h-10 w-10 rounded-md bg-background-hover"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-md bg-background-hover">
                      <Feather
                        name="music"
                        size={16}
                        color={colors["--txt-muted"]}
                      />
                    </View>
                  )}

                  <View className="flex-1">
                    <Text
                      className="text-sm font-bold text-text-primary"
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <Text
                      className="text-xs font-medium text-text-secondary"
                      numberOfLines={1}
                    >
                      {song.artist} •{" "}
                      <Text className="text-text-muted">
                        {song.anime || "Single"}
                      </Text>
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}