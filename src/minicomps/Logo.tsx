import React from "react";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import { useTheme } from "@/context/ThemeContext";

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 44 }: LogoProps) {
  const { colors } = useTheme();

  const accSecondary = colors["--acc-secondary"] ?? "#E056FD";
  const accPrimary = colors["--acc-primary"] ?? "#8258FA";
  const txtPrimary = colors["--txt-primary"] ?? "#F2F2F5";

  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <Defs>
        <LinearGradient id="yt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={accSecondary} />
          <Stop offset="100%" stopColor={accPrimary} />
        </LinearGradient>

        <Mask id="yt-cut">
          <Rect width="128" height="128" fill="#fff" />
          <Circle cx="86" cy="58" r="40" fill="#000" />
        </Mask>
      </Defs>

      {/* Background Eclipse Shape */}
      <Circle
        cx="64"
        cy="64"
        r="52"
        mask="url(#yt-cut)"
        fill="url(#yt-grad)"
        opacity={0.95}
      />

      {/* Musical Note Path */}
      <Path
        d="M78 36 v29 c-2.4-1.5-5.6-2.4-9.1-2.4 c-7.6 0-13.9 4.1-13.9 9.2 s6.3 9.2 13.9 9.2 s13.9-4.1 13.9-9.2 V51.5 l18 5.8 v11.7 c-2.4-1.5-5.6-2.4-9.1-2.4 c-7.6 0-13.9 4.1-13.9 9.2 s6.3 9.2 13.9 9.2 s13.9-4.1 13.9-9.2 V41 L78 36 z"
        fill={txtPrimary}
        opacity={0.95}
      />
    </Svg>
  );
}