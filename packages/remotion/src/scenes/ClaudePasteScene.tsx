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
  weights: ["400", "700"],
  subsets: ["latin"],
});

// Terminal prompt text that gets typed into Claude Code CLI
const PASTED_PROMPT_LINES = [
  "paste",
  "# SPEC: Bonding Curve Token Launch",
  "",
  "## 1. Objective",
  "A token launchpad where anyone can create a new ERC-20 token",
  "with an automated bonding curve. The price rises mathematically",
  "with each purchase and decreases with each sale.",
  "",
  "## 4. Smart Contract Spec",
  "- Architecture: A TokenFactory contract that deploys new",
  "  BondingCurveToken instances.",
  "- buy() payable: calculate tokens at current curve price",
  "- sell(amount): burn tokens, return ETH at curve price.",
];

const CLAUDE_RESPONSE_LINES = [
  { text: "  I'll build your Bonding Curve Token Launch with", color: colors.claudeText },
  { text: "  Scaffold-ETH 2! Let me start with the smart contracts...", color: colors.claudeText },
  { text: "", color: colors.claudeText },
  { text: "  Creating TokenFactory.sol", color: colors.claudeCyan },
  { text: "    ✓ createToken(name, symbol)", color: colors.claudeGreen },
  { text: "    ✓ Token registry & events", color: colors.claudeGreen },
  { text: "", color: colors.claudeText },
  { text: "  Creating BondingCurveToken.sol", color: colors.claudeCyan },
  { text: "    ✓ buy() with integral math", color: colors.claudeGreen },
  { text: "    ✓ sell() with reserve tracking", color: colors.claudeGreen },
  { text: "    ✓ getCurrentPrice() view", color: colors.claudeGreen },
];

export const ClaudePasteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal entrance — scale up
  const termEntrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });
  const termScale = interpolate(termEntrance, [0, 1], [0.9, 1]);

  // Phase 1: Paste the prompt (frames 10-70)
  const pasteProgress = interpolate(frame, [10, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const totalLines = PASTED_PROMPT_LINES.length;
  const visiblePasteLines = Math.floor(pasteProgress * totalLines);

  // Phase 2: Thinking dots (frames 80-120)
  const isThinking = frame >= 80 && frame < 120;
  const thinkingDots = isThinking ? ".".repeat((Math.floor((frame - 80) / 8) % 3) + 1) : "";

  // Phase 3: Response streaming (frames 120-240)
  const responseProgress = interpolate(frame, [120, 220], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleResponseLines = Math.floor(responseProgress * CLAUDE_RESPONSE_LINES.length);

  // Scroll up as content grows
  const scrollY = interpolate(frame, [50, 200], [0, -280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Blinking cursor
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Floating SRE-style background particles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const baseX = (i * 240 + 60) % 1920;
    const baseY = 100 + (i * 180) % 800;
    const speed = 0.15 + (i % 3) * 0.1;
    const offsetY = Math.sin(frame * speed * 0.04 + i) * 25;
    const size = 6 + (i % 4) * 5;
    return { x: baseX, y: baseY + offsetY, size, opacity: 0.12 };
  });

  return (
    <AbsoluteFill
      style={{
        // SRE-themed background visible around the terminal
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 50%, ${colors.bgTertiary} 100%)`,
        fontFamily,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* SRE-style floating particles in background */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: 2,
            background: i % 2 === 0 ? colors.accent : colors.primaryLight,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Bottom teal bar — matching SRE ground */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 60,
          background: `linear-gradient(180deg, ${colors.accent}44, ${colors.primary})`,
          zIndex: 0,
        }}
      />

      {/* Terminal window — large, zoomed, floating with shadow */}
      <div
        style={{
          width: "88%",
          height: "88%",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `0 24px 80px rgba(0,0,0,0.3), 0 0 40px ${colors.accentGlow}`,
          border: `1px solid #444`,
          display: "flex",
          flexDirection: "column",
          transform: `scale(${termScale})`,
          opacity: termEntrance,
          zIndex: 1,
        }}
      >
        {/* Terminal title bar */}
        <div
          style={{
            height: 44,
            background: "#2d2d2d",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 10,
            borderBottom: "1px solid #3a3a3a",
            flexShrink: 0,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#28ca42" }} />
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 17,
              color: "#aaa",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Claude Code — SpeedRunEthereum-v2
          </div>
        </div>

        {/* Terminal content */}
        <div
          style={{
            flex: 1,
            background: colors.claudeBg,
            padding: "28px 40px",
            fontSize: 26,
            lineHeight: 1.6,
            overflow: "hidden",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          }}
        >
          <div style={{ transform: `translateY(${scrollY}px)` }}>
            {/* Initial bash prompt */}
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: colors.claudeGreen }}>Pablo@DESKTOP</span>
              <span style={{ color: colors.claudeText }}> </span>
              <span style={{ color: colors.claudeBlue }}>/e/GitHub/SpeedRunEthereum-v2</span>
              <span style={{ color: colors.claudeText }}> </span>
              <span style={{ color: colors.claudePurple }}>(main)</span>
            </div>

            {/* claude command */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ color: colors.claudeText }}>$ </span>
              <span style={{ color: colors.claudeYellow }}>claude</span>
            </div>

            {/* Claude Code welcome banner */}
            <div
              style={{
                marginBottom: 20,
                padding: "14px 0",
                borderTop: `1px solid #444`,
                borderBottom: `1px solid #444`,
              }}
            >
              <div style={{ color: colors.claudeText, textAlign: "center", marginBottom: 6 }}>
                ╭─ <span style={{ fontWeight: 700 }}>Claude Code v2.1.79</span> ─╮
              </div>
              <div style={{ color: colors.claudeOrange, textAlign: "center", fontWeight: 700, fontSize: 30 }}>
                Welcome back Pablo!
              </div>
              <div style={{ color: "#666", textAlign: "center", fontSize: 18, marginTop: 6 }}>
                Opus 4.6 · Claude Pro · SpeedRunEthereum-v2
              </div>
            </div>

            {/* Claude prompt > */}
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: colors.claudeGreen, fontWeight: 700 }}>&gt; </span>
              {visiblePasteLines === 0 && frame >= 10 && (
                <span style={{ color: colors.claudeText, opacity: cursorVisible ? 1 : 0 }}>█</span>
              )}
            </div>

            {/* Pasted prompt lines */}
            {visiblePasteLines > 0 && (
              <div
                style={{
                  padding: "10px 20px",
                  marginLeft: 20,
                  borderLeft: `2px solid ${colors.claudePurple}44`,
                  marginBottom: 16,
                }}
              >
                {PASTED_PROMPT_LINES.slice(0, visiblePasteLines).map((line, i) => (
                  <div
                    key={i}
                    style={{
                      color: line.startsWith("#")
                        ? colors.claudeYellow
                        : line.startsWith("-")
                          ? colors.claudeCyan
                          : colors.claudeText,
                      fontSize: 24,
                    }}
                  >
                    {line || "\u00A0"}
                  </div>
                ))}
                {visiblePasteLines < totalLines && (
                  <span style={{ color: colors.claudeText, opacity: cursorVisible ? 1 : 0 }}>█</span>
                )}
              </div>
            )}

            {/* Thinking indicator */}
            {isThinking && (
              <div style={{ marginTop: 14, marginBottom: 10 }}>
                <span style={{ color: colors.claudeOrange }}>⠋ </span>
                <span style={{ color: "#888" }}>Thinking{thinkingDots}</span>
              </div>
            )}

            {/* Claude response */}
            {visibleResponseLines > 0 && (
              <div style={{ marginTop: 14 }}>
                {CLAUDE_RESPONSE_LINES.slice(0, visibleResponseLines).map((line, i) => (
                  <div
                    key={i}
                    style={{
                      color: line.color,
                      fontSize: 24,
                    }}
                  >
                    {line.text || "\u00A0"}
                  </div>
                ))}
                {visibleResponseLines < CLAUDE_RESPONSE_LINES.length && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 18,
                      background: colors.claudeOrange,
                      opacity: cursorVisible ? 1 : 0.3,
                      marginLeft: 2,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom status bar */}
        <div
          style={{
            height: 34,
            background: "#2d2d2d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            fontSize: 16,
            color: "#888",
            borderTop: "1px solid #3a3a3a",
            fontFamily: "'JetBrains Mono', monospace",
            flexShrink: 0,
          }}
        >
          <span>? for shortcuts</span>
          <span>⬤ medium · /effort</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
