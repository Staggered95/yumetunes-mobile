import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useUser } from "@/context/UserContext";

export interface HomeQuote {
  id?: number | string;
  quote_text: string;
  author: string;
  anime?: string | null;
  quote_type?: "special" | "normal" | string;
  is_active?: boolean;
}

interface GreetingHeaderProps {
  isLoggedIn: boolean;
  dbQuotes?: HomeQuote[];
}

const FALLBACK_QUOTES: Record<"special" | "normal", HomeQuote[]> = {
  special: [
    {
      quote_text: "Whatever you lose, you'll find it again.",
      author: "Kenshin Himura",
    },
    {
      quote_text: "A person grows up when he's able to overcome hardships.",
      author: "Jiraiya",
    },
  ],
  normal: [
    {
      quote_text: "I'll leave tomorrow's problems to tomorrow's me.",
      author: "Saitama",
    },
    {
      quote_text: "If you don't like your destiny, don't accept it.",
      author: "Naruto Uzumaki",
    },
  ],
};

const getRandomQuote = (arr: HomeQuote[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export default function GreetingHeader({
  isLoggedIn,
  dbQuotes = [],
}: GreetingHeaderProps) {
  const { userProfile } = useUser();
  const [quote, setQuote] = useState<HomeQuote | null>(null);

  useEffect(() => {
    const activeQuotes = dbQuotes.filter((q) => q.is_active !== false);
    const targetType = isLoggedIn ? "special" : "normal";

    let pool = activeQuotes.filter((q) => q.quote_type === targetType);
    if (pool.length === 0) pool = activeQuotes;

    if (pool.length > 0) {
      setQuote(getRandomQuote(pool));
    } else {
      setQuote(getRandomQuote(FALLBACK_QUOTES[targetType]));
    }
  }, [isLoggedIn, dbQuotes]);

  if (!quote) return <View className="min-h-[80px]" />;

  return (
    <View className="w-full gap-3 px-4">
      {/* Greeting */}
      <Text className="text-3xl font-black tracking-tight text-text-primary">
        {isLoggedIn ? (
          <>
            Okaeri,{" "}
            <Text className="text-accent-primary">
              {userProfile?.first_name || "User"}
            </Text>
            -sama
          </>
        ) : (
          "Irasshaimase!"
        )}
      </Text>

      {/* Quote */}
      <View className="flex-row items-start gap-2 opacity-90">
        <Text className="font-serif text-2xl leading-none text-accent-primary">
          &ldquo;
        </Text>
        <View className="flex-1 gap-1.5">
          <Text className="text-sm font-medium italic leading-snug text-text-secondary">
            {quote.quote_text}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-accent-primary">
              — {quote.author}
            </Text>
            {Boolean(quote.anime) && (
              <View className="rounded-md border border-border bg-background-secondary px-1.5 py-0.5">
                <Text className="text-[10px] font-semibold tracking-wide text-text-muted">
                  {quote.anime}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}