import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { vars } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayback } from "@/context/PlaybackContext";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import LiveLyrics from "@/minicomps/LiveLyrics";
import MediaControllers from "@/minicomps/MediaControllerIcons";
import OptionsMenu from "@/minicomps/OptionsMenu";
import ProgressBar from "@/minicomps/ProgressBar";
import { LyricLine, Song } from "@/types";
import { getMediaUrl, parseLRC } from "@/utils";

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.82);
const COLLAPSED_PEEK = 84;
const COLLAPSED_Y = SHEET_HEIGHT - COLLAPSED_PEEK;

export default function FullscreenPlayer({
  isOpen,
  onClose,
  song,
}: FullscreenPlayerProps) {
  const { isPlaying } = usePlayback();
  const { queue, currentIndex, playQueue } = useSongs();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"queue" | "lyrics">("queue");
  const [lyricLang, setLyricLang] = useState<"EN" | "RO" | "JP">("EN");
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  const sheetTranslateY = useRef(new Animated.Value(COLLAPSED_Y)).current;

  useEffect(() => {
    if (song?.lyrics) {
      setLyrics(parseLRC(song.lyrics));
    } else {
      setLyrics([]);
    }
  }, [song]);

  useEffect(() => {
    if (!isOpen) {
      setIsSheetExpanded(false);
      sheetTranslateY.setValue(COLLAPSED_Y);
    }
  }, [isOpen, sheetTranslateY]);

  useEffect(() => {
    Animated.spring(sheetTranslateY, {
      toValue: isSheetExpanded ? 0 : COLLAPSED_Y,
      damping: 24,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [isSheetExpanded, sheetTranslateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 12,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -40) setIsSheetExpanded(true);
          else if (gesture.dy > 40) setIsSheetExpanded(false);
        },
      }),
    []
  );

  const handleTabClick = (tab: "queue" | "lyrics") => {
    setActiveTab(tab);
    if (!isSheetExpanded) setIsSheetExpanded(true);
  };

  const handleLangToggle = () => {
    setLyricLang((prev) =>
      prev === "EN" ? "RO" : prev === "RO" ? "JP" : "EN"
    );
  };

  if (!song) return null;

  const coverUrl = getMediaUrl(song.cover_path, "image", 640);

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        if (isSheetExpanded) {
          setIsSheetExpanded(false);
        } else {
          onClose();
        }
      }}
    >
      <View
        style={[vars(colors), { paddingTop: insets.top }]}
        className="flex-1 bg-background-primary"
      >
        {/* TOP NAV BAR */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="flex-row items-center gap-1.5 py-1"
          >
            <Feather
              name="chevron-down"
              size={22}
              color={colors["--txt-secondary"]}
            />
            <Text className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Minimize
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            {song.song_type && (
              <View className="rounded-sm border border-accent-primary/30 bg-accent-primary/20 px-2 py-0.5">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-accent-primary">
                  {song.song_type}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* MAIN PLAYER AREA */}
        <Pressable
          onPress={() => {
            if (isSheetExpanded) setIsSheetExpanded(false);
          }}
          className="flex-1 justify-center px-6 pb-24"
        >
          {/* Cover Art */}
          <View
            style={{ elevation: 16 }}
            className="mx-auto mb-6 aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-border bg-background-secondary"
          >
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Feather name="music" size={64} color={colors["--txt-muted"]} />
              </View>
            )}
          </View>

          {/* Song Info + Options */}
          <View className="mb-5 flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text
                className="text-2xl font-black text-text-primary"
                numberOfLines={1}
              >
                {song.title}
              </Text>
              <Text
                className="mt-1 text-base text-text-secondary"
                numberOfLines={1}
              >
                {song.artist || song.anime || "YumeTunes"}
              </Text>
            </View>

            <OptionsMenu
              song={song}
              className="bg-background-secondary"
            />
          </View>

          {/* Progress Bar */}
          <View className="mb-5">
            <ProgressBar variant="fullscreen" />
          </View>

          {/* Utility Controls Pill */}
          <View className="items-center">
            <MediaControllers variant="utility" songId={song.id} />
          </View>
        </Pressable>

        {/* BOTTOM UTILITY SHEET (QUEUE & LYRICS) */}
        <Animated.View
          style={{
            height: SHEET_HEIGHT,
            transform: [{ translateY: sheetTranslateY }],
            paddingBottom: Math.max(insets.bottom, 12),
            elevation: 24,
          }}
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-border bg-background-secondary"
        >
          {/* Drag Handle */}
          <View
            {...panResponder.panHandlers}
            className="w-full items-center py-3"
          >
            <Pressable
              onPress={() => setIsSheetExpanded((prev) => !prev)}
              hitSlop={12}
              className="h-1.5 w-12 rounded-full bg-border"
            />
          </View>

          {/* Tab Header */}
          <View className="flex-row items-center justify-center border-b border-border px-4 pb-3">
            <View className="flex-row gap-8">
              <Pressable
                onPress={() => handleTabClick("queue")}
                className={`border-b-2 px-2 pb-1.5 ${
                  activeTab === "queue"
                    ? "border-accent-primary"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-widest ${
                    activeTab === "queue"
                      ? "text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  Play Queue
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleTabClick("lyrics")}
                className={`border-b-2 px-2 pb-1.5 ${
                  activeTab === "lyrics"
                    ? "border-accent-primary"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase tracking-widest ${
                    activeTab === "lyrics"
                      ? "text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  Lyrics
                </Text>
              </Pressable>
            </View>

            {activeTab === "lyrics" && lyrics.length > 0 && (
              <Pressable
                onPress={handleLangToggle}
                className="absolute right-4 rounded-full border border-border bg-background-primary px-3 py-1"
              >
                <Text className="text-[10px] font-bold tracking-widest text-text-primary">
                  {lyricLang}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Sheet Content */}
          {isSheetExpanded && (
            <View className="flex-1">
              {activeTab === "queue" ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
                >
                  {queue.map((track, index) => {
                    const isCurrent = index === currentIndex;
                    const hasPlayed = index < currentIndex;
                    const thumbUrl = getMediaUrl(track.cover_path, "image", 120);

                    return (
                      <Pressable
                        key={`${track.id}-${index}`}
                        onPress={() => playQueue(queue, index)}
                        className={`mb-1 flex-row items-center gap-3 rounded-xl p-2.5 ${
                          isCurrent
                            ? "bg-background-active"
                            : "active:bg-background-hover"
                        } ${hasPlayed ? "opacity-50" : "opacity-100"}`}
                      >
                        <View className="w-6 items-center">
                          {isCurrent && isPlaying ? (
                            <Ionicons
                              name="stats-chart"
                              size={14}
                              color={colors["--acc-primary"]}
                            />
                          ) : (
                            <Text className="text-xs font-bold text-text-muted">
                              {index + 1}
                            </Text>
                          )}
                        </View>

                        {thumbUrl ? (
                          <Image
                            source={{ uri: thumbUrl }}
                            className="h-10 w-10 rounded-md bg-background-primary"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-10 w-10 items-center justify-center rounded-md bg-background-primary">
                            <Feather
                              name="music"
                              size={16}
                              color={colors["--txt-muted"]}
                            />
                          </View>
                        )}

                        <View className="flex-1 pr-2">
                          <Text
                            className={`text-sm font-bold ${
                              isCurrent
                                ? "text-accent-primary"
                                : "text-text-primary"
                            }`}
                            numberOfLines={1}
                          >
                            {track.title}
                          </Text>
                          <Text
                            className="mt-0.5 text-xs text-text-secondary"
                            numberOfLines={1}
                          >
                            {track.artist}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : lyrics.length > 0 ? (
                <LiveLyrics lyrics={lyrics} language={lyricLang} />
              ) : (
                <View className="flex-1 items-center justify-center px-6">
                  <Text className="text-center text-sm font-bold uppercase tracking-widest text-text-muted">
                    No Lyrics Available
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}