import React, { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { themeMode, toggleThemeMode, colors } = useTheme();
  const isDark = themeMode === "dark";

  const translateX = useRef(new Animated.Value(isDark ? 0 : 24)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isDark ? 0 : 24,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isDark, translateX]);

  return (
    <Pressable
      onPress={toggleThemeMode}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel="Toggle Dark Mode"
      className={`relative h-8 w-14 flex-row items-center rounded-full border border-border p-1 ${
        isDark ? "bg-background-active" : "bg-accent-primary/15"
      }`}
    >
      <Animated.View
        style={{ transform: [{ translateX }], elevation: 2 }}
        className="h-6 w-6 items-center justify-center rounded-full bg-background-primary shadow-sm"
      >
        {isDark ? (
          <Ionicons name="moon" size={14} color={colors["--acc-secondary"]} />
        ) : (
          <Ionicons name="sunny" size={15} color={colors["--stat-warning"]} />
        )}
      </Animated.View>
    </Pressable>
  );
}