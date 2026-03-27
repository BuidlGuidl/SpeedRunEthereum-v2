import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tagline entrance
  const taglineEntrance = spring({
    frame,
    fps,
    delay: 5,
    config: { damping: 200 },
  });
  const taglineY = interpolate(taglineEntrance, [0, 1], [50, 0]);

  // URL entrance
  const urlEntrance = spring({
    frame,
    fps,
    delay: 25,
    config: { damping: 15, stiffness: 200 },
  });

  // Subtle pulsing glow on URL
  const urlGlow = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.5, 1, 0.5],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 50%, ${colors.bgTertiary} 100%)`,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
      }}
    >
      {/* Subtle gradient orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
          opacity: 0.3,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          textAlign: "center",
          opacity: taglineEntrance,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: colors.textPrimary,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          AI-ready build prompts.
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Copy. Paste. Adapt. Ship.
        </div>
      </div>

      {/* URL pill button */}
      <div
        style={{
          opacity: urlEntrance,
          transform: `scale(${urlEntrance})`,
        }}
      >
        <div
          style={{
            padding: "28px 80px",
            borderRadius: 9999,
            background: colors.primary,
            fontSize: 52,
            fontWeight: 700,
            color: colors.textWhite,
            letterSpacing: "0.02em",
            boxShadow: `0 0 ${40 * urlGlow}px ${colors.accentGlow}, 0 8px 32px rgba(8, 132, 132, 0.2)`,
          }}
        >
          speedrunethereum.com/build-prompts
        </div>
      </div>

      {/* Bottom teal bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 60,
          background: `linear-gradient(180deg, ${colors.accent}44, ${colors.primary})`,
        }}
      />
    </AbsoluteFill>
  );
};
