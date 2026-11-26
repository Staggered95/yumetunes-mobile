import React, { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { vars } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/minicomps/ThemeToggle";
import { UserDetails } from "@/types";
import { getMediaUrl } from "@/utils";

interface UserMenuProps {
  user: UserDetails | null;
  onLogoutClick: () => void;
}

export default function UserMenu({ user, onLogoutClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const imageSrc = user?.user_image
    ? getMediaUrl(user.user_image, "image", 160)
    : null;

  const navigateAndClose = (path: string) => {
    setIsOpen(false);
    router.push(path as Href);
  };

  return (
    <>
      {/* Avatar Trigger */}
      <Pressable
        onPress={() => setIsOpen(true)}
        className={`rounded-full border-2 p-0.5 ${
          isOpen ? "border-accent-primary" : "border-transparent"
        }`}
      >
        {imageSrc ? (
          <Image
            source={{ uri: imageSrc }}
            className="h-10 w-10 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-background-active">
            <Feather name="user" size={20} color={colors["--acc-primary"]} />
          </View>
        )}
      </Pressable>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={vars(colors)} className="flex-1">
          <Pressable
            onPress={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <View
            style={{ top: insets.top + 64, right: 16, elevation: 16 }}
            className="absolute w-64 overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-2xl"
          >
            {/* User Info Header */}
            <View className="flex-row items-center gap-3.5 border-b border-border bg-background-active/30 px-4 py-4">
              {imageSrc ? (
                <Image
                  source={{ uri: imageSrc }}
                  className="h-11 w-11 rounded-full border-2 border-accent-primary/20"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-primary">
                  <Text className="text-lg font-black text-background-primary">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View className="flex-1">
                <Text
                  className="text-sm font-bold text-text-primary"
                  numberOfLines={1}
                >
                  {user?.username || "Guest"}
                </Text>
                <View className="mt-1 self-start rounded-md border border-accent-primary/20 bg-accent-primary/10 px-2 py-0.5">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-accent-primary">
                    {user?.role || "User"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View className="gap-1 p-2">
              {/* Appearance Row */}
              <View className="mb-1 flex-row items-center justify-between rounded-xl border border-border/60 bg-background-primary/50 px-3 py-2">
                <View className="flex-row items-center gap-2">
                  <Feather
                    name="moon"
                    size={15}
                    color={colors["--txt-secondary"]}
                  />
                  <Text className="text-sm font-medium text-text-primary">
                    Appearance
                  </Text>
                </View>
                <ThemeToggle />
              </View>

              <Pressable
                onPress={() => navigateAndClose("/user")}
                className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-background-hover"
              >
                <Feather
                  name="user"
                  size={16}
                  color={colors["--txt-secondary"]}
                />
                <Text className="text-sm font-medium text-text-primary">
                  View Profile
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigateAndClose("/user?tab=settings")}
                className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-background-hover"
              >
                <Feather
                  name="settings"
                  size={16}
                  color={colors["--txt-secondary"]}
                />
                <Text className="text-sm font-medium text-text-primary">
                  Account Settings
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigateAndClose("/contact")}
                className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-background-hover"
              >
                <Feather
                  name="mail"
                  size={16}
                  color={colors["--txt-secondary"]}
                />
                <Text className="text-sm font-medium text-text-primary">
                  Contact Us
                </Text>
              </Pressable>

              <View className="mx-2 my-1 h-px bg-border" />

              <Pressable
                onPress={() => {
                  setIsOpen(false);
                  onLogoutClick();
                }}
                className="flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-error/10"
              >
                <Feather
                  name="log-out"
                  size={16}
                  color={colors["--stat-error"]}
                />
                <Text className="text-sm font-bold text-error">Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}