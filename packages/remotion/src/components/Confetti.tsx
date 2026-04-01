import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

const EC = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Deterministic pseudo-random using index-based seed
function seeded(i: number, offset = 0): number {
  const x = Math.sin((i + 1) * 9301 + offset * 7717) * 49297;
  return x - Math.floor(x);
}

const CONFETTI_COLORS = [
  "#67ddde", // accent teal
  "#088484", // primary
  "#fbbf24", // gold
  "#f472b6", // pink
  "#a78bfa", // purple
  "#34d399", // emerald
  "#60a5fa", // blue
  "#fb923c", // orange
  "#fff",    // white
];

type ConfettiPiece = {
  startX: number;    // origin X spread around bottom center
  velocityX: number; // horizontal velocity
  velocityY: number; // upward velocity (negative = up)
  delay: number;     // stagger delay in frames
  rotation: number;  // rotation speed
  size: number;
  color: string;
  wobble: number;    // wobble frequency
  shape: "rect" | "circle";
  aspectRatio: number;
};

const PIECE_COUNT = 80;
const GRAVITY = 0.35; // pixels per frame^2

function generatePieces(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    // Spread angle: -70° to +70° from vertical (fan out from bottom center)
    const angle = (-70 + seeded(i, 0) * 140) * (Math.PI / 180);
    const power = 18 + seeded(i, 1) * 16; // launch power

    return {
      startX: 960 + (seeded(i, 2) - 0.5) * 300, // spread origin ±150px from center
      velocityX: Math.sin(angle) * power,
      velocityY: -Math.cos(angle) * power,        // negative = upward
      delay: seeded(i, 3) * 8,                    // slight stagger (0-8 frames)
      rotation: 150 + seeded(i, 4) * 500,
      size: 8 + seeded(i, 5) * 14,
      color: CONFETTI_COLORS[Math.floor(seeded(i, 6) * CONFETTI_COLORS.length)],
      wobble: 0.05 + seeded(i, 7) * 0.12,
      shape: seeded(i, 8) > 0.5 ? "rect" : "circle",
      aspectRatio: 0.35 + seeded(i, 9) * 0.65,
    };
  });
}

const pieces = generatePieces();

type Props = {
  startFrame: number;
  durationFrames: number;
};

export const Confetti: React.FC<Props> = ({ startFrame, durationFrames }) => {
  const frame = useCurrentFrame();

  const elapsed = frame - startFrame;
  if (elapsed < 0 || elapsed > durationFrames) return null;

  // Global fade-out in the last 25 frames
  const globalOp = interpolate(elapsed, [durationFrames - 25, durationFrames], [1, 0], EC);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 25,
        opacity: globalOp,
      }}
    >
      {pieces.map((p, i) => {
        const t = Math.max(0, elapsed - p.delay);
        if (t <= 0) return null;

        // Physics: position = origin + velocity*t + 0.5*gravity*t^2
        const x = p.startX + p.velocityX * t + Math.sin(t * p.wobble) * 20;
        const y = 1080 + p.velocityY * t + 0.5 * GRAVITY * t * t; // starts from bottom (1080)

        // Rotation
        const rot = t * p.rotation * 0.03;
        // 3D tumble effect
        const scaleY = Math.cos(t * 0.15 + i);

        // Fade in on first 4 frames, fade as it slows down
        const op = interpolate(t, [0, 4], [0, 0.95], EC);

        // Off-screen check
        if (y > 1120 || y < -40 || x < -40 || x > 1960) return null;

        const w = p.size;
        const h = p.shape === "rect" ? p.size * p.aspectRatio : p.size;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : 2,
              transform: `rotate(${rot}deg) scaleY(${scaleY})`,
              opacity: op,
            }}
          />
        );
      })}
    </div>
  );
};
