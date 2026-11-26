import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthTokenResponse } from "@/types";
import { API_BASE_URL } from "@/utils/constants";
import { tokenStorage } from "./tokenStorage";

const AUTH_SKIP_URLS = [
  "/auth/refresh",
  "/auth/logout",
  "/auth/login",
  "/auth/register",
  "/auth/google",
];

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface AuthCallbacks {
  onTokenRefreshed?: (token: string) => void;
  onAuthFailure?: () => void;
}

let authCallbacks: AuthCallbacks = {};
let refreshPromise: Promise<string> | null = null;

/** Called once by AuthContext so Axios can sync React state without circular imports */
export const setAuthCallbacks = (callbacks: AuthCallbacks) => {
  authCallbacks = callbacks;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 1. Attach Bearer token from SecureStore
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Auto-refresh on 401 (deduplicated across parallel requests)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthEndpoint = AUTH_SKIP_URLS.some((url) =>
      requestUrl.includes(url)
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .get<AuthTokenResponse>("/auth/refresh", { withCredentials: true })
          .then(async ({ data }) => {
            await tokenStorage.setAccessToken(data.token);
            authCallbacks.onTokenRefreshed?.(data.token);
            return data.token;
          })
          .catch(async (refreshError) => {
            await tokenStorage.clearAccessToken();
            authCallbacks.onAuthFailure?.();
            return Promise.reject(refreshError);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;