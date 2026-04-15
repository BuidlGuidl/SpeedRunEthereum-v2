import React from "react";
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  Easing,
  Img,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { colors, fonts } from "./theme";

const { fontFamily: serifFont } = loadFont();

// ── Source assets ────────────────────────────────────────
const RAW_VIDEO = staticFile("foundry-version-2.mp4");

// ── Video specs ─────────────────────────────────────────
// The new video is relatively short. We set a conservative fixed duration of 9 seconds.
// If the video is shorter, Remotion holds the final frame automatically, which works perfectly under our Outro CTA.
const FPS = 30;
export const FOUNDRY_V2_TOTAL_DURATION = 9 * FPS; // 270 frames (9 seconds total)

const EC = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ── Text timeline (composition frames) ──────────────────
const TEXT = {
  // "Foundry has joined the game"
  // Start second 3
  T3_IN: 3 * FPS, // frame 90
  T3_OUT: 5.5 * FPS, // frame 165

  // Outro CTA at the end of the video sequence
  OUTRO_IN: 6 * FPS, // frame 180
};

// ── Animated text overlay component ─────────────────────
const TextOverlay: React.FC<{
  text: string;
  inFrame: number;
  outFrame: number;
  fontSize?: number;
  yPosition?: number; // % from top
  isOutro?: boolean;
}> = ({ text, inFrame, outFrame, fontSize = 64, yPosition = 15, isOutro }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInDur = 20;
  const fadeOutDur = 15;

  const opacity = interpolate(
    frame,
    [inFrame, inFrame + fadeInDur, outFrame - fadeOutDur, outFrame],
    [0, 1, 1, 0],
    EC,
  );

  if (opacity <= 0) return null;

  // Spring entrance
  const s = spring({
    frame: Math.max(0, frame - inFrame),
    fps,
    config: { damping: 22, mass: 0.9 },
  });

  const translateY = interpolate(s, [0, 1], [25, 0]);
  const scale = interpolate(s, [0, 1], [0.92, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `${yPosition}%`,
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
          opacity,
          textAlign: "center",
          maxWidth: "85%",
        }}
      >
        {/* Dark backdrop for readability */}
        <div
          style={{
            background: isOutro
              ? "rgba(10, 10, 18, 0.88)"
              : "rgba(10, 10, 18, 0.75)",
            backdropFilter: "blur(12px)",
            padding: isOutro ? "48px 72px" : "24px 56px",
            borderRadius: isOutro ? 24 : 100,
            border: "1px solid rgba(103, 221, 222, 0.2)",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4)",
          }}
        >
          <h2
            style={{
              fontFamily: isOutro ? serifFont : fonts.heading,
              fontSize,
              fontWeight: 800,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </h2>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Outro CTA ──────────────────────────────────────────
const OutroCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inFrame = TEXT.OUTRO_IN;

  const opacity = interpolate(
    frame,
    [inFrame, inFrame + 30],
    [0, 1],
    EC,
  );

  if (opacity <= 0) return null;

  const s = spring({
    frame: Math.max(0, frame - inFrame),
    fps,
    config: { damping: 20, mass: 1 },
  });

  const scale = interpolate(s, [0, 1], [0.88, 1]);

  const subOp = interpolate(
    frame,
    [inFrame + 20, inFrame + 40],
    [0, 1],
    EC,
  );
  const subY = interpolate(
    frame,
    [inFrame + 20, inFrame + 40],
    [12, 0],
    { ...EC, easing: Easing.out(Easing.cubic) },
  );

  const urlOp = interpolate(
    frame,
    [inFrame + 35, inFrame + 50],
    [0, 1],
    EC,
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            background: "rgba(10, 10, 18, 0.9)",
            backdropFilter: "blur(16px)",
            padding: "36px 72px",
            borderRadius: 24,
            border: "1px solid rgba(103, 221, 222, 0.25)",
            boxShadow: "0 32px 80px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h1
            style={{
              fontFamily: serifFont,
              fontSize: 108,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Speedrun Ethereum
          </h1>
          <p
            style={{
              fontFamily: fonts.heading,
              fontSize: 54,
              fontWeight: 600,
              color: colors.accent,
              margin: "16px 0 0 0",
              opacity: subOp,
              transform: `translateY(${subY}px)`,
            }}
          >
            Now with Hardhat & Foundry
          </p>
        </div>

        <div
          style={{
            opacity: urlOp,
            background: colors.primary,
            padding: "16px 56px",
            borderRadius: 100,
            boxShadow: "0 8px 32px rgba(8, 132, 132, 0.4)",
          }}
        >
          <span
            style={{
              fontFamily: fonts.heading,
              fontSize: 42,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.02em",
            }}
          >
            speedrunethereum.com
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ────────────────────────────────────
export const FoundryAnnouncementV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dim the video during outro CTA for contrasting text
  const videoDim = interpolate(
    frame,
    [TEXT.OUTRO_IN - 10, TEXT.OUTRO_IN + 15],
    [1, 0.35],
    EC,
  );

  return (
    <AbsoluteFill style={{ background: "#0a0a12" }}>
      {/* ═══ VIDEO LAYER ═══ */}
      <Sequence from={0} durationInFrames={FOUNDRY_V2_TOTAL_DURATION} premountFor={fps}>
        <AbsoluteFill
          style={{
            opacity: videoDim,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              imageRendering: "pixelated" as const,
              // NO color filtering added!
            }}
          >
            <Sequence from={0} layout="none">
              <OffthreadVideo
                src={RAW_VIDEO}
                /* Removing muted property so the original SOUND from the video plays! */
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Sequence>

            {/* ── Seamless Watermark Mask ──
                We mirror the bottom-left ground pixel art and overlay it
                over the bottom-right text, blending the edges softly.
            */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 260,
                height: 100,
                overflow: "hidden",
                WebkitMaskImage:
                  "radial-gradient(ellipse at bottom right, black 50%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse at bottom right, black 50%, transparent 100%)",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 1920,
                  height: 1080,
                  transform: "scaleX(-1)",
                }}
              >
                <Sequence from={0} layout="none">
                  <OffthreadVideo
                    src={RAW_VIDEO}
                    muted // the mask shouldn't duplicate audio
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Sequence>
              </div>
            </div>

            {/* ── Frozen Character Overlay via PNG ──
                We use the exact cropped PNG you provided to fake the frozen character perfectly.
                Adjust the `left` and `bottom` pixels to nudge him into the exact spot in your Studio!
            */}
            {frame >= 120 && (
              <Img
                src={staticFile("builder-fronzen2.png")}
                style={{
                  position: "absolute",
                  width: 198,    // Exact width of the crop
                  height: 357,   // Exact height of the crop
                  left: 180,     // ⬅️➡️ Nudge this value to move him horizontally
                  bottom: 95,    // ⬇️⬆️ Nudge this value to move him vertically
                  zIndex: 3,
                }}
              />
            )}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ TEXT OVERLAYS ═══ */}
      <TextOverlay
        text="Foundry has joined the game"
        inFrame={TEXT.T3_IN}
        outFrame={TEXT.T3_OUT}
        fontSize={68}
        yPosition={16}
      />

      {/* ═══ OUTRO CTA ═══ */}
      <OutroCTA />
    </AbsoluteFill>
  );
};
