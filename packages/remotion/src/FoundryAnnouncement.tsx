import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { colors, fonts } from "./theme";

const { fontFamily: serifFont } = loadFont();

// ── Source assets ────────────────────────────────────────
const RAW_VIDEO = staticFile("raw-video.mp4");
const MUSIC = staticFile("build-prompts-8bit-music.mp3");

// ── Video specs ─────────────────────────────────────────
// Raw video: ~21.64s at ~24fps, 1280×720
// Composition: 30fps, 1920×1080
const RAW_VIDEO_DURATION_SEC = 21.64;
const FPS = 30;

const CROP_START_SEC = 14.14;
const CROP_START_FRAMES = Math.round(CROP_START_SEC * FPS); // 424 frames removed

// Extra frames for intro fade-in and outro hold
const INTRO_PAD = 0; // Starts instantly
const OUTRO_PAD = 60; // 2s hold on final CTA after video ends

const REMAINING_RAW_FRAMES =
  Math.ceil(RAW_VIDEO_DURATION_SEC * FPS) - CROP_START_FRAMES; // 650 - 424 = 226 frames ≈ 7.5s

export const FOUNDRY_TOTAL_DURATION =
  INTRO_PAD + REMAINING_RAW_FRAMES + OUTRO_PAD;
// ≈ 0 + 226 + 60 = 286 frames ≈ 9.5 seconds

const EC = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ── Color correction ────────────────────────────────────
// We are only playing the final segment (the blue-shifted house-building sequence).
// So we apply the blue-fix filter globally.
const COLOR_FILTER =
  "hue-rotate(-16deg) saturate(1.15) brightness(1.12) contrast(0.98)";

// ── Text timeline (composition frames) ──────────────────
const TEXT = {
  // "Foundry has joined the game"
  // Starts quickly after the video fades in
  T3_IN: INTRO_PAD + 10, // frame 10 (~0.3s in)
  T3_OUT: INTRO_PAD + 130, // frame 130 (~4.3s in)

  // Outro CTA at the end of the video
  // Overlaps the last ~2.5s of the pixel art video to maintain the cinematic transition
  OUTRO_IN: INTRO_PAD + REMAINING_RAW_FRAMES - 75, // frame 0 + 226 - 75 = 151
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

// ── Outro CTA (more elaborate — matches SRE style) ─────
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

  // Subtitle staggers in
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

  // URL staggers last
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
        {/* Main title pill */}
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

        {/* URL badge */}
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
export const FoundryAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dim the video during outro CTA for contrast
  const videoDim = interpolate(
    frame,
    [TEXT.OUTRO_IN - 10, TEXT.OUTRO_IN + 15],
    [1, 0.35],
    EC,
  );

  return (
    <AbsoluteFill style={{ background: "#0a0a12" }}>
      {/* ═══ MUSIC ═══ */}
      <Audio
        src={MUSIC}
        volume={(f) => {
          // Fade in over 1s, sustain, fade out over last 1.5s
          const totalFrames = FOUNDRY_TOTAL_DURATION;
          const fadeInEnd = 1 * fps;
          const fadeOutStart = totalFrames - 1.5 * fps;

          const volIn = interpolate(f, [0, fadeInEnd], [0, 1], EC);
          const volOut = interpolate(
            f,
            [fadeOutStart, totalFrames],
            [1, 0],
            EC,
          );
          return Math.min(volIn, volOut) * 0.22;
        }}
      />

      {/* ═══ VIDEO LAYER ═══ */}
      <Sequence from={0} durationInFrames={FOUNDRY_TOTAL_DURATION} premountFor={fps}>
        <AbsoluteFill
          style={{
            opacity: videoDim,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              filter: COLOR_FILTER,
              imageRendering: "pixelated" as const,
            }}
          >
            <Sequence from={0} layout="none">
              <OffthreadVideo
                src={RAW_VIDEO}
                muted
                startFrom={CROP_START_FRAMES}
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
                    muted
                    startFrom={CROP_START_FRAMES}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Sequence>
              </div>
            </div>

          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══ TEXT OVERLAYS ═══ */}

      {/* "Foundry has joined the game" */}
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
