import { PlaylistSong } from "./song";

export interface Playlist {
  id: number;
  user_id?: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  auto_covers?: string[];
  song_count?: number;
}

export interface PlaylistDetailData {
  playlist: Playlist;
  songs: PlaylistSong[];
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
}

export interface UpdatePlaylistPayload {
  name: string;
  description?: string;
}

export interface AddToPlaylistPayload {
  songID: number;
  positionOrder?: number;
}