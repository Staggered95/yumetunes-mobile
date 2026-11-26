import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

interface ScrollingTextProps {
  text: string;
  className?: string;
}

const GAP = 48;

export default function ScrollingText({
  text,
  className = "",
}: ScrollingTextProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const isOverflowing =
    containerWidth > 0 && textWidth > containerWidth + 2;

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);

    if (!isOverflowing) return;

    const distance = textWidth + GAP;
    const duration = Math.max(4000, distance * 28);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(translateX, {
          toValue: -distance,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isOverflowing, textWidth, text, translateX]);

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      className="w-full overflow-hidden"
    >
      {/* Hidden measurer to get true single-line width */}
      <Text
        numberOfLines={1}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        className={`absolute opacity-0 ${className}`}
        style={{ width: 9999 }}
      >
        {text}
      </Text>

      {isOverflowing ? (
        <Animated.View
          style={{ transform: [{ translateX }] }}
          className="flex-row"
        >
          <Text numberOfLines={1} className={className}>
            {text}
          </Text>
          <Text
            numberOfLines={1}
            style={{ marginLeft: GAP }}
            className={className}
          >
            {text}
          </Text>
        </Animated.View>
      ) : (
        <Text numberOfLines={1} className={className}>
          {text}
        </Text>
      )}
    </View>
  );
}