import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { Song } from "@/types";
import SkeletonCard, { CardShape } from "./loading/SkeletonCard";
import SongCard from "./SongCard";

interface SectionRowProps {
  title: string;
  type?: CardShape;
  items?: Song[];
  isLoading?: boolean;
}

export default function SectionRow({
  title,
  type = "square",
  items = [],
  isLoading = false,
}: SectionRowProps) {
  const isStackedLayout = type === "wide" || type === "list";

  // Group into 3-row columns for horizontal "wide" / "list" grids
  const stackedColumns = useMemo(() => {
    if (!isStackedLayout) return [];
    const cols: { song: Song; index: number }[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      cols.push(
        items.slice(i, i + 3).map((song, offset) => ({
          song,
          index: i + offset,
        }))
      );
    }
    return cols;
  }, [isStackedLayout, items]);

  if (!isLoading && items.length === 0) return null;

  return (
    <View className="mb-2">
      {/* Header */}
      <View className="mb-3 flex-row items-end justify-between px-4">
        <Text className="text-xl font-black tracking-tight text-text-primary">
          {title}
        </Text>
      </View>

      {/* Scrollable Container */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          gap: 14,
        }}
      >
        {isLoading ? (
          isStackedLayout ? (
            [0, 1, 2].map((colIdx) => (
              <View key={`skel-col-${colIdx}`} className="gap-2">
                {[0, 1, 2].map((rowIdx) => (
                  <SkeletonCard
                    key={`skel-${colIdx}-${rowIdx}`}
                    shape={type}
                  />
                ))}
              </View>
            ))
          ) : (
            [0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={`skeleton-${i}`} shape={type} />
            ))
          )
        ) : isStackedLayout ? (
          stackedColumns.map((col, colIdx) => (
            <View key={`col-${colIdx}`} className="gap-2">
              {col.map(({ song, index }) => (
                <SongCard
                  key={`${song.id}-${index}`}
                  song={song}
                  queue={items}
                  index={index}
                  shape={type}
                />
              ))}
            </View>
          ))
        ) : (
          items.map((song, index) => (
            <SongCard
              key={`${song.id}-${index}`}
              song={song}
              queue={items}
              index={index}
              shape={type}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}