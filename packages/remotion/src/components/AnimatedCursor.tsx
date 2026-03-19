import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

type AnimatedCursorProps = {
  positions: Array<{ x: number; y: number; frame: number }>;
  size?: number;
  color?: string;
  clickAtEnd?: boolean;
};

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  positions,
  size = 20,
  color = "#ffffff",
  clickAtEnd = false,
}) => {
  const frame = useCurrentFrame();

  if (positions.length === 0) return null;

  // Find current segment
  let x = positions[0].x;
  let y = positions[0].y;

  for (let i = 0; i < positions.length - 1; i++) {
    const from = positions[i];
    const to = positions[i + 1];
    if (frame >= from.frame && frame <= to.frame) {
      x = interpolate(frame, [from.frame, to.frame], [from.x, to.x], {
        easing: Easing.inOut(Easing.quad),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      y = interpolate(frame, [from.frame, to.frame], [from.y, to.y], {
        easing: Easing.inOut(Easing.quad),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      break;
    }
    if (frame > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  // Click ripple effect at end
  const lastPos = positions[positions.length - 1];
  const clickFrame = lastPos.frame;
  const showClick = clickAtEnd && frame >= clickFrame && frame < clickFrame + 15;
  const rippleScale = showClick
    ? interpolate(frame, [clickFrame, clickFrame + 15], [0, 2.5], {
        extrapolateRight: "clamp",
      })
    : 0;
  const rippleOpacity = showClick
    ? interpolate(frame, [clickFrame, clickFrame + 15], [0.6, 0], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <>
      {showClick && (
        <div
          style={{
            position: "absolute",
            left: x - 15,
            top: y - 15,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
            pointerEvents: "none",
          }}
        />
      )}
      <svg
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size * 1.3,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          pointerEvents: "none",
        }}
        viewBox="0 0 24 32"
        fill="none"
      >
        <path
          d="M5 2L5 24L10 19L15 28L19 26L14 17L21 17L5 2Z"
          fill={color}
          stroke="#000"
          strokeWidth="1.5"
        />
      </svg>
    </>
  );
};
