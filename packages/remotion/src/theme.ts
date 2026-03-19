// Design tokens matching SpeedRunEthereum's ACTUAL theme
// Based on tailwind.config.js light theme
export const colors = {
  // Backgrounds — SRE uses light/white with cyan tints
  bgPrimary: "#ffffff",
  bgSecondary: "#E9FBFF",
  bgTertiary: "#C8F5FF",
  bgCard: "#ffffff",
  bgCardHover: "#E9FBFF",
  bgAccordion: "#ffffff",
  bgCode: "#f0fdfa",

  // Brand — SRE teal palette
  primary: "#088484",
  primaryLight: "#C8F5FF",
  accent: "#67DDDE",
  accentGlow: "rgba(103, 221, 222, 0.3)",
  neutral: "#066060",
  success: "#088484",
  successBg: "#C8F5FF",

  // Text
  textPrimary: "#026262",
  textSecondary: "rgba(2, 98, 98, 0.7)",
  textMuted: "rgba(2, 98, 98, 0.4)",
  textWhite: "#ffffff",

  // Claude Code CLI
  claudeBg: "#1a1a1a",
  claudeText: "#e0e0e0",
  claudeGreen: "#4ade80",
  claudeYellow: "#facc15",
  claudeBlue: "#60a5fa",
  claudePurple: "#c084fc",
  claudeOrange: "#fb923c",
  claudeRed: "#f87171",
  claudeCyan: "#22d3ee",

  // Output mockup accents
  tradingGreen: "#22c55e",
  tradingRed: "#ef4444",
  arcadePurple: "#a855f7",
  arcadeYellow: "#facc15",
  streamBlue: "#3b82f6",
  registrarTeal: "#088484",

  // Misc
  warning: "#FFCF72",
  error: "#FF8863",
  violet: "#606CCF",
} as const;

export const fonts = {
  heading: "Inter, sans-serif",
  body: "Inter, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

// Common style helpers
export const styles = {
  fullScreen: {
    width: "100%",
    height: "100%",
    display: "flex" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sreBg: {
    background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
  },
} as const;

// Video config
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;
