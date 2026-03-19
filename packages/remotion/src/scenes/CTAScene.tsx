import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

const OUTPUT_THUMBNAILS = [
  { name: "Token Launcher", emoji: "📈", color: colors.tradingGreen },
  { name: "Name Registry", emoji: "🏷", color: colors.registrarTeal },
  { name: "Streaming Payments", emoji: "💸", color: colors.streamBlue },
  { name: "Commit-Reveal", emoji: "🎮", color: colors.arcadePurple },
];

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Grid entrance
  const gridEntrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });

  // Tagline entrance
  const taglineEntrance = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const taglineY = interpolate(taglineEntrance, [0, 1], [40, 0]);

  // URL entrance
  const urlEntrance = spring({
    frame,
    fps,
    delay: 35,
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
        gap: 48,
      }}
    >
      {/* Subtle gradient orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
          opacity: 0.3,
        }}
      />

      {/* Mini thumbnail grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          opacity: gridEntrance,
          transform: `scale(${interpolate(gridEntrance, [0, 1], [0.7, 1])})`,
        }}
      >
        {OUTPUT_THUMBNAILS.map((thumb, i) => {
          const cardDelay = 5 + i * 5;
          const cardEntrance = spring({ frame, fps, delay: cardDelay, config: { damping: 200 } });
          return (
            <div
              key={i}
              style={{
                width: 280,
                height: 150,
                borderRadius: 20,
                background: colors.bgCard,
                border: `1px solid ${colors.accent}44`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                opacity: cardEntrance,
                transform: `scale(${interpolate(cardEntrance, [0, 1], [0.5, 1])})`,
              }}
            >
              <span style={{ fontSize: 48 }}>{thumb.emoji}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>{thumb.name}</span>
            </div>
          );
        })}
      </div>

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
            fontSize: 68,
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
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Copy. Paste. Ship.
        </div>
      </div>

      {/* URL — SRE-style pill button */}
      <div
        style={{
          opacity: urlEntrance,
          transform: `scale(${urlEntrance})`,
        }}
      >
        <div
          style={{
            padding: "20px 60px",
            borderRadius: 9999,
            background: colors.primary,
            fontSize: 32,
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

      {/* SRE branding */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          fontSize: 24,
          color: colors.primary,
          fontWeight: 700,
          opacity: urlEntrance,
        }}
      >
        🏗 SpeedRunEthereum
      </div>
    </AbsoluteFill>
  );
};
