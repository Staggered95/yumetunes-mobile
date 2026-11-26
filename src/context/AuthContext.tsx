import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import api, { setAuthCallbacks } from "@/api/axios";
import { tokenStorage } from "@/api/tokenStorage";
import { ApiResponse, User } from "@/types";

export type AuthModalView = "login" | "register" | "forgot";

interface AuthContextValue {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isCheckingAuth: boolean;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>("login");

  const openAuthModal = useCallback((view: AuthModalView = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const clearLocalSession = useCallback(async () => {
    await tokenStorage.clearAccessToken();
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<ApiResponse<User>>("/auth/me");
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        await clearLocalSession();
      }
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      // Only wipe session on actual auth rejection, not temporary offline/network errors
      if (status === 401 || status === 403) {
        await clearLocalSession();
      } else {
        console.warn("Failed to verify session (network/server error):", error);
      }
    }
  }, [clearLocalSession]);

  const login = useCallback(
    async (newToken: string) => {
      if (!newToken) {
        console.error("Failed to log in: No token provided");
        return;
      }
      await tokenStorage.setAccessToken(newToken);
      setToken(newToken);
      await fetchUser();
      setIsAuthModalOpen(false);
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.warn("Server logout failed; clearing local session anyway.");
    }
    await clearLocalSession();
  }, [clearLocalSession]);

  // Register Axios refresh/failure callbacks BEFORE bootstrapping
  useEffect(() => {
    setAuthCallbacks({
      onTokenRefreshed: (newToken) => setToken(newToken),
      onAuthFailure: () => {
        setToken(null);
        setUser(null);
      },
    });
  }, []);

  // Hydrate token from SecureStore once on startup
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const savedToken = await tokenStorage.getAccessToken();
        if (!savedToken) {
          return;
        }
        setToken(savedToken);
        await fetchUser();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    bootstrapAuth();
  }, [fetchUser]);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        token,
        isCheckingAuth,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};