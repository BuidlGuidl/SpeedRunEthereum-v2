import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";
import { AnimatedCursor } from "../components/AnimatedCursor";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const PortfolioCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance — slides up
  const cardEntrance = spring({
    frame,
    fps,
    delay: 5,
    config: { damping: 200 },
  });
  const cardY = interpolate(cardEntrance, [0, 1], [80, 0]);

  // Context label above
  const labelEntrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });

  // Card hover glow (frame 50-80)
  const hoverGlow = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Zoom into card (frame 90-120)
  const zoomScale = interpolate(frame, [90, 120], [1, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const zoomOpacity = interpolate(frame, [105, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor positions
  const cursorPositions = [
    { x: 1200, y: 600, frame: 0 },
    { x: 980, y: 480, frame: 40 },
    { x: 960, y: 500, frame: 85 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        fontFamily,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          ...styles.centered,
          flexDirection: "column",
          gap: 32,
          transform: `scale(${zoomScale})`,
          opacity: zoomOpacity,
        }}
      >
        {/* Context label */}
        <div
          style={{
            opacity: labelEntrance,
            fontSize: 24,
            color: colors.textSecondary,
            fontWeight: 400,
          }}
        >
          Your builder profile shows build ideas...
        </div>

        {/* Portfolio card replica — SRE light style */}
        <div
          style={{
            transform: `translateY(${cardY}px)`,
            opacity: cardEntrance,
            width: 380,
            borderRadius: 16,
            overflow: "hidden",
            background: colors.bgCard,
            border: `1px solid ${colors.accent}44`,
            boxShadow: hoverGlow > 0
              ? `0 8px 32px rgba(8, 132, 132, 0.15), 0 0 ${20 * hoverGlow}px ${colors.accentGlow}`
              : "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {/* Image area */}
          <div
            style={{
              padding: "20px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: colors.bgSecondary,
            }}
          >
            <Img
              src={staticFile("token-launcher.png")}
              style={{
                width: "75%",
                opacity: interpolate(hoverGlow, [0, 1], [0.7, 1]),
              }}
            />
          </div>

          {/* Card content */}
          <div style={{ padding: "16px 24px 20px" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.textPrimary,
                lineHeight: 1.3,
              }}
            >
              Bonding Curve Token Launch
            </div>
            <div
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              pump.fun-style launchpad where anyone can create a token with an automated bonding curve.
            </div>
          </div>
        </div>
      </div>

      <AnimatedCursor positions={cursorPositions} clickAtEnd color={colors.primary} />
    </AbsoluteFill>
  );
};

const styles = {
  centered: {
    display: "flex" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: "100%",
    height: "100%",
  },
};
