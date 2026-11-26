import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import api from "@/api/axios";
import GreetingHeader, { HomeQuote } from "@/components/GreetingHeader";
import HeroCarousel, { HomeBanner } from "@/components/HeroCarousel";
import SectionRow from "@/components/SectionRow";
import TagChips from "@/components/TagChips";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { Song } from "@/types";

export default function HomePage() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [thisSeason, setThisSeason] = useState<Song[]>([]);
  const [latestRelease, setLatestRelease] = useState<Song[]>([]);
  const [continueListening, setContinueListening] = useState<Song[]>([]);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [quotes, setQuotes] = useState<HomeQuote[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>([]);

  const [isPublicLoading, setIsPublicLoading] = useState(true);
  const [isPrivateLoading, setIsPrivateLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isLoggedIn } = useAuth();
  const { userProfile } = useUser();
  const { colors } = useTheme();

  const fetchPublicData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setIsPublicLoading(true);
    try {
      const { data } = await api.get("/home/data");
      if (data.success) {
        setTrending(data.data.trending || []);
        setThisSeason(data.data.thisSeason || []);
        setLatestRelease(data.data.latest || []);
        setQuotes(data.data.quotes || []);
        setBanners(data.data.banners || []);
      }
    } catch (err) {
      console.error("Failed to fetch public home data:", err);
    } finally {
      setIsPublicLoading(false);
    }
  }, []);

  const fetchPrivateData = useCallback(
    async (showSkeleton = true) => {
      if (!isLoggedIn) {
        setContinueListening([]);
        setRecommendedSongs([]);
        setIsPrivateLoading(false);
        return;
      }

      if (showSkeleton) setIsPrivateLoading(true);
      try {
        const { data } = await api.get("/user/home-data");
        if (data.success) {
          setContinueListening(data.data.continueListening || []);
          setRecommendedSongs(data.data.recommended || []);
        }
      } catch (err) {
        console.error("Failed to fetch private home data:", err);
      } finally {
        setIsPrivateLoading(false);
      }
    },
    [isLoggedIn]
  );

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  useEffect(() => {
    fetchPrivateData();
  }, [fetchPrivateData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPublicData(false), fetchPrivateData(false)]);
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors["--acc-primary"]}
          colors={[colors["--acc-primary"]]}
          progressBackgroundColor={colors["--bg-secondary"]}
        />
      }
    >
      <View className="gap-6 pt-3">
        <View className="px-4">
          <HeroCarousel dbBanners={banners} />
        </View>

        <TagChips />

        <GreetingHeader isLoggedIn={isLoggedIn} dbQuotes={quotes} />

        <View className="gap-8">
          {isLoggedIn ? (
            <>
              <SectionRow
                title="Continue Listening"
                type="square"
                items={continueListening}
                isLoading={isPrivateLoading}
              />

              <SectionRow
                title={`Made for ${userProfile?.first_name || "You"}`}
                type="small_square"
                items={recommendedSongs}
                isLoading={isPrivateLoading}
              />
            </>
          ) : (
            <SectionRow
              title="Recently Added"
              type="small_square"
              items={latestRelease}
              isLoading={isPublicLoading}
            />
          )}

          <SectionRow
            title="Trending Now"
            type="wide"
            items={trending}
            isLoading={isPublicLoading}
          />

          <SectionRow
            title="Discover Random"
            type="small_square"
            items={thisSeason}
            isLoading={isPublicLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
}