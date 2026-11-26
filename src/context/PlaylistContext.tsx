import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/api/axios";
import { ApiResponse, Playlist } from "@/types";
import { useAuth } from "./AuthContext";

interface PlaylistContextValue {
  playlists: Playlist[];
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  isLoading: boolean;
  refreshPlaylists: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextValue | undefined>(
  undefined
);

export const PlaylistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoggedIn } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshPlaylists = useCallback(async () => {
    if (!isLoggedIn) {
      setPlaylists([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.get<ApiResponse<Playlist[]>>("/playlists");
      if (data.success && Array.isArray(data.data)) {
        setPlaylists(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshPlaylists();
  }, [refreshPlaylists]);

  return (
    <PlaylistContext.Provider
      value={{ playlists, setPlaylists, isLoading, refreshPlaylists }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylists must be used within a PlaylistProvider");
  }
  return context;
};