import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { vars } from "nativewind";
import { useTheme } from "@/context/ThemeContext";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
}: BaseModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={vars(colors)}
        className="flex-1 items-center justify-center p-5"
      >
        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          className="absolute inset-0 bg-background-primary/80"
        />

        {/* Modal Container */}
        <View
          style={{ elevation: 20 }}
          className="w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-background-secondary shadow-2xl"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border bg-background-active/20 px-6 py-5">
            {title ? (
              <Text className="text-xl font-black uppercase tracking-tighter text-text-primary">
                {title}
              </Text>
            ) : (
              <View />
            )}

            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="rounded-xl bg-background-primary/40 p-2 active:bg-error/20"
            >
              <Feather name="x" size={20} color={colors["--txt-secondary"]} />
            </Pressable>
          </View>

          {/* Content */}
          <View className="p-6">{children}</View>
        </View>
      </View>
    </Modal>
  );
}