import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["900"],
  subsets: ["latin"],
});

type StepLabelProps = {
  step: string;
  text: string;
  duration?: number; // total frames this label is shown
};

export const StepLabel: React.FC<StepLabelProps> = ({ step, text, duration = 70 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 14, stiffness: 180, mass: 0.8 },
  });

  // Slide up + fade in
  const y = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = entrance;

  // Exit fade — starts 20 frames before end
  const fadeOutStart = duration - 20;
  const fadeOutEnd = duration;
  const exitOpacity = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 100,
        transform: `translateY(${y}px)`,
        opacity: opacity * exitOpacity,
        fontFamily,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          background: `rgba(15, 11, 30, 0.85)`,
          backdropFilter: "blur(12px)",
          border: `2px solid ${colors.accent}66`,
          borderRadius: 20,
          padding: "20px 52px",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${colors.accentGlow}`,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: colors.accent,
            letterSpacing: "0.15em",
          }}
        >
          {step}
        </span>
        <span
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
