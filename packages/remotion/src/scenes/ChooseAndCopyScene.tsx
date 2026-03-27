import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { colors } from "../theme";
import { AnimatedCursor } from "../components/AnimatedCursor";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

/**
 * Scene 1+2 — Intro Hook + Choose & Copy
 *
 * Phase 0: Hook text overlay
 * Phase 1: Full Build Prompts page scrolls up in 3D perspective
 * Phase 2: Cursor clicks View → crossfade to detail → clicks Copy
 *
 * Timeline (370 frames ≈ 12.3s at 30fps):
 *   0–80    : Hook text appears and holds
 *   70–170  : 3D scroll-in (tilted, scrolling up, text fades out)
 *   170–195 : Settle flat, minor breathing
 *   195–210 : Cursor moves to View button
 *   210     : Click View + pulse
 *   220–235 : Crossfade to detail modal
 *   235–270 : Cursor moves to Copy button
 *   270     : Click Copy → Copied overlay
 *   305–350 : Exit zoom/fade
 */

// Video viewport
const VIDEO_W = 1920;
const VIDEO_H = 1080;

// Screenshot window (centered in video)
const CONTAINER_W = 1600;
const CONTAINER_H = 900;
const OFFSET_X = (VIDEO_W - CONTAINER_W) / 2; // 160
const OFFSET_Y = (VIDEO_H - CONTAINER_H) / 2; // 90

// ─── Full-page screenshot (build-prompts-full-page.png) ───
// This is a 1920×2001 screenshot. We render it at CONTAINER_W (1600px) wide
// inside the overflow:hidden container. The page content appears slightly
// scaled down (1600/1920 = 0.833x). After scrolling to the top, we can
// see the header + first 2 rows of cards in the 900px viewport.
const FULL_PAGE_W = 1920;
const FULL_PAGE_H = 2001;
const FP_RENDER_SCALE = CONTAINER_W / FULL_PAGE_W; // 0.8333
const FP_RENDERED_H = FULL_PAGE_H * FP_RENDER_SCALE; // ~1668

// ─── Detail screenshot (new-build-prompts-page-detail.png, 1899×951) ───
const DETAIL_IMG_W = 1899;
const DETAIL_IMG_H = 951;
const DETAIL_SCALE = Math.max(CONTAINER_W / DETAIL_IMG_W, CONTAINER_H / DETAIL_IMG_H);
const DETAIL_CROP_X = (DETAIL_IMG_W * DETAIL_SCALE - CONTAINER_W) / 2;

/**
 * Maps a pixel coordinate from the full-page screenshot (1920×2001)
 * to video coordinates, accounting for render scale, scroll, and zoom.
 */
function fullPageToVideo(
  imgX: number,
  imgY: number,
  scrollOffset: number,
  zoom: number,
) {
  // Position in the rendered (pre-zoom) image
  const renderX = imgX * FP_RENDER_SCALE;
  const renderY = imgY * FP_RENDER_SCALE + scrollOffset;
  // Apply zoom from top-center origin
  const zoomedX = (renderX - CONTAINER_W / 2) * zoom + CONTAINER_W / 2;
  const zoomedY = renderY * zoom;
  return {
    x: Math.round(OFFSET_X + zoomedX),
    y: Math.round(OFFSET_Y + zoomedY),
  };
}

/** Maps a pixel from the detail screenshot (1899×951) to video coords */
function detailToVideo(imgX: number, imgY: number) {
  return {
    x: Math.round(OFFSET_X + imgX * DETAIL_SCALE - DETAIL_CROP_X),
    y: Math.round(OFFSET_Y + imgY * DETAIL_SCALE),
  };
}

// Button coordinates (precisely measured from the original screenshots)
// View button on first card in full-page image (1920×2001)
const VIEW_BTN_IMG = { x: 517, y: 651 };
// Copy button in detail image (1899×951)
const COPY_BTN_VIDEO = detailToVideo(950, 833);

export const ChooseAndCopyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ============================================================
  // PHASE 0: Hook text overlay
  // ============================================================
  const textOpacity = interpolate(frame, [0, 15, 80, 110], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ============================================================
  // Floating background particles
  // ============================================================
  const particles = Array.from({ length: 8 }, (_, i) => {
    const baseX = (i * 240 + 80) % VIDEO_W;
    const baseY = 80 + (i * 170) % 750;
    const offsetY = Math.sin(frame * 0.03 + i * 1.2) * 25;
    const size = 6 + (i % 4) * 5;
    return { x: baseX, y: baseY + offsetY, size };
  });

  // ============================================================
  // PHASE 1: 3D Scroll-In
  // ============================================================
  const maxScroll = FP_RENDERED_H - CONTAINER_H; // ~768

  const scrollStart = 70;
  const scrollEnd = 170;

  // 3D tilt → flat
  const rotateX = interpolate(frame, [scrollStart, scrollEnd], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Container scale during fly-in
  const perspScale = interpolate(frame, [scrollStart, scrollEnd], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Scroll: bottom → top
  const scrollY = interpolate(frame, [scrollStart, scrollEnd], [-maxScroll, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t: number) => t * t * (3 - 2 * t),
  });

  // Entrance opacity
  const screenshotOpacity = interpolate(frame, [scrollStart, scrollStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ============================================================
  // PHASE 2: Cursor interactions on full-page, then detail
  // ============================================================

  // No separate zoom-in — the view stays flat after the scroll,
  // keeping the full-page screenshot visible without any flicker.
  // The crossfade to the detail only happens on the View click.

  // View button position (accounting for scroll at rest, no extra zoom)
  const viewBtn = fullPageToVideo(VIEW_BTN_IMG.x, VIEW_BTN_IMG.y, 0, 1);

  // View button click
  const viewClickFrame = 210;
  const viewClicked = frame >= viewClickFrame;
  const viewClickProgress = viewClicked
    ? interpolate(frame, [viewClickFrame, viewClickFrame + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Crossfade: full-page → detail (on View click)
  const crossfadeStart = 220;
  const crossfadeDuration = 15;
  const detailOpacity = interpolate(
    frame,
    [crossfadeStart, crossfadeStart + crossfadeDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Copy button click (on detail image)
  const copyClickFrame = 270;
  const copyClicked = frame >= copyClickFrame;
  const copiedOpacity = interpolate(
    frame,
    [copyClickFrame, copyClickFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Exit zoom
  const exitStart = 305;
  const exitZoom = interpolate(frame, [exitStart, exitStart + 40], [1, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const exitOpacity = interpolate(
    frame,
    [exitStart + 10, exitStart + 40],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Cursor keyframes
  const cursorPositions = [
    { x: 700, y: 300, frame: 185 },
    { x: viewBtn.x, y: viewBtn.y, frame: 205 },
    { x: viewBtn.x, y: viewBtn.y, frame: viewClickFrame },
    { x: COPY_BTN_VIDEO.x, y: COPY_BTN_VIDEO.y, frame: 258 },
    { x: COPY_BTN_VIDEO.x, y: COPY_BTN_VIDEO.y, frame: copyClickFrame },
  ];

  // Copied overlay position (in container space on detail image)
  const copiedBtnRelX = 950 * DETAIL_SCALE - DETAIL_CROP_X;
  const copiedBtnRelY = 833 * DETAIL_SCALE;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        fontFamily,
        overflow: "hidden",
        perspective: 2000,
        transform: `scale(${exitZoom})`,
        opacity: exitOpacity,
        transformOrigin: "50% 60%",
      }}
    >
      {/* Floating background particles */}
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
              fontSize: 92,
              fontWeight: 900,
              color: colors.textPrimary,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              textShadow: "0 4px 40px rgba(255,255,255,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            Ship Ethereum apps faster
            <br />
            with{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI build prompts
            </span>
          </div>
        </div>
      )}

      {/* Screenshot container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `
            translate(-50%, -50%)
            rotateX(${rotateX}deg)
            scale(${perspScale})
          `,
          transformOrigin: "center bottom",
          opacity: screenshotOpacity,
          width: CONTAINER_W,
          height: CONTAINER_H,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `
            0 30px 90px rgba(0,0,0,0.15),
            0 0 40px ${colors.accentGlow}
          `,
          border: `2px solid ${colors.accent}44`,
          zIndex: 10,
        }}
      >
        {/* Full-page screenshot */}
        <Img
          src={staticFile("build-prompts-full-page.png")}
          style={{
            width: CONTAINER_W,
            display: "block",
            transform: `translateY(${scrollY}px)`,
          }}
        />

        {/* Detail modal screenshot (fades in on View click) */}
        {frame >= crossfadeStart - 5 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: detailOpacity,
            }}
          >
            <Img
              src={staticFile("new-build-prompts-page-detail.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Subtle click ring on View button */}
        {viewClicked && viewClickProgress < 1 && (
          <div
            style={{
              position: "absolute",
              left: viewBtn.x - OFFSET_X - 40,
              top: viewBtn.y - OFFSET_Y - 14,
              width: 80,
              height: 28,
              borderRadius: 14,
              background: `rgba(103, 221, 222, ${0.25 * (1 - viewClickProgress)})`,
              border: `2px solid rgba(103, 221, 222, ${0.7 * (1 - viewClickProgress)})`,
              transform: `scale(${1 + viewClickProgress * 0.3})`,
              pointerEvents: "none",
              zIndex: 25,
            }}
          />
        )}

        {/* "Copied!" text swap — matches original button style */}
        {copyClicked && (
          <div
            style={{
              position: "absolute",
              left: copiedBtnRelX - 55,
              top: copiedBtnRelY - 20,
              height: 32,
              paddingLeft: 12,
              paddingRight: 16,
              borderRadius: 8,
              background: "#088484",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: copiedOpacity,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7.5L5.5 10L11 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Copied!
            </span>
          </div>
        )}
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

      {/* Cursor (zIndex must be above the container's zIndex:10) */}
      {frame >= 185 && frame < exitStart && (
        <div style={{ position: "absolute", inset: 0, zIndex: 30, pointerEvents: "none" }}>
          <AnimatedCursor
            positions={cursorPositions}
            clickAtEnd
            color={colors.primary}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
