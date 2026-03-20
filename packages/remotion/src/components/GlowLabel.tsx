import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { colors } from "../theme";

type GlowLabelProps = {
  text: string;
  color?: string;
  delay?: number;
};

export const GlowLabel: React.FC<GlowLabelProps> = ({
  text,
  color = colors.accent,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  const y = interpolate(entrance, [0, 1], [30, 0]);
  const opacity = entrance;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: `translateX(-50%) translateY(${y}px)`,
        opacity,
        background: `linear-gradient(135deg, ${color}22, ${color}44)`,
        backdropFilter: "blur(10px)",
        border: `2px solid ${color}66`,
        borderRadius: 20,
        padding: "24px 64px",
        boxShadow: `0 0 40px ${color}44, 0 0 80px ${color}22`,
      }}
    >
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 56,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}
      >
        {text}
      </span>
    </div>
  );
};
