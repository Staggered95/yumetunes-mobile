import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "@/api/axios";
import { ApiResponse, ToggleLikeResponse, UserDetails } from "@/types";
import { useAuth } from "./AuthContext";

interface UserContextValue {
  userProfile: UserDetails | null;
  likedSongIds: Set<number>;
  isLoading: boolean;
  isSongLiked: (songId: number) => boolean;
  toggleLike: (songId: number) => Promise<boolean>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserDetails | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pendingLikesRef = useRef<Set<number>>(new Set());
  const { isLoggedIn } = useAuth();

  const refreshUserData = useCallback(async () => {
    if (!isLoggedIn) {
      setLikedSongIds(new Set());
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [userRes, likedRes] = await Promise.all([
        api
          .get<ApiResponse<UserDetails[] | UserDetails>>("/user")
          .catch((err) => {
            console.error("Error fetching user details:", err);
            return null;
          }),
        api
          .get<ApiResponse<number[]>>("/user/likedsongs/minimal")
          .catch((err) => {
            console.error("Error fetching liked song IDs:", err);
            return null;
          }),
      ]);

      if (userRes?.data?.success) {
        const payload = userRes.data.data;
        const normalizedProfile = Array.isArray(payload)
          ? (payload[0] ?? null)
          : (payload ?? null);
        setUserProfile(normalizedProfile);
      }

      if (likedRes?.data?.success && Array.isArray(likedRes.data.data)) {
        setLikedSongIds(new Set(likedRes.data.data));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const isSongLiked = useCallback(
    (songId: number) => likedSongIds.has(songId),
    [likedSongIds]
  );

  const toggleLike = useCallback(
    async (songId: number): Promise<boolean> => {
      if (!isLoggedIn) return false;
      if (pendingLikesRef.current.has(songId)) return false;

      pendingLikesRef.current.add(songId);

      // Capture previous state so rollback is exact even under concurrent updates
      let wasLiked = false;
      setLikedSongIds((prev) => {
        wasLiked = prev.has(songId);
        const next = new Set(prev);
        if (wasLiked) {
          next.delete(songId);
        } else {
          next.add(songId);
        }
        return next;
      });

      try {
        const { data } = await api.post<ToggleLikeResponse>(
          `/user/likedsongs/${songId}`
        );
        if (!data.success) {
          throw new Error("Server failed to update like status");
        }
        return true;
      } catch (err) {
        console.error("Error changing like status:", err);

        // Rollback to exact prior state
        setLikedSongIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) {
            next.add(songId);
          } else {
            next.delete(songId);
          }
          return next;
        });
        return false;
      } finally {
        pendingLikesRef.current.delete(songId);
      }
    },
    [isLoggedIn]
  );

  return (
    <UserContext.Provider
      value={{
        userProfile,
        likedSongIds,
        isLoading,
        isSongLiked,
        toggleLike,
        setUserProfile,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};