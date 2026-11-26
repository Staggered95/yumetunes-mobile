import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import BaseModal from "./BaseModal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <View className="gap-6">
        <View className="flex-row items-start gap-4">
          {isDestructive && (
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-error/20 bg-error/10">
              <Feather
                name="alert-triangle"
                size={22}
                color={colors["--stat-error"]}
              />
            </View>
          )}

          <Text className="flex-1 text-sm font-medium leading-relaxed text-text-secondary">
            {message}
          </Text>
        </View>

        <View className="flex-row justify-end gap-3 pt-1">
          <Pressable
            onPress={onClose}
            className="rounded-xl border border-border px-5 py-2.5 active:bg-background-hover"
          >
            <Text className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              {cancelText}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-xl px-5 py-2.5 active:opacity-85 ${
              isDestructive ? "bg-error" : "bg-accent-primary"
            }`}
          >
            <Text className="text-xs font-black uppercase tracking-widest text-background-primary">
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </BaseModal>
  );
}