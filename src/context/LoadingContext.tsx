import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { setLoadingCallbacks } from "@/api/axios";

interface LoadingContextValue {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined
);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRequests = useRef(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
      resetTimeout.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    activeRequests.current += 1;

    // Let an already-running load bar continue smoothly
    if (activeRequests.current > 1) return;

    clearTimers();
    setIsLoading(true);
    setProgress(15);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const step = (100 - prev) * 0.1;
        return prev + step;
      });
    }, 300);
  }, [clearTimers]);

  const stopLoading = useCallback(() => {
    activeRequests.current = Math.max(0, activeRequests.current - 1);

    // Wait until all in-flight requests finish
    if (activeRequests.current > 0) return;

    clearTimers();
    setProgress(100);

    hideTimeout.current = setTimeout(() => {
      setIsLoading(false);

      resetTimeout.current = setTimeout(() => {
        setProgress(0);
      }, 300);
    }, 400);
  }, [clearTimers]);

  useEffect(() => {
    setLoadingCallbacks({ startLoading, stopLoading });
    return () => {
      setLoadingCallbacks({});
      clearTimers();
    };
  }, [startLoading, stopLoading, clearTimers]);

  return (
    <LoadingContext.Provider
      value={{ isLoading, progress, startLoading, stopLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};