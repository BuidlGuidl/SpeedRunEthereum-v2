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

export const NameRegistryOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, delay: 5, config: { damping: 200 } });

  // Typewriter search
  const searchText = "vitalik.eth";
  const searchChars = Math.min(
    Math.floor(Math.max(0, frame - 20) * 0.6),
    searchText.length
  );
  const displaySearch = searchText.slice(0, searchChars);

  // Availability check appears after typing completes
  const searchDone = searchChars >= searchText.length;
  const availabilityEntrance = searchDone
    ? spring({ frame, fps, delay: 45, config: { damping: 200 } })
    : 0;

  // Example registered names
  const registeredNames = [
    { name: "builder.eth", address: "0x742d...4B3c", status: "Active" },
    { name: "defi-wizard.eth", address: "0x8f3a...9D2e", status: "Active" },
    { name: "nft-artist.eth", address: "0x1b7c...6F8a", status: "Active" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #0f172a 100%)",
        fontFamily,
        padding: 60,
      }}
    >
      <div style={{ opacity: entrance }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 18, color: colors.registrarTeal, fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>
            ON-CHAIN NAME REGISTRY
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Claim your on-chain identity
          </div>
          <div style={{ fontSize: 22, color: colors.textSecondary }}>
            Decentralized names → Ethereum addresses. No middlemen.
          </div>
        </div>

        {/* Search bar */}
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#1e293b",
              borderRadius: 16,
              border: `2px solid ${colors.registrarTeal}44`,
              overflow: "hidden",
              boxShadow: `0 0 40px ${colors.registrarTeal}11`,
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "20px 28px",
                fontSize: 28,
                color: searchChars > 0 ? "#fff" : colors.textMuted,
                fontFamily: "monospace",
              }}
            >
              {searchChars > 0 ? displaySearch : "Search for a name..."}
              {searchChars > 0 && searchChars < searchText.length && (
                <span style={{ color: colors.registrarTeal }}>|</span>
              )}
            </div>
            <div
              style={{
                padding: "20px 32px",
                background: `linear-gradient(135deg, ${colors.registrarTeal}, #0d9488)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
              }}
            >
              Search
            </div>
          </div>

          {/* Availability result */}
          {availabilityEntrance > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "16px 28px",
                borderRadius: 12,
                background: `${colors.tradingRed}15`,
                border: `1px solid ${colors.tradingRed}44`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: availabilityEntrance,
                transform: `translateY(${interpolate(availabilityEntrance, [0, 1], [10, 0])}px)`,
              }}
            >
              <div>
                <span style={{ fontSize: 18, fontWeight: 700, color: colors.tradingRed }}>
                  ✗ Taken
                </span>
                <span style={{ fontSize: 16, color: colors.textSecondary, marginLeft: 12 }}>
                  vitalik.eth is already registered
                </span>
              </div>
              <div style={{ fontSize: 14, color: colors.textMuted }}>
                Owner: 0xd8dA...6045
              </div>
            </div>
          )}
        </div>

        {/* Registered names dashboard */}
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 20 }}>
            Your Names
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {registeredNames.map((name, i) => {
              const rowEntrance = spring({ frame, fps, delay: 60 + i * 10, config: { damping: 200 } });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 28px",
                    background: "#1e293b",
                    borderRadius: 12,
                    border: "1px solid #334155",
                    opacity: rowEntrance,
                    transform: `translateY(${interpolate(rowEntrance, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.registrarTeal}88, ${colors.registrarTeal})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      🏷
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{name.name}</div>
                      <div style={{ fontSize: 15, color: colors.textMuted, fontFamily: "monospace" }}>
                        → {name.address}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      background: `${colors.tradingGreen}22`,
                      color: colors.tradingGreen,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {name.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <GlowLabel text="On-Chain Name Registry" color={colors.registrarTeal} delay={15} />
    </AbsoluteFill>
  );
};
