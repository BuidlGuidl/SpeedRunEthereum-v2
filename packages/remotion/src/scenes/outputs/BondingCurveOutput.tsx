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
    // Realistic up/down price movement
    const supply = i / numPoints;
    const trend = supply * 0.5; // overall slight uptrend
    const wave1 = Math.sin(supply * Math.PI * 4) * 0.15;
    const wave2 = Math.sin(supply * Math.PI * 7) * 0.08;
    const price = 0.2 + trend + wave1 + wave2;
    const y = 280 - price * 280;
    chartPoints.push(`${x},${y}`);
  }

  // Current price marker
  const markerX = 40 + chartProgress * 520;
  const markerSupply = chartProgress;
  const markerTrend = markerSupply * 0.5;
  const markerWave1 = Math.sin(markerSupply * Math.PI * 4) * 0.15;
  const markerWave2 = Math.sin(markerSupply * Math.PI * 7) * 0.08;
  const markerPrice = 0.2 + markerTrend + markerWave1 + markerWave2;
  const markerY = 280 - markerPrice * 280;

  // Price ticker
  const currentPrice = (0.0001 + markerPrice * 0.005).toFixed(6);
  const priceChange = ((markerPrice - 0.2) / 0.2 * 100);
  const priceChangePercent = priceChange.toFixed(1);
  const isPositive = priceChange >= 0;

  // Recent trades animation
  const trades = [
    { action: "BUY", amount: "0.5 ETH", tokens: "4,200 BUILD", wallet: "0x7a2d...3F1c", time: "2s ago", color: colors.tradingGreen },
    { action: "BUY", amount: "1.2 ETH", tokens: "8,100 BUILD", wallet: "0xd8dA...6045", time: "5s ago", color: colors.tradingGreen },
    { action: "SELL", amount: "0.3 ETH", tokens: "2,100 BUILD", wallet: "0x1b7c...6F8a", time: "8s ago", color: colors.tradingRed },
    { action: "BUY", amount: "2.0 ETH", tokens: "11,500 BUILD", wallet: "0x8f3a...9D2e", time: "12s ago", color: colors.tradingGreen },
    { action: "SELL", amount: "0.8 ETH", tokens: "5,300 BUILD", wallet: "0x42fB...A7c1", time: "18s ago", color: colors.tradingRed },
    { action: "BUY", amount: "0.2 ETH", tokens: "1,400 BUILD", wallet: "0xaE9c...2D04", time: "25s ago", color: colors.tradingGreen },
    { action: "BUY", amount: "3.5 ETH", tokens: "19,200 BUILD", wallet: "0x5cF1...eB38", time: "31s ago", color: colors.tradingGreen },
    { action: "SELL", amount: "1.0 ETH", tokens: "6,800 BUILD", wallet: "0x93Dd...7F12", time: "45s ago", color: colors.tradingRed },
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
              ⚡
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>BUILD</span>
                <span style={{ fontSize: 16, color: colors.textMuted }}>/ ETH</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
                <span style={{ color: isPositive ? colors.tradingGreen : colors.tradingRed }}>
                  {currentPrice} ETH
                </span>
                <span style={{ color: isPositive ? colors.tradingGreen : colors.tradingRed }}>
                  {isPositive ? "+" : ""}{priceChangePercent}%
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

        {/* Right: Swap panel + Trade history */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Swap panel */}
          <div
            style={{
              background: "#0d1117",
              borderRadius: 12,
              border: "1px solid #1e293b",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  flex: 1,
                  padding: "8px 0",
                  textAlign: "center",
                  borderRadius: 8,
                  background: colors.tradingGreen,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Buy
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "8px 0",
                  textAlign: "center",
                  borderRadius: 8,
                  background: "#1e293b",
                  color: colors.textMuted,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Sell
              </div>
            </div>

            {/* From: ETH */}
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>From</div>
            <div
              style={{
                background: "#1a1a2e",
                borderRadius: 10,
                padding: "12px 14px",
                border: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>1.0</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>≈ $2,450</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #627eea, #3b5998)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Ξ
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>ETH</span>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: "center", fontSize: 16, color: colors.textMuted, margin: "4px 0" }}>
              ↓
            </div>

            {/* To: BUILD */}
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>To</div>
            <div
              style={{
                background: "#1a1a2e",
                borderRadius: 10,
                padding: "12px 14px",
                border: `1px solid ${colors.tradingGreen}33`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: colors.tradingGreen }}>6,847</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>≈ $2,450</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  ⚡
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>BUILD</span>
              </div>
            </div>

            {/* Swap button */}
            <div
              style={{
                padding: "12px 0",
                textAlign: "center",
                borderRadius: 10,
                background: `linear-gradient(135deg, ${colors.tradingGreen}, #16a34a)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Swap ETH → BUILD
            </div>
          </div>

          {/* Trade history */}
          <div
            style={{
              flex: 1,
              background: "#0d1117",
              borderRadius: 12,
              border: "1px solid #1e293b",
              padding: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Trade History
            </div>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr 1fr 60px",
                gap: 8,
                fontSize: 13,
                color: colors.textMuted,
                fontWeight: 700,
                padding: "4px 0 8px",
                borderBottom: "1px solid #1e293b",
              }}
            >
              <span>Type</span>
              <span>Amount</span>
              <span>Wallet</span>
              <span style={{ textAlign: "right" }}>Time</span>
            </div>
            {trades.map((trade, i) => {
              const tradeEntrance = spring({
                frame,
                fps,
                delay: 30 + i * 8,
                config: { damping: 200 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "50px 1fr 1fr 60px",
                    gap: 8,
                    padding: "9px 0",
                    borderBottom: "1px solid #1e293b22",
                    opacity: tradeEntrance,
                    fontSize: 14,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: trade.color,
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: `${trade.color}15`,
                      textAlign: "center",
                    }}
                  >
                    {trade.action}
                  </span>
                  <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 13 }}>
                    {trade.amount} → {trade.tokens}
                  </span>
                  <span style={{ color: colors.textMuted, fontFamily: "monospace", fontSize: 12 }}>
                    {trade.wallet}
                  </span>
                  <span style={{ color: colors.textMuted, textAlign: "right", fontSize: 12 }}>
                    {trade.time}
                  </span>
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
