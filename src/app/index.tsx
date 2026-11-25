import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VariableContextProvider } from "nativewind";
import { THEMES, ThemeName } from "@/theme/themes";

const THEME_KEYS = Object.keys(THEMES) as ThemeName[];

export default function HomeScreen() {
  const [theme, setTheme] = useState<ThemeName>("default-dark");

  return (
    <VariableContextProvider value={THEMES[theme]}>
      <SafeAreaView className="flex-1 bg-background-primary px-5 pt-6">
        <Text className="text-3xl font-bold text-accent-primary">YumeTunes</Text>
        <Text className="mt-1 text-text-secondary">
          Active theme: {theme}
        </Text>

        <View className="mt-6 gap-3 rounded-xl border border-border bg-background-secondary p-4">
          <Text className="text-base font-semibold text-text-primary">
            Switch Theme
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {THEME_KEYS.map((key) => (
              <Pressable
                key={key}
                onPress={() => setTheme(key)}
                className="rounded-lg bg-accent-primary px-3 py-2 active:bg-accent-active"
              >
                <Text className="font-medium text-text-primary">{key}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </VariableContextProvider>
  );
}