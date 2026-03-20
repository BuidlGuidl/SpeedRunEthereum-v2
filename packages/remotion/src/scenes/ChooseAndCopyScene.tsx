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

const PROMPT_PREVIEW = `# SPEC: Bonding Curve Token Launch

## 1. Objective
A token launchpad where anyone can create a new ERC-20 token
with an automated bonding curve. The price rises mathematically
with each purchase...

## 4. Smart Contract Spec
- Architecture: A TokenFactory contract that deploys new
  BondingCurveToken instances...
- buy() payable: calculate how many tokens the sent ETH buys
- sell(amount): burn tokens, return ETH value...`;

const OTHER_PROMPTS = [
  {
    name: "On-Chain Name Registry",
    desc: "Decentralized mapping system linking human-readable names to Ethereum addresses, similar to ENS.",
  },
  {
    name: "Streaming Payments",
    desc: "Payroll protocol where tokens are continuously streamed to recipients by the second, withdrawable anytime.",
  },
  {
    name: "Commit-Reveal Game",
    desc: "Rock-Paper-Scissors betting game using cryptographic hashing to prevent blockchain front-running.",
  },
];

export const ChooseAndCopyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === LEFT SIDE: Card entrance ===
  const cardEntrance = spring({
    frame,
    fps,
    delay: 5,
    config: { damping: 200 },
  });
  const cardY = interpolate(cardEntrance, [0, 1], [60, 0]);

  // Card click highlight (frame 30)
  const cardClicked = frame >= 30;
  const clickPulse = cardClicked
    ? interpolate(frame, [30, 38], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // === RIGHT SIDE: Prompts panel slides in ===
  const panelEntrance = spring({
    frame,
    fps,
    delay: 35,
    config: { damping: 16, stiffness: 120, mass: 1 },
  });
  const panelX = interpolate(panelEntrance, [0, 1], [1200, 0]);

  // Copy button click (frame 100)
  const copyClick = frame >= 100;

  // Exit zoom
  const exitZoom = interpolate(frame, [130, 170], [1, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(frame, [140, 170], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor positions
  const cursorPositions = [
    { x: 750, y: 550, frame: 0 }, // start from Token Launcher card area
    { x: 400, y: 420, frame: 20 }, // hover card center
    { x: 400, y: 420, frame: 30 }, // click card
    { x: 1350, y: 630, frame: 75 }, // move to copy button on right
    { x: 1350, y: 630, frame: 100 }, // click copy
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        fontFamily,
        overflow: "hidden",
        transform: `scale(${exitZoom})`,
        opacity: exitOpacity,
        transformOrigin: "75% 50%",
      }}
    >
      {/* === LEFT HALF: Portfolio Card === */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "40%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `translateY(${cardY}px)`,
            opacity: cardEntrance,
            width: 520,
            borderRadius: 24,
            overflow: "hidden",
            background: colors.bgCard,
            border: cardClicked
              ? `3px solid ${colors.accent}`
              : `1px solid ${colors.accent}44`,
            boxShadow: cardClicked
              ? `0 0 ${30 + clickPulse * 30}px ${colors.accentGlow}, 0 12px 40px rgba(0,0,0,0.12)`
              : "0 4px 20px rgba(0,0,0,0.08)",
            transition: "border 0.2s ease",
          }}
        >
          {/* Image */}
          <div
            style={{
              padding: "30px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: colors.bgSecondary,
            }}
          >
            <Img
              src={staticFile("token-launcher.png")}
              style={{ width: "75%", opacity: 1 }}
            />
          </div>
          {/* Content */}
          <div style={{ padding: "24px 36px 32px" }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: colors.textPrimary,
                lineHeight: 1.3,
              }}
            >
              Bonding Curve Token Launch
            </div>
            <div
              style={{
                fontSize: 20,
                color: colors.textSecondary,
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              pump.fun-style launchpad where anyone can create a token with an
              automated bonding curve.
            </div>
          </div>
        </div>
      </div>

      {/* === RIGHT HALF: Build Prompts Panel === */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "60%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${panelX}px)`,
        }}
      >
        <div style={{ width: 900, maxWidth: "95%", transform: "scale(1.05)", transformOrigin: "center center" }}>
          {/* Header */}
          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: colors.primary,
              margin: "0 0 8px 0",
            }}
          >
            Build Prompts
          </h1>
          <p
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              marginBottom: 20,
              margin: "0 0 20px 0",
            }}
          >
            AI-ready prompts for Ethereum build ideas. Copy a prompt into your AI
            agent and start building.
          </p>

          {/* Expanded accordion */}
          <div
            style={{
              background: colors.bgCard,
              borderRadius: 12,
              overflow: "hidden",
              border: `2px solid ${colors.accent}`,
              boxShadow: `0 4px 20px ${colors.accentGlow}`,
              marginBottom: 10,
            }}
          >
            <div style={{ padding: "14px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.textPrimary,
                  }}
                >
                  Bonding Curve Token Launch
                </div>
                <div style={{ fontSize: 14, color: colors.primary }}>▲</div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                pump.fun-style launchpad where anyone can create a token with an
                automated bonding curve. Price rises with every buy.
              </div>
            </div>

            {/* Code block */}
            <div style={{ padding: "0 18px 14px" }}>
              <div
                style={{
                  background: colors.bgCode,
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 14,
                  color: colors.textPrimary,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  maxHeight: 280,
                  overflow: "hidden",
                  fontFamily: "'Fira Code', monospace",
                  border: `1px solid ${colors.accent}22`,
                }}
              >
                {PROMPT_PREVIEW}
              </div>

              {/* Copy button */}
              <div
                style={{
                  marginTop: 10,
                  padding: "12px 0",
                  borderRadius: 9999,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  background: copyClick ? colors.success : colors.primary,
                  color: colors.textWhite,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {copyClick ? (
                  <>
                    <span style={{ fontSize: 16 }}>✓</span> Copied!
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 16 }}>📋</span> Copy Prompt
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Collapsed prompts */}
          {OTHER_PROMPTS.map((p, i) => (
            <div
              key={i}
              style={{
                background: colors.bgCard,
                borderRadius: 10,
                padding: "12px 18px",
                marginBottom: 8,
                border: `1px solid ${colors.accent}33`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: colors.textPrimary,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {p.desc}
                </div>
              </div>
              <div style={{ fontSize: 14, color: colors.primary, marginLeft: 12 }}>
                ▼
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cursor */}
      {frame < 160 && (
        <AnimatedCursor
          positions={cursorPositions}
          clickAtEnd
          color={colors.primary}
        />
      )}
    </AbsoluteFill>
  );
};
