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
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const BondingCurveOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: 5, config: { damping: 200 } });

  // Animated price chart line
  const chartProgress = interpolate(frame, [10, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Generate bonding curve points
  const chartPoints: string[] = [];
  const numPoints = 60;
  for (let i = 0; i <= numPoints * chartProgress; i++) {
    const x = 40 + (i / numPoints) * 520;
    // Quadratic curve: price = base + slope * supply²
    const supply = i / numPoints;
    const price = 0.1 + supply * supply * 0.9;
    const y = 280 - price * 240;
    chartPoints.push(`${x},${y}`);
  }

  // Current price marker
  const markerX = 40 + chartProgress * 520;
  const markerSupply = chartProgress;
  const markerPrice = 0.1 + markerSupply * markerSupply * 0.9;
  const markerY = 280 - markerPrice * 240;

  // Price ticker
  const currentPrice = (0.0001 + chartProgress * chartProgress * 0.005).toFixed(6);
  const priceChangePercent = (chartProgress * 247).toFixed(1);

  // Recent trades animation
  const trades = [
    { action: "BUY", amount: "0.5 ETH", tokens: "4,200", time: "2s ago", color: colors.tradingGreen },
    { action: "BUY", amount: "1.2 ETH", tokens: "8,100", time: "5s ago", color: colors.tradingGreen },
    { action: "SELL", amount: "0.3 ETH", tokens: "2,100", time: "8s ago", color: colors.tradingRed },
    { action: "BUY", amount: "2.0 ETH", tokens: "11,500", time: "12s ago", color: colors.tradingGreen },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a14 0%, #111827 100%)",
        fontFamily,
        padding: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 32,
          height: "100%",
          opacity: entrance,
        }}
      >
        {/* Left: Chart area */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
          {/* Token header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `linear-gradient(135deg, #a855f7, #6366f1)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              🚀
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>MOON</span>
                <span style={{ fontSize: 16, color: colors.textMuted }}>/ ETH</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
                <span style={{ color: colors.tradingGreen }}>
                  {currentPrice} ETH
                </span>
                <span style={{ color: colors.tradingGreen }}>
                  +{priceChangePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div
            style={{
              flex: 1,
              background: "#0d1117",
              borderRadius: 12,
              border: "1px solid #1e293b",
              padding: 20,
              position: "relative",
            }}
          >
            <svg width="600" height="300" viewBox="0 0 600 300">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 60}
                  x2="560"
                  y2={40 + i * 60}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              ))}
              {/* Gradient fill under curve */}
              {chartPoints.length > 1 && (
                <>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.tradingGreen} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={colors.tradingGreen} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${chartPoints.join(" ")} ${markerX},280 40,280`}
                    fill="url(#chartGrad)"
                  />
                  <polyline
                    points={chartPoints.join(" ")}
                    fill="none"
                    stroke={colors.tradingGreen}
                    strokeWidth="2.5"
                  />
                </>
              )}
              {/* Current position marker */}
              {chartProgress > 0.05 && (
                <>
                  <circle cx={markerX} cy={markerY} r="6" fill={colors.tradingGreen} />
                  <circle cx={markerX} cy={markerY} r="10" fill={colors.tradingGreen} opacity="0.3" />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Right: Trade panel + activity */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Buy/Sell panel */}
          <div
            style={{
              background: "#0d1117",
              borderRadius: 12,
              border: "1px solid #1e293b",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <div
                style={{
                  flex: 1,
                  padding: "10px 0",
                  textAlign: "center",
                  borderRadius: 8,
                  background: colors.tradingGreen,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Buy
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "10px 0",
                  textAlign: "center",
                  borderRadius: 8,
                  background: "#1e293b",
                  color: colors.textMuted,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Sell
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Amount (ETH)</div>
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontSize: 18,
                  color: "#fff",
                  border: `1px solid ${colors.tradingGreen}44`,
                }}
              >
                1.0
              </div>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
              ≈ 6,800 MOON tokens
            </div>
            <div
              style={{
                padding: "14px 0",
                textAlign: "center",
                borderRadius: 10,
                background: `linear-gradient(135deg, ${colors.tradingGreen}, #16a34a)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Buy MOON
            </div>
          </div>

          {/* Activity feed */}
          <div
            style={{
              flex: 1,
              background: "#0d1117",
              borderRadius: 12,
              border: "1px solid #1e293b",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Recent Trades
            </div>
            {trades.map((trade, i) => {
              const tradeEntrance = spring({
                frame,
                fps,
                delay: 30 + i * 12,
                config: { damping: 200 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #1e293b",
                    opacity: tradeEntrance,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: trade.color, fontWeight: 700 }}>{trade.action}</span>
                  <span style={{ color: colors.textSecondary }}>{trade.amount}</span>
                  <span style={{ color: colors.textMuted }}>{trade.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <GlowLabel text="Bonding Curve Token Launch" color={colors.tradingGreen} delay={15} />
    </AbsoluteFill>
  );
};
