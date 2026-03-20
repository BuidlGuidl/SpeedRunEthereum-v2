import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === 3D Fly-In Animation ===
  // The screenshot starts below the viewport, tilted back, then swoops in
  const flyIn = spring({
    frame,
    fps,
    delay: 55,
    config: { damping: 18, stiffness: 60, mass: 1.4 },
  });

  // Y position: starts far below, lands centered
  const pageY = interpolate(flyIn, [0, 1], [1200, 0]);

  // X rotation: starts tilted back (perspective), settles flat
  const rotateX = interpolate(flyIn, [0, 1], [40, 0]);

  // Scale: slightly smaller at start, full size when landed
  const pageScale = interpolate(flyIn, [0, 1], [0.7, 0.92]);

  // === Hook text overlay — appears then fades as page arrives ===
  const textOpacity = interpolate(frame, [0, 15, 70, 95], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // === Scroll down through the page after landing ===
  // The screenshot is ~1000px tall at 1600w, viewport shows ~900px
  // We scroll to reveal the bottom (Build cards)
  const scrollY = interpolate(frame, [110, 190], [0, -750], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t: number) => t * t * (3 - 2 * t), // smooth ease-in-out
  });

  // Floating background particles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const baseX = (i * 240 + 80) % 1920;
    const baseY = 80 + (i * 170) % 750;
    const offsetY = Math.sin(frame * 0.03 + i * 1.2) * 25;
    const size = 6 + (i % 4) * 5;
    return { x: baseX, y: baseY + offsetY, size };
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 50%, ${colors.bgTertiary} 100%)`,
        fontFamily,
        overflow: "hidden",
        perspective: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* SRE-style floating squares */}
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
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      ))}

      {/* Hook text overlay */}
      {textOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            opacity: textOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: colors.textPrimary,
              lineHeight: 1.15,
              maxWidth: 1600,
              letterSpacing: "-0.03em",
              textShadow: "0 4px 40px rgba(255,255,255,0.9)",
            }}
          >
            What if your AI agent could{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              1shot
            </span>{" "}
            production dapps?
          </div>
        </div>
      )}

      {/* Screenshot with 3D perspective fly-in + scroll */}
      <div
        style={{
          transform: `
            translateY(${pageY}px)
            rotateX(${rotateX}deg)
            scale(${pageScale})
          `,
          transformOrigin: "center bottom",
          zIndex: 10,
          width: 1600,
          height: 900,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: `
            0 30px 90px rgba(0,0,0,0.15),
            0 0 40px ${colors.accentGlow}
          `,
          border: `2px solid ${colors.accent}44`,
        }}
      >
        <Img
          src={staticFile("portfolio-screenshot.png")}
          style={{
            width: 1630,
            display: "block",
            transform: `translateY(${scrollY}px)`,
          }}
        />
      </div>

      {/* Bottom teal bar */}
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
    </AbsoluteFill>
  );
};
