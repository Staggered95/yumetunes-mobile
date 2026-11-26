export interface Song {
  id: number;
  title: string;
  file_path: string;
  cover_path: string | null;
  artist: string | null;
  anime: string | null;
  song_type?: string | null;
  lyrics?: string | null;
  duration_seconds?: number;
  season?: number | null;
  genres?: string[];
}

export interface LikedSong extends Song {
  liked_at: string;
}

export interface ContinueListeningSong extends Song {
  last_played: string;
}

export interface TrendingSong extends Song {
  recent_plays: number;
}

export interface PlaylistSong extends Song {
  position_order: number;
  added_at: string;
}

export interface ListeningHistoryItem {
  history_id: number;
  song_id: number;
  title: string;
  cover_path: string | null;
  artist: string | null;
  anime: string | null;
  created_at: string;
}

export interface ListenEventPayload {
  songID: number;
  listenedSeconds: number;
  durationSeconds: number;
  wasSkipped: boolean;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}