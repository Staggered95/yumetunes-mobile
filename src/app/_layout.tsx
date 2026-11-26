import "../global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { SongProvider } from "@/context/SongContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <PlaylistProvider>
            <PlaybackProvider>
              <SongProvider>
                <ThemeProvider>
                  <Stack screenOptions={{ headerShown: false }} />
                </ThemeProvider>
              </SongProvider>
            </PlaybackProvider>
          </PlaylistProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}