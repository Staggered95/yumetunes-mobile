import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AudioMetadata,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import Constants, { ExecutionEnvironment } from "expo-constants";
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

interface PositionSnapshot {
  currentTime: number;
  duration: number;
}

interface PlaybackContextValue {
  isPlaying: boolean;
  isBuffering: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  endedCount: number;
  playSong: (url: string, metadata?: AudioMetadata) => void;
  togglePlay: () => void;
  pause: () => void;
  seekTo: (seconds: number) => Promise<void>;
  handleVolumeChange: (value: number) => void;
  getPositionSnapshot: () => PositionSnapshot;
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(
  undefined
);

export const PlaybackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [volume, setVolume] = useState<number>(1.0);
  const [endedCount, setEndedCount] = useState<number>(0);

  // Prevents duplicate didJustFinish triggers for the same track
  const finishHandledRef = useRef<boolean>(false);

  // Configure native audio session once on mount
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: !IS_EXPO_GO,
      interruptionMode: "doNotMix",
    }).catch((err) => console.warn("Failed to configure audio mode:", err));
  }, []);

  // Watch for natural track completion
  useEffect(() => {
    if (status.didJustFinish && !finishHandledRef.current) {
      finishHandledRef.current = true;
      setEndedCount((count) => count + 1);
    } else if (!status.didJustFinish) {
      finishHandledRef.current = false;
    }
  }, [status.didJustFinish]);

  const playSong = useCallback(
    (url: string, metadata?: AudioMetadata) => {
      if (!url) return;
      finishHandledRef.current = false;

      try {
        player.replace({ uri: url });
        player.volume = volume;
        player.play();

        // Activates lock screen notification metadata (full effect in Dev Build)
        if (!IS_EXPO_GO && metadata && typeof player.setActiveForLockScreen === "function") {
          try {
            player.setActiveForLockScreen(true, metadata, {
              showSeekForward: true,
              showSeekBackward: true,
            });
          } catch {
            // Safe to ignore in Expo Go without background playback plugin
          }
        }
      } catch (err) {
        console.error("Failed to start playback:", err);
      }
    },
    [player, volume]
  );

  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const pause = useCallback(() => {
    player.pause();
  }, [player]);

  const seekTo = useCallback(
    async (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, player.duration || seconds));
      await player.seekTo(clamped);
    },
    [player]
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(1, value));
      setVolume(clamped);
      player.volume = clamped;
    },
    [player]
  );

  const getPositionSnapshot = useCallback(
    (): PositionSnapshot => ({
      currentTime: player.currentTime || 0,
      duration: player.duration || 0,
    }),
    [player]
  );

  const values = useMemo<PlaybackContextValue>(
    () => ({
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      isLoaded: status.isLoaded,
      currentTime: status.currentTime,
      duration: status.duration,
      volume,
      endedCount,
      playSong,
      togglePlay,
      pause,
      seekTo,
      handleVolumeChange,
      getPositionSnapshot,
    }),
    [
      status.playing,
      status.isBuffering,
      status.isLoaded,
      status.currentTime,
      status.duration,
      volume,
      endedCount,
      playSong,
      togglePlay,
      pause,
      seekTo,
      handleVolumeChange,
      getPositionSnapshot,
    ]
  );

  return (
    <PlaybackContext.Provider value={values}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("usePlayback must be inside PlaybackProvider");
  }
  return context;
};