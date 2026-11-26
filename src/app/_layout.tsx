import "../global.css";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { SongProvider } from "@/context/SongContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    AlfaSlabOne: require("../../assets/fonts/AlfaSlabOne-Regular.ttf"),
    GravitasOne: require("../../assets/fonts/GravitasOne-Regular.ttf"),
    Playwrite: require("../../assets/fonts/Playwrite-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LoadingProvider>
        <AuthProvider>
          <UserProvider>
            <PlaylistProvider>
              <PlaybackProvider>
                <SongProvider>
                  <ThemeProvider>
                    <ToastProvider>
                      <Stack screenOptions={{ headerShown: false }} />
                    </ToastProvider>
                  </ThemeProvider>
                </SongProvider>
              </PlaybackProvider>
            </PlaylistProvider>
          </UserProvider>
        </AuthProvider>
      </LoadingProvider>
    </SafeAreaProvider>
  );
}