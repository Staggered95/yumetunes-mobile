import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import axios from "axios";
import api from "@/api/axios";
import { usePlaylists } from "@/context/PlaylistContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import BaseModal from "@/minicomps/BaseModal";
import { Playlist } from "@/types";

export type PlaylistModalView = "list" | "create" | "edit" | "delete";

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: PlaylistModalView;
  songId?: number | null;
  playlist?: Playlist | null;
  onSuccess?: (result?: unknown) => void;
}

const MODAL_TITLES: Record<PlaylistModalView, string> = {
  list: "Add to Playlist",
  create: "New Playlist",
  edit: "Edit Playlist",
  delete: "Delete Playlist",
};

export default function PlaylistModal({
  isOpen,
  onClose,
  initialView = "list",
  songId = null,
  playlist = null,
  onSuccess,
}: PlaylistModalProps) {
  const { addToast } = useToast();
  const { colors } = useTheme();
  const { playlists, setPlaylists, isLoading, refreshPlaylists } =
    usePlaylists();

  const [view, setView] = useState<PlaylistModalView>(initialView);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setView("list");
      return;
    }

    setView(initialView);

    if (initialView === "edit" && playlist) {
      setName(playlist.name || "");
      setDescription(playlist.description || "");
    } else {
      setName("");
      setDescription("");
    }

    if (initialView === "list") {
      refreshPlaylists();
    }
  }, [isOpen, initialView, playlist, refreshPlaylists]);

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
      const { data } = await api.post(`/playlists/${playlistId}/songs`, {
        songID: songId,
        positionOrder: 1,
      });

      if (data.success) {
        addToast("Added to playlist! 🎵", "success");
        refreshPlaylists();
        onSuccess?.(playlistId);
        onClose();
      } else {
        addToast(data.message || "Song already in playlist", "warning");
        onClose();
      }
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;
      addToast(msg || "Failed to add song.", "error");
    }
  };

  const handleCreateOrEdit = async () => {
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (view === "edit" && playlist) {
        const { data } = await api.put(`/playlists/${playlist.id}`, {
          name: name.trim(),
          description: description.trim(),
        });

        if (data.success) {
          const updated = data.data;
          setPlaylists((prev) =>
            prev.map((p) =>
              String(p.id) === String(playlist.id)
                ? {
                    ...p,
                    name: updated.name,
                    description: updated.description,
                  }
                : p
            )
          );
          addToast("Playlist updated!", "success");
          onSuccess?.(updated);
          onClose();
        }
      } else {
        const { data } = await api.post("/playlists", {
          name: name.trim(),
          description: description.trim(),
        });

        if (data.success) {
          const newPlaylist: Playlist = {
            ...data.data,
            auto_covers: [],
            song_count: 0,
          };
          setPlaylists((prev) => [newPlaylist, ...prev]);
          setName("");
          setDescription("");
          addToast(`Created ${newPlaylist.name}!`, "success");
          onSuccess?.(newPlaylist);

          if (!songId) {
            onClose();
          } else {
            setView("list");
          }
        }
      }
    } catch {
      addToast(
        view === "edit"
          ? "Failed to update playlist."
          : "Failed to create playlist.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!playlist || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.delete(`/playlists/${playlist.id}`);

      if (data.success) {
        setPlaylists((prev) =>
          prev.filter((p) => String(p.id) !== String(playlist.id))
        );
        addToast(`Deleted "${playlist.name}"`, "success");
        onSuccess?.(playlist.id);
        onClose();
      }
    } catch {
      addToast("Failed to delete playlist.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={MODAL_TITLES[view] || "Playlist"}
    >
      {/* VIEW 1: ADD SONG TO PLAYLIST */}
      {view === "list" && (
        <View>
          <ScrollView
            className="mb-5 max-h-72"
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View className="gap-3 py-2">
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className="h-12 w-full rounded-lg bg-background-active/50"
                  />
                ))}
              </View>
            ) : playlists.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-sm text-text-secondary">
                  You don&apos;t have any playlists yet.
                </Text>
              </View>
            ) : (
              <View className="gap-1.5">
                {playlists.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => handleAddToPlaylist(p.id)}
                    className="flex-row items-center justify-between rounded-xl border border-transparent bg-background-primary/50 p-4 active:border-border active:bg-background-hover"
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="font-bold text-text-primary"
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                      <Text
                        className="text-xs text-text-muted"
                        numberOfLines={1}
                      >
                        {p.song_count || 0} tracks
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-accent-primary">
                      + Add
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          <Pressable
            onPress={() => setView("create")}
            className="w-full items-center rounded-xl border border-border bg-background-primary py-3.5 active:bg-background-hover"
          >
            <Text className="text-xs font-black uppercase tracking-widest text-text-primary">
              Create New Playlist
            </Text>
          </Pressable>
        </View>
      )}

      {/* VIEW 2 & 3: CREATE OR EDIT PLAYLIST */}
      {(view === "create" || view === "edit") && (
        <View className="gap-5">
          <View className="gap-4">
            <View>
              <Text className="mb-2 text-xs font-black uppercase tracking-widest text-text-secondary">
                Playlist Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Late Night Anime Vibes"
                placeholderTextColor={colors["--txt-muted"]}
                className="w-full rounded-xl border border-border bg-background-primary p-4 text-sm text-text-primary"
              />
            </View>

            <View>
              <Text className="mb-2 text-xs font-black uppercase tracking-widest text-text-secondary">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Tell us about the mood..."
                placeholderTextColor={colors["--txt-muted"]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="h-28 w-full rounded-xl border border-border bg-background-primary p-4 text-sm text-text-primary"
              />
            </View>
          </View>

          <View className="flex-row gap-3 pt-1">
            <Pressable
              onPress={() =>
                view === "create" && songId ? setView("list") : onClose()
              }
              disabled={isSubmitting}
              className="flex-1 items-center rounded-xl border border-border py-3.5 active:bg-background-hover"
            >
              <Text className="text-sm font-bold text-text-secondary">
                {view === "create" && songId ? "Back" : "Cancel"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCreateOrEdit}
              disabled={!name.trim() || isSubmitting}
              className={`flex-1 items-center rounded-xl bg-accent-primary py-3.5 active:opacity-85 ${
                !name.trim() || isSubmitting ? "opacity-50" : ""
              }`}
            >
              <Text className="text-xs font-black uppercase tracking-widest text-background-primary">
                {isSubmitting
                  ? view === "edit"
                    ? "Saving..."
                    : "Creating..."
                  : view === "edit"
                    ? "Save"
                    : "Create"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* VIEW 4: DELETE CONFIRMATION */}
      {view === "delete" && playlist && (
        <View className="gap-6">
          <Text className="text-sm leading-relaxed text-text-secondary">
            Are you sure you want to delete{" "}
            <Text className="font-bold text-text-primary">
              &quot;{playlist.name}&quot;
            </Text>
            ? This action cannot be undone.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              className="flex-1 items-center rounded-xl border border-border py-3.5 active:bg-background-hover"
            >
              <Text className="text-sm font-bold text-text-secondary">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={isSubmitting}
              className={`flex-1 items-center rounded-xl bg-error py-3.5 active:opacity-85 ${
                isSubmitting ? "opacity-50" : ""
              }`}
            >
              <Text className="text-xs font-black uppercase tracking-widest text-background-primary">
                {isSubmitting ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </BaseModal>
  );
}