import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../../theme";
import { GlowLabel } from "../../components/GlowLabel";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const StreamingPaymentsOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: 5, config: { damping: 200 } });

  // Real-time counter ticking
  const ethStreamed = 0.0042 + frame * 0.000018;
  const ethFormatted = ethStreamed.toFixed(8);

  // Stream progress bars
  const streams = [
    {
      name: "Alice.eth → Bob.eth",
      total: 10,
      rate: "0.0012 ETH/hr",
      progress: interpolate(frame, [0, 150], [0.35, 0.58], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      color: colors.streamBlue,
    },
    {
      name: "Treasury → Dev Team",
      total: 50,
      rate: "0.0058 ETH/hr",
      progress: interpolate(frame, [0, 150], [0.62, 0.78], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      color: colors.accent,
    },
    {
      name: "DAO → Contributor",
      total: 5,
      rate: "0.0004 ETH/hr",
      progress: interpolate(frame, [0, 150], [0.15, 0.28], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      color: "#a855f7",
    },
  ];

  // Waterfall drops
  const drops = Array.from({ length: 8 }, (_, i) => {
    const x = 140 + i * 200;
    const speed = 2 + (i % 3) * 1.5;
    const yOffset = ((frame * speed + i * 40) % 250);
    const dropOpacity = interpolate(yOffset, [0, 30, 200, 250], [0, 0.4, 0.4, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { x, y: 80 + yOffset, opacity: dropOpacity };
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        fontFamily,
        padding: 60,
        overflow: "hidden",
      }}
    >
      {/* Animated waterfall drops in background */}
      {drops.map((drop, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: drop.x,
            top: drop.y,
            width: 3,
            height: 20,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${colors.streamBlue}, transparent)`,
            opacity: drop.opacity,
          }}
        />
      ))}

      <div style={{ opacity: entrance, position: "relative", zIndex: 1 }}>
        {/* Big counter hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 16, color: colors.streamBlue, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 16 }}>
            TOTAL STREAMED
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#fff",
              fontFamily: "monospace",
              letterSpacing: "-0.02em",
              textShadow: `0 0 40px ${colors.streamBlue}44`,
            }}
          >
            Ξ {ethFormatted}
          </div>
          <div style={{ fontSize: 22, color: colors.textSecondary, marginTop: 8 }}>
            streaming right now, every second
          </div>
        </div>

        {/* Active Streams */}
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 24 }}>
            Active Streams
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {streams.map((stream, i) => {
              const rowEntrance = spring({ frame, fps, delay: 20 + i * 10, config: { damping: 200 } });
              const streamedAmount = (stream.total * stream.progress).toFixed(4);
              return (
                <div
                  key={i}
                  style={{
                    background: "#1e293b",
                    borderRadius: 14,
                    padding: "24px 32px",
                    border: "1px solid #334155",
                    opacity: rowEntrance,
                    transform: `translateY(${interpolate(rowEntrance, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{stream.name}</div>
                      <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                        Rate: {stream.rate}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: stream.color, fontFamily: "monospace" }}>
                        {streamedAmount} ETH
                      </div>
                      <div style={{ fontSize: 13, color: colors.textMuted }}>
                        of {stream.total} ETH
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: 12,
                      borderRadius: 4,
                      background: "#0f172a",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${stream.progress * 100}%`,
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${stream.color}88, ${stream.color})`,
                        boxShadow: `0 0 12px ${stream.color}44`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <GlowLabel text="Streaming Payments" color={colors.streamBlue} delay={15} />
    </AbsoluteFill>
  );
};
