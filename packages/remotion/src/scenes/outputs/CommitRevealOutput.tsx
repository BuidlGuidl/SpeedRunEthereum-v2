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
import { colors } from "../../theme";
import { GlowLabel } from "../../components/GlowLabel";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const CommitRevealOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: 5, config: { damping: 200 } });

  // Game phases
  const isCommitPhase = frame < 60;
  const isRevealPhase = frame >= 60 && frame < 100;
  const isResultPhase = frame >= 100;

  // Hand selection animation (commit phase)
  const selectedHand = 1; // Rock = 0, Paper = 1, Scissors = 2
  const hands = ["✊", "✋", "✌️"];
  const handNames = ["Rock", "Paper", "Scissors"];

  // Reveal animation
  const revealProgress = isRevealPhase
    ? spring({ frame: frame - 60, fps, config: { damping: 15, stiffness: 200 } })
    : isResultPhase ? 1 : 0;

  // Result animation
  const resultEntrance = isResultPhase
    ? spring({ frame: frame - 100, fps, delay: 5, config: { damping: 200 } })
    : 0;

  // Commit hash scramble
  const hashChars = "0123456789abcdef";
  const generateHash = (seed: number): string => {
    let hash = "0x";
    for (let i = 0; i < 16; i++) {
      const idx = (seed * (i + 1) * 7 + i * 13) % hashChars.length;
      hash += hashChars[idx];
    }
    return hash + "...";
  };

  // Scrambling hash animation during commit
  const player1Hash = isCommitPhase ? generateHash(frame + 42) : "0x7e3f4a8b2c1d9e6f...";
  const player2Hash = isCommitPhase ? generateHash(frame * 3 + 17) : "0xa1b2c3d4e5f67890...";

  // Opponent choice (randomized appearance before settling)
  const opponentHand = 0; // Rock — player wins with Paper

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a0533 0%, #0f0520 100%)",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Arcade scanlines effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      <div style={{ opacity: entrance, padding: 60, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Game header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 16, color: colors.arcadeYellow, fontWeight: 700, letterSpacing: "0.2em" }}>
            COMMIT-REVEAL
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", marginTop: 4 }}>
            Rock • Paper • Scissors
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "10px 32px",
              borderRadius: 24,
              fontSize: 22,
              fontWeight: 700,
              background: isCommitPhase
                ? `${colors.arcadeYellow}22`
                : isRevealPhase
                  ? `${colors.arcadePurple}22`
                  : `${colors.tradingGreen}22`,
              color: isCommitPhase
                ? colors.arcadeYellow
                : isRevealPhase
                  ? colors.arcadePurple
                  : colors.tradingGreen,
              border: `1px solid ${isCommitPhase ? colors.arcadeYellow : isRevealPhase ? colors.arcadePurple : colors.tradingGreen}44`,
            }}
          >
            {isCommitPhase ? "⏳ COMMIT PHASE" : isRevealPhase ? "🔓 REVEAL PHASE" : "🏆 RESULT"}
          </div>
        </div>

        {/* Battle area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 160,
          }}
        >
          {/* Player 1 */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 260,
                height: 260,
                borderRadius: 32,
                background: `linear-gradient(135deg, ${colors.primary}33, ${colors.primary}11)`,
                border: `2px solid ${colors.primary}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isRevealPhase || isResultPhase ? 120 : 60,
                boxShadow: `0 0 30px ${colors.primary}22`,
              }}
            >
              {isCommitPhase ? "🔒" : hands[selectedHand]}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginTop: 20 }}>You</div>
            {isCommitPhase && (
              <div
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  fontFamily: "monospace",
                  marginTop: 8,
                  width: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {player1Hash}
              </div>
            )}
            {isResultPhase && (
              <div style={{ fontSize: 20, color: colors.textSecondary, marginTop: 8 }}>
                {handNames[selectedHand]}
              </div>
            )}
          </div>

          {/* VS */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: colors.arcadeYellow,
              textShadow: `0 0 20px ${colors.arcadeYellow}44`,
            }}
          >
            VS
          </div>

          {/* Player 2 */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 260,
                height: 260,
                borderRadius: 32,
                background: `linear-gradient(135deg, ${colors.tradingRed}33, ${colors.tradingRed}11)`,
                border: `2px solid ${colors.tradingRed}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: revealProgress > 0.5 ? 120 : 60,
                boxShadow: `0 0 30px ${colors.tradingRed}22`,
                transform: `rotateY(${interpolate(revealProgress, [0, 1], [180, 0])}deg)`,
              }}
            >
              {revealProgress > 0.5 ? hands[opponentHand] : "🔒"}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginTop: 20 }}>Opponent</div>
            {isCommitPhase && (
              <div
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  fontFamily: "monospace",
                  marginTop: 8,
                  width: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {player2Hash}
              </div>
            )}
            {isResultPhase && (
              <div style={{ fontSize: 20, color: colors.textSecondary, marginTop: 8 }}>
                {handNames[opponentHand]}
              </div>
            )}
          </div>
        </div>

        {/* Result banner */}
        {isResultPhase && (
          <div
            style={{
              textAlign: "center",
              opacity: resultEntrance,
              transform: `scale(${interpolate(resultEntrance, [0, 1], [0.5, 1])})`,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                display: "inline-block",
                fontSize: 48,
                fontWeight: 900,
                color: colors.tradingGreen,
                padding: "16px 60px",
                borderRadius: 20,
                background: `${colors.tradingGreen}15`,
                border: `2px solid ${colors.tradingGreen}44`,
                textShadow: `0 0 20px ${colors.tradingGreen}44`,
              }}
            >
              🎉 YOU WIN! +0.5 ETH
            </div>
          </div>
        )}

        {/* Bet amount */}
        <div style={{ textAlign: "center", marginBottom: 100 }}>
          <span style={{ fontSize: 20, color: colors.textMuted }}>
            Bet: 0.5 ETH each • Winner takes all
          </span>
        </div>
      </div>

      <GlowLabel text="Commit-Reveal Game" color={colors.arcadePurple} delay={15} />
    </AbsoluteFill>
  );
};
