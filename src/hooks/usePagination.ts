import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "@/api/axios";
import { PaginatedResponse } from "@/types";

export interface UsePaginationOptions {
  limit?: number;
  enabled?: boolean;
}

export interface UsePaginationResult<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: string | null;
  loadNextPage: () => void;
  refresh: () => void;
}

export const usePagination = <T>(
  endpoint: string | null,
  queryParams?: Record<string, unknown>,
  resetDependency?: unknown,
  options: UsePaginationOptions = {}
): UsePaginationResult<T> => {
  const { limit = 20, enabled = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(endpoint && enabled));
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef<number>(0);
  const loadingRef = useRef<boolean>(false);
  const hasMoreRef = useRef<boolean>(false);
  const requestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stable key so inline queryParams objects (e.g. { genre }) don't loop effects
  const serializedParams = JSON.stringify(queryParams ?? {});

  const fetchPage = useCallback(
    async (targetPage: number, mode: "initial" | "more" | "refresh") => {
      if (!endpoint || !enabled) return;
      if (mode === "more" && (loadingRef.current || !hasMoreRef.current)) return;

      // Cancel any in-flight request when resetting or refreshing
      if (mode !== "more" && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentRequestId = ++requestIdRef.current;

      loadingRef.current = true;
      setError(null);

      if (mode === "refresh") {
        setIsRefreshing(true);
      } else if (mode === "more") {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const parsedParams = JSON.parse(serializedParams) as Record<
          string,
          unknown
        >;

        const response = await api.get<PaginatedResponse<T>>(endpoint, {
          params: { ...parsedParams, page: targetPage, limit },
          signal: controller.signal,
        });

        // Ignore stale responses if a newer request already started
        if (currentRequestId !== requestIdRef.current) return;

        const newItems = response.data?.data ?? [];
        const nextHasMore = Boolean(response.data?.pagination?.hasMore);

        pageRef.current = targetPage;
        hasMoreRef.current = nextHasMore;

        setData((prev) =>
          targetPage === 1 ? newItems : [...prev, ...newItems]
        );
        setHasMore(nextHasMore);
      } catch (err) {
        if (
          axios.isCancel(err) ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }
        console.error("Pagination error:", err);
        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.error ?? err.message)
            : "Failed to load data"
        );
      } finally {
        if (currentRequestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
      }
    },
    [endpoint, enabled, limit, serializedParams]
  );

  // Reset and fetch page 1 when endpoint, params, or resetDependency changes
  useEffect(() => {
    if (!endpoint || !enabled) {
      abortControllerRef.current?.abort();
      requestIdRef.current += 1;
      pageRef.current = 0;
      hasMoreRef.current = false;
      loadingRef.current = false;
      setData([]);
      setHasMore(false);
      setLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
      return;
    }

    pageRef.current = 0;
    hasMoreRef.current = false;
    setData([]);
    setHasMore(false);
    fetchPage(1, "initial");

    return () => {
      requestIdRef.current += 1;
      abortControllerRef.current?.abort();
    };
  }, [endpoint, enabled, resetDependency, fetchPage]);

  const loadNextPage = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current || pageRef.current === 0) {
      return;
    }
    fetchPage(pageRef.current + 1, "more");
  }, [fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(1, "refresh");
  }, [fetchPage]);

  return {
    data,
    setData,
    loading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    error,
    loadNextPage,
    refresh,
  };
};