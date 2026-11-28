import React, { useState } from "react";
import { StatusBar, View } from "react-native";
import { Stack } from "expo-router";
import AuthModal from "@/components/AuthModal";
import BottomPlayer from "@/components/BottomPlayer";
import FullscreenPlayer from "@/components/FullscreenPlayer";
import MobileNav from "@/components/MobileNav";
import Navbar from "@/components/Navbar";
import { useSongs } from "@/context/SongContext";
import { useTheme } from "@/context/ThemeContext";
import GlobalProgressBar from "@/minicomps/loading/GlobalProgressBar";

export default function AppShell() {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const { currentSong } = useSongs();
  const { colors, themeMode } = useTheme();

  return (
    <View className="flex-1 bg-background-primary">
      <StatusBar
        barStyle={themeMode === "dark" ? "light-content" : "dark-content"}
      />

      <GlobalProgressBar />
      <Navbar />

      {/* Active Page Content */}
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors["--bg-primary"] },
            animation: "fade",
          }}
        >
          {/* Top-level screens */}
          <Stack.Screen name="index" />
          <Stack.Screen name="animes" />
          <Stack.Screen name="artist-list" />
          <Stack.Screen name="genres" />
          <Stack.Screen name="library" />
          <Stack.Screen name="likedsongs" />
          <Stack.Screen name="search" />
          <Stack.Screen name="profile" />

          {/* Detail screens (native push transition) */}
          <Stack.Screen
            name="anime/[animeName]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="artist/[artistName]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="genre/[genreName]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="playlists/[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="reset-password/[id]/[token]"
            options={{ animation: "slide_from_right" }}
          />
        </Stack>
      </View>

      {/* Persistent Bottom Stack */}
      <BottomPlayer onExpand={() => setIsPlayerOpen(true)} />
      <MobileNav />

      {/* Global Overlays */}
      <FullscreenPlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        song={currentSong}
      />
      <AuthModal />
    </View>
  );
}