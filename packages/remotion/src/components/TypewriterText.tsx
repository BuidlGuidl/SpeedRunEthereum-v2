import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { colors, fonts } from "../theme";

type TypewriterTextProps = {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
};

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 1.5,
  style = {},
  cursorColor = colors.accent,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charCount = Math.min(
    Math.floor(elapsed * charsPerFrame),
    text.length
  );
  const displayText = text.slice(0, charCount);
  const showCursor = charCount < text.length;

  // Blinking cursor
  const cursorOpacity =
    showCursor
      ? interpolate(
          (elapsed % 30) / 30,
          [0, 0.49, 0.51, 1],
          [1, 1, 0, 0],
          { extrapolateRight: "clamp" }
        )
      : 0;

  return (
    <span style={{ fontFamily: fonts.mono, ...style }}>
      {displayText}
      <span
        style={{
          opacity: cursorOpacity,
          color: cursorColor,
          fontWeight: "bold",
        }}
      >
        |
      </span>
    </span>
  );
};
