import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { vars } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/api/axios";
import PlaylistModal, { PlaylistModalView } from "@/components/PlaylistModal";
import { usePlaylists } from "@/context/PlaylistContext";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Playlist, Song } from "@/types";

type FeatherIconName = keyof typeof Feather.glyphMap;

export interface MenuOptionItem {
  id: string;
  label: string;
  icon: FeatherIconName;
  onPress: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

interface OptionsMenuProps {
  song?: Song | null;
  playlist?: Playlist | null;
  playlistId?: number | null;
  variant?: "song" | "playlistSong" | "playlist";
  hide?: string[];
  extraOptions?: MenuOptionItem[];
  onRemove?: (songId: number) => void;
  onPlaylistSuccess?: (result?: unknown) => void;
  className?: string;
}

const VARIANT_PRESETS: Record<string, string[]> = {
  song: ["playNext", "addToQueue", "addToPlaylist"],
  playlistSong: ["playNext", "addToQueue", "removeFromPlaylist"],
  playlist: ["editPlaylist", "deletePlaylist"],
};

export default function OptionsMenu({
  song = null,
  playlist = null,
  playlistId = null,
  variant = "song",
  hide = [],
  extraOptions = [],
  onRemove,
  onPlaylistSuccess,
  className = "",
}: OptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<PlaylistModalView | null>(null);

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { addToQueue, playNextInQueue } = useSongs();
  const { addToast } = useToast();
  const { refreshPlaylists } = usePlaylists();

  if (variant === "playlist" ? !playlist : !song) return null;

  const handleSongAction = (callback: (s: Song) => void, message: string) => {
    if (!song) return;
    callback(song);
    addToast(message, "success");
    setIsOpen(false);
  };

  const handleRemoveFromPlaylist = async () => {
    if (!song) return;
    setIsOpen(false);

    if (!playlistId) {
      onRemove?.(song.id);
      return;
    }

    try {
      const { data } = await api.delete(
        `/playlists/${playlistId}/songs/${song.id}`
      );
      if (data.success) {
        addToast("Removed from playlist", "success");
        refreshPlaylists();
        onRemove?.(song.id);
      }
    } catch {
      addToast("Failed to remove song.", "error");
    }
  };

  const actionRegistry: Record<string, MenuOptionItem> = {
    playNext: {
      id: "playNext",
      label: "Play Next",
      icon: "chevrons-right",
      onPress: () => handleSongAction(playNextInQueue, "Will play next ⏭️"),
    },
    addToQueue: {
      id: "addToQueue",
      label: "Add to Queue",
      icon: "list",
      onPress: () => handleSongAction(addToQueue, "Added to your queue 🎧"),
    },
    addToPlaylist: {
      id: "addToPlaylist",
      label: "Add to Playlist",
      icon: "folder-plus",
      dividerBefore: true,
      onPress: () => {
        setIsOpen(false);
        setModalMode("list");
      },
    },
    removeFromPlaylist: {
      id: "removeFromPlaylist",
      label: "Remove from Playlist",
      icon: "trash-2",
      dividerBefore: true,
      danger: true,
      onPress: handleRemoveFromPlaylist,
    },
    editPlaylist: {
      id: "editPlaylist",
      label: "Edit Playlist",
      icon: "edit-2",
      onPress: () => {
        setIsOpen(false);
        setModalMode("edit");
      },
    },
    deletePlaylist: {
      id: "deletePlaylist",
      label: "Delete Playlist",
      icon: "trash-2",
      dividerBefore: true,
      danger: true,
      onPress: () => {
        setIsOpen(false);
        setModalMode("delete");
      },
    },
  };

  const presetKeys = VARIANT_PRESETS[variant] || VARIANT_PRESETS.song;
  const menuItems: MenuOptionItem[] = [
    ...presetKeys
      .filter((key) => !hide.includes(key))
      .map((key) => actionRegistry[key])
      .filter(Boolean),
    ...extraOptions,
  ];

  if (menuItems.length === 0) return null;

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        hitSlop={8}
        accessibilityLabel="More options"
        className={`rounded-full p-2 active:bg-background-hover ${className}`}
      >
        <Feather
          name="more-vertical"
          size={20}
          color={colors["--txt-secondary"]}
        />
      </Pressable>

      {/* Bottom Action Sheet */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={vars(colors)} className="flex-1 justify-end">
          <Pressable
            onPress={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <View
            style={{ paddingBottom: Math.max(insets.bottom, 16), elevation: 24 }}
            className="rounded-t-3xl border-t border-border bg-background-secondary px-4 pt-3"
          >
            {/* Sheet Handle */}
            <View className="mb-3 items-center">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>

            {/* Context Header */}
            <View className="mb-2 border-b border-border px-2 pb-3">
              <Text
                className="text-sm font-black text-text-primary"
                numberOfLines={1}
              >
                {variant === "playlist" ? playlist?.name : song?.title}
              </Text>
              {variant !== "playlist" && song?.artist && (
                <Text
                  className="mt-0.5 text-xs text-text-secondary"
                  numberOfLines={1}
                >
                  {song.artist}
                </Text>
              )}
            </View>

            {/* Action Rows */}
            <View className="gap-1 py-1">
              {menuItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && index > 0 && (
                    <View className="mx-2 my-1 h-px bg-border" />
                  )}
                  <Pressable
                    onPress={item.onPress}
                    className={`flex-row items-center gap-3.5 rounded-xl px-3 py-3.5 ${
                      item.danger
                        ? "active:bg-error/10"
                        : "active:bg-background-active"
                    }`}
                  >
                    <Feather
                      name={item.icon}
                      size={18}
                      color={
                        item.danger
                          ? colors["--stat-error"]
                          : colors["--txt-muted"]
                      }
                    />
                    <Text
                      className={`text-sm font-bold ${
                        item.danger ? "text-error" : "text-text-primary"
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {modalMode && (
        <PlaylistModal
          isOpen={Boolean(modalMode)}
          onClose={() => setModalMode(null)}
          initialView={modalMode}
          songId={song?.id ?? null}
          playlist={playlist}
          onSuccess={onPlaylistSuccess}
        />
      )}
    </>
  );
}