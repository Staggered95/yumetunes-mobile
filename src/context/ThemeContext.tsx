import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { VariableContextProvider } from "nativewind";
import { THEMES, ThemeName } from "@/theme/themes";

export type ThemeMode = "dark" | "light";

export interface ThemeFamily {
  id: string;
  label: string;
  color: string;
  isFree: boolean;
}

export const THEME_FAMILIES: ThemeFamily[] = [
  { id: "default", label: "Default (Purple)", color: "#9D5CFA", isFree: true },
  { id: "gruvbox", label: "Gruvbox", color: "#d3869b", isFree: true },
  { id: "nord", label: "Nord (Icy)", color: "#88C0D0", isFree: true },
  { id: "dracula", label: "Dracula", color: "#bd93f9", isFree: false },
  { id: "everforest", label: "Everforest", color: "#a7c080", isFree: false },
  { id: "crimson", label: "Crimson", color: "#e63946", isFree: false },
  { id: "solar", label: "Solar", color: "#e9c46a", isFree: false },
  { id: "ocean", label: "Ocean", color: "#0ea5e9", isFree: false },
];

const STORAGE_KEYS = {
  FAMILY: "yumetunes-theme-family",
  MODE: "yumetunes-theme-mode",
};

interface ThemeContextValue {
  themeFamily: string;
  setThemeFamily: (family: string) => void;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  themeFamilies: ThemeFamily[];
  colors: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeFamily, setThemeFamilyState] = useState<string>("default");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");

  // Hydrate saved theme from device storage on startup
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const [savedFamily, savedMode] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAMILY),
          AsyncStorage.getItem(STORAGE_KEYS.MODE),
        ]);
        if (savedFamily) setThemeFamilyState(savedFamily);
        if (savedMode === "dark" || savedMode === "light") {
          setThemeModeState(savedMode);
        }
      } catch (err) {
        console.warn("Failed to load theme preference:", err);
      }
    };
    loadSavedTheme();
  }, []);

  const setThemeFamily = (family: string) => {
    setThemeFamilyState(family);
    AsyncStorage.setItem(STORAGE_KEYS.FAMILY, family).catch(() => {});
  };

  const toggleThemeMode = () => {
    setThemeModeState((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEYS.MODE, next).catch(() => {});
      return next;
    });
  };

  // Safe fallback if a family hasn't been added to THEMES yet
  const activeKey = `${themeFamily}-${themeMode}` as ThemeName;
  const fallbackKey = `default-${themeMode}` as ThemeName;
  const colors = THEMES[activeKey] ?? THEMES[fallbackKey];

  return (
    <ThemeContext.Provider
      value={{
        themeFamily,
        setThemeFamily,
        themeMode,
        toggleThemeMode,
        themeFamilies: THEME_FAMILIES,
        colors,
      }}
    >
      <VariableContextProvider value={colors}>
        <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
        {children}
      </VariableContextProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};