import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const UserSettings: React.FC = () => {
  const {
    themeFamily,
    setThemeFamily,
    themeMode,
    toggleThemeMode,
    themeFamilies,
  } = useTheme();

  const isDark = themeMode === 'dark';

  return (
    <View className="gap-10">
      {/* Appearance Block */}
      <View className="gap-6">
        <View className="border-b border-border/50 pb-4">
          <Text className="text-xs font-black uppercase tracking-[0.4em] text-text-muted italic">
            Appearance
          </Text>
        </View>

        <View className="gap-6">
          {/* Setting Item 1: Theme Palette */}
          <View className="gap-5 border border-border p-5 rounded-3xl bg-background-secondary/20">
            <View>
              <Text className="text-sm font-black tracking-tight text-text-primary mb-1">
                Theme Palette
              </Text>
              <Text className="text-xs font-medium text-text-secondary">
                Select your core brand aesthetic.
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-3">
              {themeFamilies.map((family) => {
                const isActive = themeFamily === family.id;

                return (
                  <Pressable
                    key={family.id}
                    onPress={() => setThemeFamily(family.id)}
                    className={`w-[48%] flex-row items-center gap-3 p-3 rounded-2xl border active:scale-95 ${
                      isActive
                        ? 'border-border bg-background-active'
                        : 'border-transparent bg-background-secondary active:bg-background-hover'
                    }`}
                  >
                    {/* Color Orb */}
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: family.color }}
                    />

                    {/* Label */}
                    <Text
                      numberOfLines={1}
                      className={`flex-1 text-sm font-bold tracking-tight ${
                        isActive ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {family.label}
                    </Text>

                    {/* Active Checkmark */}
                    {isActive && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#9ca3af"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Setting Item 2: Display Mode */}
          <View className="gap-4 border border-border p-5 rounded-3xl bg-background-secondary/20">
            <View>
              <Text className="text-sm font-black tracking-tight text-text-primary mb-1">
                Display Mode
              </Text>
              <Text className="text-xs font-medium text-text-secondary">
                Toggle between Light and Dark interface.
              </Text>
            </View>

            <Pressable
              onPress={toggleThemeMode}
              className="flex-row items-center justify-between w-full p-2 pl-4 rounded-2xl bg-background-secondary border border-border active:border-accent-primary/50"
            >
              <Text className="text-sm font-bold text-text-primary">
                {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
              </Text>

              <View className="relative h-10 w-16 items-center justify-center rounded-xl bg-background-active border border-border">
                <View
                  className={`absolute inset-1 rounded-lg ${
                    isDark ? 'bg-background-primary' : 'bg-accent-primary/20'
                  }`}
                />
                <View
                  className={`absolute h-7 w-7 items-center justify-center rounded-lg ${
                    isDark
                      ? 'left-1.5 bg-text-primary'
                      : 'right-1.5 bg-warning'
                  }`}
                >
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={15}
                    color="#000"
                  />
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Placeholder for future settings blocks */}
      <View className="opacity-30" pointerEvents="none">
        <View className="border-b border-border/50 pb-4 mb-5">
          <Text className="text-xs font-black uppercase tracking-[0.4em] text-text-muted italic">
            Playback & Audio
          </Text>
        </View>
        <View className="h-24 border-2 border-dashed border-border rounded-3xl items-center justify-center">
          <Text className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Coming Soon
          </Text>
        </View>
      </View>
    </View>
  );
};

export default UserSettings;