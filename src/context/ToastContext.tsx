import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./ThemeContext";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItemData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 3000;

const getContainerClasses = (type: ToastType): string => {
  switch (type) {
    case "error":
      return "bg-error border-error/30";
    case "warning":
      return "bg-warning border-warning/30";
    case "info":
      return "bg-accent-tertiary border-accent-tertiary/30";
    default:
      return "bg-background-secondary border-border";
  }
};

const getTextClasses = (type: ToastType): string => {
  switch (type) {
    case "error":
    case "warning":
    case "info":
      return "text-background-primary";
    default:
      return "text-text-primary";
  }
};

const getIconName = (type: ToastType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "error":
      return "close";
    case "warning":
      return "warning-outline";
    case "info":
      return "information-circle-outline";
    default:
      return "checkmark";
  }
};

function ToastBanner({ toast }: { toast: ToastItemData }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -12,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, TOAST_DURATION_MS - 250);

    return () => clearTimeout(exitTimer);
  }, [opacity, translateY]);

  const iconColor =
    toast.type === "success"
      ? colors["--stat-success"]
      : colors["--bg-primary"];

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        elevation: 8,
      }}
      className={`w-full max-w-md flex-row items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-lg ${getContainerClasses(
        toast.type
      )}`}
    >
      <Ionicons name={getIconName(toast.type)} size={20} color={iconColor} />
      <Text
        className={`flex-1 text-sm font-bold leading-tight ${getTextClasses(
          toast.type
        )}`}
      >
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);
  const insets = useSafeAreaInsets();
  const nextIdRef = useRef(0);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const addToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++nextIdRef.current;

      setToasts((prev) => [...prev, { id, message, type }]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        timersRef.current.delete(timer);
      }, TOAST_DURATION_MS);

      timersRef.current.add(timer);
    },
    []
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* GLOBAL TOAST CONTAINER */}
      {toasts.length > 0 && (
        <View
          pointerEvents="none"
          style={{ top: insets.top + 12 }}
          className="absolute left-0 right-0 z-50 items-center gap-2.5 px-4"
        >
          {toasts.map((toast) => (
            <ToastBanner key={toast.id} toast={toast} />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};