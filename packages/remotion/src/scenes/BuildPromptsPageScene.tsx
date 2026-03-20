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
import { AnimatedCursor } from "../components/AnimatedCursor";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const PROMPTS = [
  {
    name: "Bonding Curve Token Launch",
    description:
      "pump.fun-style launchpad where anyone can create a token with an automated bonding curve. Price rises with every buy.",
    isHero: true,
  },
  {
    name: "On-Chain Name Registry",
    description:
      "Decentralized mapping system linking human-readable names to Ethereum addresses, similar to ENS.",
  },
  {
    name: "Streaming Payments",
    description:
      "Payroll protocol where tokens are continuously streamed to recipients by the second, withdrawable anytime.",
  },
  {
    name: "Commit-Reveal Game",
    description:
      "Rock-Paper-Scissors betting game using cryptographic hashing to prevent blockchain front-running.",
  },
];

const PROMPT_PREVIEW = `# SPEC: Bonding Curve Token Launch

## 1. Objective
A token launchpad where anyone can create a new ERC-20 token
with an automated bonding curve. The price rises mathematically
with each purchase...

## 4. Smart Contract Spec
- Architecture: A TokenFactory contract that deploys new
  BondingCurveToken instances...
- buy() payable: calculate how many tokens the sent ETH buys
- sell(amount): burn tokens, return ETH value...

## 5. Frontend Spec
- Explore page: grid of all launched tokens
- Token Detail / Trade page: live price chart...`;

export const BuildPromptsPageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Page zoom-in from previous scene
  const pageEntrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });
  const pageScale = interpolate(pageEntrance, [0, 1], [0.3, 1]);
  const pageOpacity = pageEntrance;

  // Accordion already expanded from the start
  const accordionOpen = 1;

  // No scroll needed — content fits with accordion already open
  const scrollY = 0;

  // Copy button click (frame 80)
  const copyClick = frame >= 80;

  // Exit zoom — after click, zoom out into transition
  const exitZoom = interpolate(frame, [110, 160], [1, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(frame, [130, 160], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor — goes straight to copy button
  const cursorPositions = [
    { x: 1100, y: 350, frame: 0 },       // start off to the side
    { x: 960, y: 480, frame: 40 },       // glide to copy button
    { x: 960, y: 480, frame: 80 },       // click on copy button
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
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          paddingTop: 60,
          transform: `scale(${pageScale * exitZoom}) translateY(${scrollY}px)`,
          opacity: pageOpacity * exitOpacity,
          transformOrigin: "center 60%",
        }}
      >
        <div style={{ width: 900, maxWidth: "100%" }}>
          {/* Page header */}
          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: 0,
            }}
          >
            Build Prompts
          </h1>
          <p
            style={{
              fontSize: 18,
              color: colors.textSecondary,
              marginTop: 10,
              marginBottom: 32,
            }}
          >
            AI-ready prompts for Ethereum build ideas. Copy a prompt into your AI
            agent and start building.
          </p>

          {/* Accordion items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PROMPTS.map((prompt, i) => {
              const isOpen = prompt.isHero && accordionOpen > 0;
              const contentHeight = isOpen ? accordionOpen * 350 : 0;

              return (
                <div
                  key={i}
                  style={{
                    background: colors.bgCard,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: isOpen
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${colors.accent}33`,
                    boxShadow: isOpen
                      ? `0 4px 20px ${colors.accentGlow}`
                      : "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Accordion header */}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: colors.textPrimary,
                            lineHeight: 1.3,
                          }}
                        >
                          {prompt.name}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            marginTop: 4,
                          }}
                        >
                          {prompt.description}
                        </div>
                      </div>
                      {/* Arrow */}
                      <div
                        style={{
                          fontSize: 18,
                          color: colors.primary,
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          marginLeft: 16,
                        }}
                      >
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Accordion content */}
                  {isOpen && (
                    <div style={{ height: contentHeight, overflow: "hidden" }}>
                      <div style={{ padding: "0 20px 16px" }}>
                        {/* Code block */}
                        <div
                          style={{
                            background: colors.bgCode,
                            borderRadius: 8,
                            padding: 16,
                            fontSize: 13,
                            color: colors.textPrimary,
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                            maxHeight: 240,
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
                            marginTop: 12,
                            padding: "10px 0",
                            borderRadius: 9999,
                            textAlign: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            background: copyClick
                              ? colors.success
                              : colors.primary,
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {frame < 260 && (
        <AnimatedCursor positions={cursorPositions} clickAtEnd color={colors.primary} />
      )}
    </AbsoluteFill>
  );
};
