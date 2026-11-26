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

const LOADING_SKIP_URLS = ["/user/telemetry", "/auth/refresh"];

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipLoading?: boolean;
}

interface AuthCallbacks {
  onTokenRefreshed?: (token: string) => void;
  onAuthFailure?: () => void;
}

interface LoadingCallbacks {
  startLoading?: () => void;
  stopLoading?: () => void;
}

let authCallbacks: AuthCallbacks = {};
let loadingCallbacks: LoadingCallbacks = {};
let refreshPromise: Promise<string> | null = null;

/** Called once by AuthContext so Axios can sync React state without circular imports */
export const setAuthCallbacks = (callbacks: AuthCallbacks) => {
  authCallbacks = callbacks;
};

/** Called once by LoadingContext so Axios can drive the global loading bar */
export const setLoadingCallbacks = (callbacks: LoadingCallbacks) => {
  loadingCallbacks = callbacks;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 1. Attach Bearer token + trigger loading state
api.interceptors.request.use(
  async (config: CustomRequestConfig) => {
    const requestUrl = config.url ?? "";
    const shouldSkipLoading =
      config._skipLoading ||
      LOADING_SKIP_URLS.some((url) => requestUrl.includes(url));

    config._skipLoading = shouldSkipLoading;
    if (!shouldSkipLoading) {
      loadingCallbacks.startLoading?.();
    }

    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Stop loading + auto-refresh on 401 (deduplicated across parallel requests)
api.interceptors.response.use(
  (response) => {
    const config = response.config as CustomRequestConfig | undefined;
    if (!config?._skipLoading) {
      loadingCallbacks.stopLoading?.();
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig | undefined;
    if (!originalRequest?._skipLoading) {
      loadingCallbacks.stopLoading?.();
    }

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