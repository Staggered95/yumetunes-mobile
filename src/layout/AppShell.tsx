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
        />
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