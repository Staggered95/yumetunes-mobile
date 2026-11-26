import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface NavTab {
  label: string;
  path: string;
  matchPath: string;
  icon: FeatherIconName;
}

const TABS: NavTab[] = [
  { label: "Home", path: "/", matchPath: "/", icon: "home" },
  { label: "Artists", path: "/artists", matchPath: "/artists", icon: "mic" },
  { label: "Animes", path: "/animes", matchPath: "/animes", icon: "tv" },
  {
    label: "Library",
    path: "/library",
    matchPath: "/library",
    icon: "book-open",
  },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const activeColor = colors["--acc-primary"];
  const inactiveColor = colors["--txt-secondary"];

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 6) }}
      className="border-t border-border bg-background-primary"
    >
      <View className="h-14 flex-row items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive =
            tab.matchPath === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.matchPath);

          return (
            <Pressable
              key={tab.label}
              onPress={() => router.navigate(tab.path as Href)}
              className={`h-12 flex-1 flex-col items-center justify-center gap-1 rounded-full ${
                isActive ? "bg-background-active" : ""
              }`}
            >
              <View style={{ transform: [{ scale: isActive ? 1.1 : 1 }] }}>
                <Feather
                  name={tab.icon}
                  size={20}
                  color={isActive ? activeColor : inactiveColor}
                />
              </View>
              <Text
                className={`text-[9px] font-bold uppercase tracking-wide ${
                  isActive ? "text-accent-primary" : "text-text-secondary"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}