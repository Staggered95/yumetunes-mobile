import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "@/api/axios";
import { ListenEventPayload, Song } from "@/types";
import { getMediaUrl } from "@/utils/media";
import { useAuth } from "./AuthContext";
import { usePlayback } from "./PlaybackContext";

interface SongContextValue {
  queue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isShuffle: boolean;
  playQueue: (newQueue: Song[], startingIndex?: number) => void;
  playShuffledQueue: (newSongs: Song[]) => void;
  nextSong: (isManualSkip?: boolean) => void;
  prevSong: (isManualSkip?: boolean) => void;
  toggleShuffle: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
}

const SongContext = createContext<SongContextValue | undefined>(undefined);

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const SongProvider = ({ children }: { children: React.ReactNode }) => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Refs keep callbacks pure and free of nested setState calls (React Compiler safe)
  const queueRef = useRef<Song[]>([]);
  const originalQueueRef = useRef<Song[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const isShuffleRef = useRef<boolean>(false);
  const lastHandledEndedRef = useRef<number>(0);

  const { isLoggedIn } = useAuth();
  const { endedCount, playSong, getPositionSnapshot } = usePlayback();

  const currentSong = queue[currentIndex] ?? null;

  const updateQueueState = useCallback(
    (nextQueue: Song[], nextIndex: number) => {
      queueRef.current = nextQueue;
      currentIndexRef.current = nextIndex;
      setQueue(nextQueue);
      setCurrentIndex(nextIndex);
    },
    []
  );

  const startTrack = useCallback(
    (song: Song | undefined) => {
      if (!song) return;
      const audioUrl = getMediaUrl(song.file_path, "audio");
      if (!audioUrl) return;

      const coverUrl = getMediaUrl(song.cover_path, "image") ?? undefined;
      playSong(audioUrl, {
        title: song.title,
        artist: song.artist ?? "Unknown Artist",
        albumTitle: song.anime ?? "YumeTunes",
        artworkUrl: coverUrl,
      });
    },
    [playSong]
  );

  const logTelemetry = useCallback(
    async (
      song: Song | null,
      listenedSecs: number,
      totalSecs: number,
      skipped: boolean
    ) => {
      if (!isLoggedIn || !song || listenedSecs < 5) return;

      const payload: ListenEventPayload = {
        songID: song.id,
        listenedSeconds: Math.floor(listenedSecs),
        durationSeconds: Math.floor(totalSecs || song.duration_seconds || 0),
        wasSkipped: skipped,
      };

      try {
        await api.post("/user/telemetry", payload);
      } catch (err) {
        console.warn("Telemetry failed:", err);
      }
    },
    [isLoggedIn]
  );

  const playQueue = useCallback(
    (newQueue: Song[], startingIndex = 0) => {
      if (!newQueue.length) return;
      const safeIndex = Math.max(0, Math.min(startingIndex, newQueue.length - 1));

      originalQueueRef.current = newQueue;
      isShuffleRef.current = false;
      setOriginalQueue(newQueue);
      setIsShuffle(false);
      updateQueueState(newQueue, safeIndex);

      startTrack(newQueue[safeIndex]);
    },
    [startTrack, updateQueueState]
  );

  const playShuffledQueue = useCallback(
    (newSongs: Song[]) => {
      if (!newSongs.length) return;

      const shuffled = shuffleArray(newSongs);
      originalQueueRef.current = newSongs;
      isShuffleRef.current = true;

      setOriginalQueue(newSongs);
      setIsShuffle(true);
      updateQueueState(shuffled, 0);

      startTrack(shuffled[0]);
    },
    [startTrack, updateQueueState]
  );

  const addToQueue = useCallback(
    (song: Song) => {
      if (queueRef.current.length === 0) {
        playQueue([song], 0);
        return;
      }

      if (!queueRef.current.some((s) => s.id === song.id)) {
        const nextQueue = [...queueRef.current, song];
        queueRef.current = nextQueue;
        setQueue(nextQueue);
      }

      if (!originalQueueRef.current.some((s) => s.id === song.id)) {
        const nextOriginal = [...originalQueueRef.current, song];
        originalQueueRef.current = nextOriginal;
        setOriginalQueue(nextOriginal);
      }
    },
    [playQueue]
  );

  const toggleShuffle = useCallback(() => {
    const activeQueue = queueRef.current;
    const activeIdx = currentIndexRef.current;
    const nextShuffle = !isShuffleRef.current;

    isShuffleRef.current = nextShuffle;
    setIsShuffle(nextShuffle);

    if (activeQueue.length === 0 || activeIdx < 0) return;

    const activeSong = activeQueue[activeIdx];

    if (nextShuffle) {
      const remaining = activeQueue.filter((_, idx) => idx !== activeIdx);
      const shuffled = [activeSong, ...shuffleArray(remaining)];
      updateQueueState(shuffled, 0);
    } else if (originalQueueRef.current.length > 0) {
      const restored = originalQueueRef.current;
      const restoredIdx = restored.findIndex((s) => s.id === activeSong?.id);
      updateQueueState(restored, restoredIdx !== -1 ? restoredIdx : 0);
    }
  }, [updateQueueState]);

  const playNextInQueue = useCallback(
    (song: Song) => {
      const activeQueue = queueRef.current;
      const activeIdx = currentIndexRef.current;

      if (activeQueue.length === 0) {
        playQueue([song], 0);
        return;
      }

      const nextQueue = [...activeQueue];
      let nextIdx = activeIdx;
      const existingIndex = nextQueue.findIndex((s) => s.id === song.id);

      if (existingIndex !== -1) {
        if (existingIndex === activeIdx) return;
        nextQueue.splice(existingIndex, 1);
        if (existingIndex < activeIdx) {
          nextIdx--;
        }
      }

      nextQueue.splice(nextIdx + 1, 0, song);
      updateQueueState(nextQueue, nextIdx);
    },
    [playQueue, updateQueueState]
  );

  const reorderQueue = useCallback(
    (startIndex: number, endIndex: number) => {
      if (startIndex === endIndex) return;

      const nextQueue = [...queueRef.current];
      const [draggedItem] = nextQueue.splice(startIndex, 1);
      if (!draggedItem) return;
      nextQueue.splice(endIndex, 0, draggedItem);

      let nextIdx = currentIndexRef.current;
      if (startIndex === nextIdx) {
        nextIdx = endIndex;
      } else if (startIndex < nextIdx && endIndex >= nextIdx) {
        nextIdx--;
      } else if (startIndex > nextIdx && endIndex <= nextIdx) {
        nextIdx++;
      }

      updateQueueState(nextQueue, nextIdx);
    },
    [updateQueueState]
  );

  const nextSong = useCallback(
    (isManualSkip = true) => {
      const activeQueue = queueRef.current;
      const activeIdx = currentIndexRef.current;
      if (activeQueue.length === 0) return;

      const activeSong = activeQueue[activeIdx] ?? null;
      if (isManualSkip && activeSong) {
        const { currentTime, duration } = getPositionSnapshot();
        logTelemetry(activeSong, currentTime, duration, true);
      }

      const nextIdx = (activeIdx + 1) % activeQueue.length;
      currentIndexRef.current = nextIdx;
      setCurrentIndex(nextIdx);
      startTrack(activeQueue[nextIdx]);
    },
    [getPositionSnapshot, logTelemetry, startTrack]
  );

  const prevSong = useCallback(
    (isManualSkip = true) => {
      const activeQueue = queueRef.current;
      const activeIdx = currentIndexRef.current;
      if (activeQueue.length === 0) return;

      const activeSong = activeQueue[activeIdx] ?? null;
      if (isManualSkip && activeSong) {
        const { currentTime, duration } = getPositionSnapshot();
        logTelemetry(activeSong, currentTime, duration, true);
      }

      const prevIdx = (activeIdx - 1 + activeQueue.length) % activeQueue.length;
      currentIndexRef.current = prevIdx;
      setCurrentIndex(prevIdx);
      startTrack(activeQueue[prevIdx]);
    },
    [getPositionSnapshot, logTelemetry, startTrack]
  );

  // Auto-advance & log completed listen when a track finishes naturally
  useEffect(() => {
    if (endedCount === 0 || endedCount === lastHandledEndedRef.current) return;
    lastHandledEndedRef.current = endedCount;

    const activeSong = queueRef.current[currentIndexRef.current] ?? null;
    if (activeSong) {
      const { duration } = getPositionSnapshot();
      logTelemetry(activeSong, duration, duration, false);
    }
    nextSong(false);
  }, [endedCount, getPositionSnapshot, logTelemetry, nextSong]);

  const values = useMemo<SongContextValue>(
    () => ({
      queue,
      currentIndex,
      currentSong,
      isShuffle,
      playQueue,
      playShuffledQueue,
      nextSong,
      prevSong,
      toggleShuffle,
      addToQueue,
      playNextInQueue,
      reorderQueue,
    }),
    [
      queue,
      currentIndex,
      currentSong,
      isShuffle,
      playQueue,
      playShuffledQueue,
      nextSong,
      prevSong,
      toggleShuffle,
      addToQueue,
      playNextInQueue,
      reorderQueue,
    ]
  );

  return (
    <SongContext.Provider value={values}>{children}</SongContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error("useSongs must be within a SongProvider");
  }
  return context;
};