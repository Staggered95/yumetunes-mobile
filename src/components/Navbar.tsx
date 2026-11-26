import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import ConfirmDialog from "@/minicomps/ConfirmDialog";
import Logo from "@/minicomps/Logo";
import SearchAutocomplete from "./SearchAutoComplete";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isLoggedIn, isCheckingAuth, logout, openAuthModal } = useAuth();
  const { userProfile } = useUser();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <>
      <View
        style={{ paddingTop: insets.top }}
        className="z-40 border-b border-border bg-background-primary"
      >
        <View className="h-16 flex-row items-center justify-between gap-3 px-4">
          {isMobileSearchOpen ? (
            <View className="flex-1 flex-row items-center gap-2">
              <Pressable
                onPress={() => setIsMobileSearchOpen(false)}
                hitSlop={8}
                className="p-1.5"
              >
                <Feather
                  name="chevron-left"
                  size={24}
                  color={colors["--txt-secondary"]}
                />
              </Pressable>

              <View className="flex-1">
                <SearchAutocomplete
                  autoFocus
                  onSelectComplete={() => setIsMobileSearchOpen(false)}
                />
              </View>
            </View>
          ) : (
            <>
              {/* Brand */}
              <Pressable
                onPress={() => router.navigate("/" as Href)}
                className="flex-row items-center gap-2.5"
              >
                <Logo size={40} />
                <Text className="text-xl font-black tracking-tighter text-text-primary">
                  YumeTunes
                </Text>
              </Pressable>

              {/* Right Controls */}
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setIsMobileSearchOpen(true)}
                  hitSlop={8}
                  className="p-2"
                >
                  <Feather
                    name="search"
                    size={22}
                    color={colors["--txt-secondary"]}
                  />
                </Pressable>

                {isCheckingAuth ? (
                  <View className="h-10 w-10 rounded-full bg-background-active" />
                ) : !isLoggedIn ? (
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => openAuthModal("login")}
                      className="px-2 py-2"
                    >
                      <Text className="text-sm font-bold text-text-secondary">
                        Log In
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => openAuthModal("register")}
                      className="rounded-full bg-accent-primary px-4 py-2 active:opacity-85"
                    >
                      <Text className="text-xs font-bold text-background-primary">
                        Sign Up
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <UserMenu
                    user={userProfile}
                    onLogoutClick={() => setIsLogoutModalOpen(true)}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutModalOpen(false);
          router.navigate("/" as Href);
        }}
        title="Log Out"
        message="Are you sure you want to log out of YumeTunes?"
        confirmText="Log Out"
        cancelText="Cancel"
        isDestructive
      />
    </>
  );
}