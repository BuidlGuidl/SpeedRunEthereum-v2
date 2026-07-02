import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { AnimatedCursor } from "./components/AnimatedCursor";
import { PixelGirlSprite } from "./components/PixelGirlSprite";
import { CHIP_LABELS, WebChatMsg, WebChatPanel, WebInputAction } from "./components/WebChatPanel";
import { colors, fonts } from "./theme";

// V3 — Gondor-informed re-edit of the V2 live demo. See:
// web-ai-assistant-launch-video-script-v3.md + web-ai-assistant-launch-enhancement-proposals.md
// (the proposals doc supersedes the script on chapter count and interstitial copy).
// Key moves vs V2: problem beat before the reveal, full-screen editorial
// interstitials instead of dark overlay cards, floating-panel framing for the
// quiz chapter, new local-setup chapter, orbiting-icons handoff beat, proof
// beat, minimal end card, blur-push transitions, and no fully static frames.

const { fontFamily: serifFont } = loadFont();
const CLICK_SFX = staticFile("sfx/confirmation.ogg");
const TAP_SFX = staticFile("mechanical-keyboard.mp3");
const EC = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ── Timeline (frames @ 30fps) ────────────────────────────
// Reading rule unchanged from V2: 60-80 frames after each AI message finishes
// streaming (except A1, which flows into A1B).
const T = {
  // ACT I — hook + problem
  HOOK_L1: 20,
  HOOK_L2: 58,
  HOOK_OUT: 140,
  PROB_IN: 152,
  PROB_WORDS: 182,
  PROB_OUT: 300,

  // ACT II — reveal
  PAGE_IN: 312,
  FAB_MOVE: 350,
  FAB_CLICK: 382,
  PANEL_IN: 388,
  ZOOM_IN: 415,

  // ACT III — demo chapters, each opened by an editorial interstitial
  INT1: 472,
  INT1_END: 538,
  CHIP_MOVE: 550,
  CHIP_CLICK: 578,
  U1: 584,
  A1: 608, // ~295 chars @2.5 → ends ~726
  A1B: 760, // gotchas coda, ~228 chars @2.5 → ends ~851

  INT2: 924,
  INT2_END: 990,
  A2: 1000, // ~80 chars @2.2 → ~1036
  U2_TYPE: 1074,
  U2_SEND: 1096,
  U2: 1101,
  A3: 1114, // ~128 chars @2.2 → ~1172
  U3_TYPE: 1218,
  U3_SEND: 1272,
  U3: 1277,
  A4: 1290, // ~209 chars @2.2 → ~1385

  INT3: 1456,
  INT3_END: 1522,
  U4_TYPE: 1534,
  U4_SEND: 1580,
  U4: 1585,
  A5: 1598, // ~277 chars @2.5 → ~1709

  INT4: 1782,
  INT4_END: 1848,
  U5_TYPE: 1860,
  U5_SEND: 1898,
  U5: 1903,
  A6: 1917, // ~224 chars @2.3 → ~2014

  INT5: 2090,
  INT5_END: 2156,
  ZOOM_OUT: 2120,
  A7: 2168, // ~141 chars @2.2 → ~2232
  PAGE_FADE: 2284,
  ORBIT: 2306,
  SETTLE: 2376,
  ORBIT_OUT: 2436,

  // ACT IV — proof + CTA
  PROOF: 2448,
  PROOF_END: 2560,
  OUTRO: 2560,
  ENDCARD: 2725,
  END: 2865,
};
export const WEB_AI_ASSISTANT_V3_TOTAL_DURATION = T.END;

// Floating-panel chapter window: the panel detaches from the page while the
// opaque interstitial 02 covers the frame and returns under interstitial 03.
const FLOAT_START = T.INT2 + 33;
const FLOAT_END = T.INT3 + 33;

// ── Screenshot geometry (as V2) ─────────────────────────
const SHOT_Y = 82;
const SHOT_H = 916;
const PANEL_W = 440;
const FAB = { x: 1857, y: 798 };
const CHIP1 = { x: 1700, y: 396 };

// ── Camera ──────────────────────────────────────────────
// Right-bottom anchored zoom as V2, but with a per-chapter slow push so no
// hold is ever fully static (P5), and a tighter 1.6x for the refusal chapter.
function getCameraScale(f: number): number {
  if (f < T.ZOOM_IN) return 1;
  if (f < FLOAT_START) {
    const zoomIn = interpolate(f, [T.ZOOM_IN, T.ZOOM_IN + 45], [0, 1], {
      ...EC,
      easing: Easing.inOut(Easing.cubic),
    });
    const push = interpolate(f, [T.ZOOM_IN + 45, T.INT2], [0, 0.03], EC);
    return 1 + 0.5 * zoomIn + push;
  }
  if (f < FLOAT_END) return 1.6; // page hidden; preset for chapter 03
  if (f < T.INT4) {
    return 1.6 + interpolate(f, [FLOAT_END, T.INT4], [0, 0.03], EC);
  }
  if (f < T.ZOOM_OUT) {
    // relax to 1.5 while covered by interstitial 04, then push through ch04
    const relax = interpolate(f, [T.INT4 + 8, T.INT4 + 48], [1.63, 1.5], {
      ...EC,
      easing: Easing.inOut(Easing.cubic),
    });
    const push = interpolate(f, [T.INT4_END, T.INT5], [0, 0.03], EC);
    return relax + push;
  }
  return interpolate(f, [T.ZOOM_OUT, T.ZOOM_OUT + 50], [1.53, 1], {
    ...EC,
    easing: Easing.inOut(Easing.cubic),
  });
}

// Blur-push transition styles (P8): enter = blur 10→0 + scale 1.04→1 + fade
// in; exit reversed. Never plain crossfades between scenes.
function blurPushIn(f: number, start: number, dur = 16) {
  const t = interpolate(f, [start, start + dur], [0, 1], { ...EC, easing: Easing.out(Easing.cubic) });
  return { opacity: t, blur: (1 - t) * 10, scale: 1.04 - t * 0.04 };
}
function blurPushOut(f: number, end: number, dur = 16) {
  const t = interpolate(f, [end - dur, end], [0, 1], { ...EC, easing: Easing.in(Easing.cubic) });
  return { opacity: 1 - t, blur: t * 10, scale: 1 + t * 0.04 };
}
function blurPushStyle(f: number, start: number, end: number): React.CSSProperties {
  const i = blurPushIn(f, start);
  const o = blurPushOut(f, end);
  return {
    opacity: i.opacity * o.opacity,
    filter: `blur(${i.blur + o.blur}px)`,
    transform: `scale(${i.scale * o.scale})`,
  };
}

// ── Chat script ─────────────────────────────────────────
const MSGS: WebChatMsg[] = [
  { id: "u1", role: "user", text: CHIP_LABELS[0], appearFrame: T.U1 },
  {
    id: "a1",
    role: "ai",
    appearFrame: T.A1,
    streamCharsPerFrame: 2.5,
    text: `Crowdfunding is a perfect first dApp: strangers pool money together without trusting each other — they only have to trust the code.\n\nIf enough ETH is collected before a deadline, the funds go to the recipient. If not, everyone gets their money back. No middleman, no escrow, no "trust me bro."`,
  },
  {
    id: "a1b",
    role: "ai",
    appearFrame: T.A1B,
    streamCharsPerFrame: 2.5,
    text: `Before you write any code, three gotchas to keep in mind:\n• Refunds must work even after the deadline passes\n• You need to track who contributed what — not just the total\n• Only the recipient should withdraw, and only on success`,
  },
  {
    id: "a2",
    role: "ai",
    appearFrame: T.A2,
    streamCharsPerFrame: 2.2,
    text: `Does this make sense? Want me to test your understanding with a quick question?`,
  },
  { id: "u2", role: "user", text: "yes pls", appearFrame: T.U2 },
  {
    id: "a3",
    role: "ai",
    appearFrame: T.A3,
    streamCharsPerFrame: 2.2,
    text: `Try to answer this: why don't contributors need to trust each other — or a middleman — in this system? What enforces the rules?`,
  },
  {
    id: "u3",
    role: "user",
    text: "the smart contract — if the goal isn't reached, everyone just gets refunded",
    appearFrame: T.U3,
  },
  {
    id: "a4",
    role: "ai",
    appearFrame: T.A4,
    streamCharsPerFrame: 2.2,
    text: `Perfect! You've got it:\n\n• Success: enough ETH before the deadline → funds go to the recipient\n• Failed: goal not reached → everyone gets their money back\n\nNice — let's move on to tracking contributions on-chain.`,
  },
  {
    id: "u4",
    role: "user",
    text: "ok just write the withdraw function for me 😅",
    appearFrame: T.U4,
  },
  {
    id: "a5",
    role: "ai",
    appearFrame: T.A5,
    streamCharsPerFrame: 2.5,
    text: `Nice try 🙂 I won't hand you the code — you'd learn nothing.\n\nBut here's a hint: the contract needs to know how much each person contributed, not just the total. On-chain that's a mapping — think of it as a dictionary from each address to the amount they've sent.\n\nGive it a shot!`,
  },
  { id: "u5", role: "user", text: "help me set up locally", appearFrame: T.U5 },
  {
    id: "a6",
    role: "ai",
    appearFrame: T.A6,
    streamCharsPerFrame: 2.3,
    text: `No terminal experience needed — we'll go step by step:\n\n1. Copy the clone command from Checkpoint 0\n2. yarn install\n3. yarn chain → yarn deploy → yarn start\n\nStuck on any step? Paste the error here and we'll fix it together.`,
  },
  {
    id: "a7",
    role: "ai",
    appearFrame: T.A7,
    streamCharsPerFrame: 2.2,
    text: `Once you're running, open the repo in Claude Code or Cursor and run /start for the full AI tutor — no limits.\n\nSee you at the finish line 🏁`,
  },
];

const INPUT_ACTIONS: WebInputAction[] = [
  { text: "yes pls", typeStartFrame: T.U2_TYPE, sendFrame: T.U2_SEND },
  {
    text: "the smart contract — if the goal isn't reached, everyone just gets refunded",
    typeStartFrame: T.U3_TYPE,
    sendFrame: T.U3_SEND,
  },
  { text: "ok just write the withdraw function for me 😅", typeStartFrame: T.U4_TYPE, sendFrame: T.U4_SEND },
  { text: "help me set up locally", typeStartFrame: T.U5_TYPE, sendFrame: T.U5_SEND },
];

const DOT_WINDOWS: Array<[number, number]> = [
  [T.U1 + 8, T.A1],
  [T.A1B - 14, T.A1B],
  [T.A2 - 14, T.A2],
  [T.U2 + 8, T.A3],
  [T.U3 + 8, T.A4],
  [T.U4 + 8, T.A5],
  [T.U5 + 8, T.A6],
  [T.A7 - 12, T.A7],
];

// ── Editorial interstitials (P1) ────────────────────────
type Word = { t: string; accent?: boolean };
const w = (text: string, accent = false): Word[] => text.split(" ").map(t => ({ t, accent }));

const INTERSTITIALS = [
  {
    num: "01",
    start: T.INT1,
    end: T.INT1_END,
    words: [...w("Know the"), ...w("gotchas", true), ...w("before you code")],
    sub: "Concepts and pitfalls, explained on the page",
    badge: "01 · know the gotchas",
    badgeUntil: T.INT2,
  },
  {
    num: "02",
    start: T.INT2,
    end: T.INT2_END,
    words: [...w("It checks it"), ...w("clicked", true)],
    sub: "Quick questions prove you really got it",
    badge: "02 · it checks it clicked",
    badgeUntil: T.INT3,
  },
  {
    num: "03",
    start: T.INT3,
    end: T.INT3_END,
    words: [...w("Hints,", true), ...w("never answers")],
    sub: "Guides you — never copy-paste solutions",
    badge: "03 · hints, never answers",
    badgeUntil: T.INT4,
  },
  {
    num: "04",
    start: T.INT4,
    end: T.INT4_END,
    words: [...w("It gets you"), ...w("running locally", true)],
    sub: "Step-by-step setup, no terminal fear",
    badge: "04 · running locally",
    badgeUntil: T.INT5,
  },
  {
    num: "05",
    start: T.INT5,
    end: T.INT5_END,
    words: [...w("Then go"), ...w("full tutor", true), ...w("in your IDE")],
    sub: "Open in Claude Code or Cursor, run /start",
    badge: "05 · full tutor in your IDE",
    badgeUntil: T.PAGE_FADE,
  },
];

// ── Shared: drifting particle motif (P8 continuity layer) ──
const Particles: React.FC<{ opacity?: number; parallax?: number }> = ({ opacity = 0.15, parallax = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const baseX = (i * 240 + 80) % 1920;
        const baseY = 80 + ((i * 170) % 750);
        const offsetY = Math.sin(frame * 0.03 * parallax + i * 1.2) * 25 * parallax;
        const sz = (6 + (i % 4) * 5) * parallax;
        return (
          <div
            key={`p-${i}`}
            style={{
              position: "absolute",
              left: baseX,
              top: baseY + offsetY,
              width: sz,
              height: sz,
              borderRadius: 2,
              background: i % 2 === 0 ? colors.accent : colors.primaryLight,
              opacity,
              zIndex: 0,
            }}
          />
        );
      })}
    </>
  );
};

// ── Shared: word-by-word reveal ─────────────────────────
const WordReveal: React.FC<{
  words: Word[];
  start: number;
  stagger?: number;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  accentColor?: string;
}> = ({
  words,
  start,
  stagger = 6,
  fontSize,
  fontFamily = serifFont,
  fontWeight = 700,
  color = colors.textPrimary,
  accentColor = colors.primary,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ textAlign: "center", lineHeight: 1.22 }}>
      {words.map((word, i) => {
        const wStart = start + i * stagger;
        const op = interpolate(frame, [wStart, wStart + 12], [0, 1], EC);
        const y = interpolate(frame, [wStart, wStart + 14], [8, 0], { ...EC, easing: Easing.out(Easing.cubic) });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily,
              fontSize,
              fontWeight,
              color: word.accent ? accentColor : color,
              opacity: op,
              transform: `translateY(${y}px)`,
              letterSpacing: "-0.02em",
              marginRight: fontSize * 0.26,
            }}
          >
            {word.t}
          </span>
        );
      })}
    </div>
  );
};

// ── Background ──────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 300, [0, 300], [0, 48], EC);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #f7feff 0%, ${colors.bgSecondary} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -60,
          backgroundImage:
            "linear-gradient(rgba(8,132,132,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(8,132,132,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.3,
          transform: `translateY(${drift}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── ACT I: hook (trimmed vs V2) ─────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= T.HOOK_OUT + 18) return null;

  const introFadeIn = interpolate(frame, [0, 12], [0, 1], EC);
  const out = blurPushOut(frame, T.HOOK_OUT + 18, 18);
  const spriteScale = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const titleOp = interpolate(frame, [16, 36], [0, 1], EC);
  const titleY = interpolate(frame, [16, 36], [15, 0], { ...EC, easing: Easing.out(Easing.cubic) });

  const line = (start: number) => ({
    opacity: interpolate(frame, [start, start + 26], [0, 1], EC),
    transform: `translateY(${interpolate(frame, [start, start + 36], [18, 0], { ...EC, easing: Easing.out(Easing.cubic) })}px)`,
    textAlign: "center" as const,
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        opacity: introFadeIn * out.opacity,
        filter: `blur(${out.blur}px)`,
        zIndex: 60,
      }}
    >
      <Particles />
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ transform: `scale(${spriteScale})`, marginBottom: 34 }}>
          <PixelGirlSprite size={230} />
        </div>
        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)` }}>
          <h1
            style={{
              fontFamily: serifFont,
              fontSize: 100,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            AI Teaching Assistant
          </h1>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={line(T.HOOK_L1)}>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 60,
              fontWeight: 800,
              margin: 0,
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Stuck reading a challenge <span style={{ color: colors.textMuted, fontStyle: "italic" }}>solo</span>?
          </h1>
        </div>
        <div style={line(T.HOOK_L2)}>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 40, fontWeight: 500, margin: 0, color: colors.textSecondary }}>
            Docs don&apos;t answer back.
          </h2>
        </div>
      </div>
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

// ── ACT I: problem beat (P6) ────────────────────────────
const ProblemBeat: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.PROB_IN || frame >= T.PROB_OUT + 18) return null;
  const style = blurPushStyle(frame, T.PROB_IN, T.PROB_OUT + 18);
  const artOp = interpolate(frame, [T.PROB_IN + 4, T.PROB_IN + 26], [0, 1], EC);
  const artY = interpolate(frame, [T.PROB_IN, T.PROB_IN + 40], [16, 0], { ...EC, easing: Easing.out(Easing.cubic) });
  const drift = Math.sin(frame * 0.025) * 5;

  return (
    <AbsoluteFill style={{ zIndex: 58 }}>
      <AbsoluteFill
        style={{
          ...style,
          background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Particles opacity={0.12} />
        <div style={{ opacity: artOp, transform: `translateY(${artY + drift}px)`, marginBottom: 54 }}>
          <Img
            src={staticFile("builder-fronzen.png")}
            style={{ height: 360, imageRendering: "pixelated", display: "block" }}
          />
        </div>
        <div style={{ maxWidth: 1400 }}>
          <WordReveal
            words={[
              ...w("Solidity docs on one screen."),
              ...w("The challenge on another."),
              ...w("Nobody to ask.", true),
            ]}
            start={T.PROB_WORDS}
            fontSize={58}
            fontFamily={fonts.heading}
            fontWeight={700}
            color={colors.textSecondary}
            accentColor={colors.textPrimary}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── ACT III: editorial interstitial card ────────────────
const Interstitial: React.FC<(typeof INTERSTITIALS)[number]> = ({ num, start, end, words, sub }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  const style = blurPushStyle(frame, start, end);
  const subOp = interpolate(frame, [start + 34, start + 48], [0, 1], EC);

  return (
    <AbsoluteFill style={{ zIndex: 55 }}>
      <AbsoluteFill
        style={{
          ...style,
          background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Particles opacity={0.15} />
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 25,
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: 4,
            marginBottom: 26,
            opacity: interpolate(frame, [start + 6, start + 20], [0, 1], EC),
          }}
        >
          {num}
        </div>
        <div style={{ maxWidth: 1560 }}>
          <WordReveal words={words} start={start + 10} fontSize={92} />
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: fonts.body,
            fontSize: 27,
            fontWeight: 600,
            color: colors.textSecondary,
            opacity: subOp,
          }}
        >
          {sub}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Persistent chapter badge (top-left during chapters) ──
const ChapterBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const active = INTERSTITIALS.find(it => frame >= it.end - 8 && frame < it.badgeUntil);
  if (!active) return null;
  const op =
    interpolate(frame, [active.end - 8, active.end + 8], [0, 1], EC) *
    interpolate(frame, [active.badgeUntil - 12, active.badgeUntil], [1, 0], EC);

  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        left: 32,
        zIndex: 40,
        opacity: op,
        display: "flex",
        alignItems: "center",
        background: "rgba(10,10,18,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(103,221,222,0.25)",
        borderRadius: 14,
        padding: "10px 22px",
        fontFamily: fonts.heading,
        fontSize: 24,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "-0.01em",
      }}
    >
      {active.badge}
    </div>
  );
};

// ── ACT II/III: the product shot (page + drawer) ────────
const ProductShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inFloat = frame >= FLOAT_START && frame < FLOAT_END;
  if (frame < T.PAGE_IN || inFloat || frame >= T.PAGE_FADE + 22) return null;

  const enter = blurPushIn(frame, T.PAGE_IN, 18);
  const fadeOut = interpolate(frame, [T.PAGE_FADE, T.PAGE_FADE + 20], [1, 0], EC);
  const pageY = interpolate(
    spring({ frame: Math.max(0, frame - T.PAGE_IN), fps, config: { damping: 22, mass: 1.1 } }),
    [0, 1],
    [40, 0],
  );
  const scale = getCameraScale(frame);
  const dim = scale > 1.05 ? 0.94 : 1;

  const panelSlide = spring({
    frame: Math.max(0, frame - T.PANEL_IN),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.9 },
  });
  const panelX = interpolate(panelSlide, [0, 1], [PANEL_W + 20, 0]);
  const panelOpen = frame >= T.PANEL_IN;

  const fabPulse = frame >= T.PAGE_IN + 25 && frame < T.FAB_CLICK + 8;
  const pulseT = ((frame - T.PAGE_IN) % 40) / 40;

  return (
    <AbsoluteFill style={{ opacity: enter.opacity * fadeOut, filter: `blur(${enter.blur}px)` }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: SHOT_Y,
          width: 1920,
          height: SHOT_H,
          transform: `translateY(${pageY}px) scale(${scale * enter.scale})`,
          transformOrigin: "100% 90%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: `drop-shadow(0 30px 60px rgba(2,98,98,0.18)) brightness(${dim})`,
          }}
        >
          <Img
            src={staticFile("web-ai-assistant-sshots/ss3.png")}
            style={{ width: 1920, height: SHOT_H, display: "block" }}
          />
        </div>

        {fabPulse && (
          <div
            style={{
              position: "absolute",
              left: FAB.x - 32,
              top: FAB.y - 32,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: `3px solid ${colors.primary}`,
              transform: `scale(${1 + pulseT * 0.8})`,
              opacity: (1 - pulseT) * 0.7,
              pointerEvents: "none",
            }}
          />
        )}

        {panelOpen && (
          <div style={{ position: "absolute", right: 0, top: 0, transform: `translateX(${panelX}px)` }}>
            <WebChatPanel
              messages={MSGS}
              inputActions={INPUT_ACTIONS}
              dotWindows={DOT_WINDOWS}
              chipClickFrame={T.CHIP_CLICK}
              width={PANEL_W}
              height={SHOT_H}
            />
          </div>
        )}

        <Sequence from={T.FAB_MOVE} durationInFrames={T.FAB_CLICK - T.FAB_MOVE + 16} layout="none">
          <AnimatedCursor
            positions={[
              { x: 1520, y: 620, frame: 0 },
              { x: FAB.x - 6, y: FAB.y - 8, frame: T.FAB_CLICK - T.FAB_MOVE },
            ]}
            clickAtEnd
            size={20}
            color={colors.primary}
          />
        </Sequence>

        <Sequence from={T.CHIP_MOVE} durationInFrames={T.CHIP_CLICK - T.CHIP_MOVE + 16} layout="none">
          <AnimatedCursor
            positions={[
              { x: 1620, y: 700, frame: 0 },
              { x: CHIP1.x, y: CHIP1.y, frame: T.CHIP_CLICK - T.CHIP_MOVE },
            ]}
            clickAtEnd
            size={16}
            color={colors.primary}
          />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

// ── ACT III: floating-panel framing for the quiz chapter (P4) ──
const FloatingPanel: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < FLOAT_START || frame >= FLOAT_END) return null;
  // Entry/exit stay hidden behind the opaque interstitials; a soft settle-in
  // still plays for the frames where the card is already lifting.
  const enter = blurPushIn(frame, FLOAT_START, 14);
  const exit = blurPushOut(frame, FLOAT_END, 14);
  const push = interpolate(frame, [FLOAT_START, FLOAT_END], [1.28, 1.31], EC); // never static (P5)

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 20 }}>
      <Particles opacity={0.18} />
      <Particles opacity={0.1} parallax={0.55} />
      <div
        style={{
          opacity: enter.opacity * exit.opacity,
          filter: `blur(${enter.blur + exit.blur}px)`,
          transform: `scale(${push * enter.scale * exit.scale})`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(2,98,98,0.28)",
        }}
      >
        <WebChatPanel
          messages={MSGS}
          inputActions={INPUT_ACTIONS}
          dotWindows={DOT_WINDOWS}
          chipClickFrame={T.CHIP_CLICK}
          width={PANEL_W}
          height={620}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── ACT III: orbiting-icons handoff beat (ch05) ─────────
const OrbitGlyph: React.FC<{ kind: "browser" | "terminal" | "claude" | "cursor" }> = ({ kind }) => {
  const s = { stroke: "#fff", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  if (kind === "browser") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" {...s} />
        <path d="M3 12h18M12 3c2.8 2.4 4 5.4 4 9s-1.2 6.6-4 9c-2.8-2.4-4-5.4-4-9s1.2-6.6 4-9Z" {...s} />
      </svg>
    );
  }
  if (kind === "terminal") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <rect x="2.5" y="4" width="19" height="16" rx="2.5" {...s} />
        <path d="m6.5 9 3.5 3-3.5 3M12.5 15.5H17" {...s} />
      </svg>
    );
  }
  if (kind === "claude") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={12 + Math.cos(a) * 4}
              y1={12 + Math.sin(a) * 4}
              x2={12 + Math.cos(a) * 10}
              y2={12 + Math.sin(a) * 10}
              {...s}
            />
          );
        })}
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 24 24">
      <path d="M5.5 3.5 19 12l-6 1.5L9 19.5 5.5 3.5Z" {...s} fill="rgba(255,255,255,0.25)" />
    </svg>
  );
};

const ORBIT_ICONS: Array<{ kind: "browser" | "terminal" | "claude" | "cursor"; label: string }> = [
  { kind: "browser", label: "browser" },
  { kind: "terminal", label: "terminal" },
  { kind: "claude", label: "Claude Code" },
  { kind: "cursor", label: "Cursor" },
];

const OrbitBeat: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.ORBIT - 14 || frame >= T.ORBIT_OUT + 18) return null;
  const style = blurPushStyle(frame, T.ORBIT - 14, T.ORBIT_OUT + 18);
  const cx = 960;
  const cy = 540;

  const chipOp = interpolate(frame, [T.ORBIT, T.ORBIT + 16], [0, 1], EC);
  const chipScale = interpolate(frame, [T.ORBIT, T.ORBIT + 20], [0.9, 1], { ...EC, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ ...style, justifyContent: "center", alignItems: "center", zIndex: 25 }}>
      <Particles opacity={0.15} />
      {/* /start chip */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy + 34,
          transform: `translate(-50%, -50%) scale(${chipScale})`,
          opacity: chipOp,
          background: "rgba(10,10,18,0.92)",
          border: "1px solid rgba(103,221,222,0.3)",
          borderRadius: 16,
          padding: "16px 34px",
          fontFamily: fonts.mono,
          fontSize: 40,
          fontWeight: 700,
          color: colors.accent,
        }}
      >
        /start
      </div>

      {ORBIT_ICONS.map((icon, i) => {
        // orbit: radius eases in, one revolution ≈ 80 frames, staggered phase.
        // The angle freezes when settling starts so the four icons hold their
        // 90°-apart spread and never overlap while blending into the row.
        const phase = (i * Math.PI) / 2;
        const angle = phase + ((Math.min(frame, T.SETTLE) - T.ORBIT) / 80) * Math.PI * 2;
        const radius = interpolate(frame, [T.ORBIT, T.ORBIT + 22], [290, 200], { ...EC, easing: Easing.out(Easing.cubic) });
        const orbitX = cx + Math.cos(angle) * radius;
        const orbitY = cy + Math.sin(angle) * radius * 0.62;

        // settle into a row above the chip, staggered lock-ins
        const lockStart = T.SETTLE + i * 8;
        const settleT = interpolate(frame, [lockStart, lockStart + 22], [0, 1], {
          ...EC,
          easing: Easing.inOut(Easing.cubic),
        });
        const rowX = cx + (i - 1.5) * 118;
        const rowY = cy - 118;
        const x = orbitX + (rowX - orbitX) * settleT;
        const y = orbitY + (rowY - orbitY) * settleT;
        const iconOp = interpolate(frame, [T.ORBIT + i * 4, T.ORBIT + i * 4 + 14], [0, 1], EC);
        const lockPop = 1 + Math.sin(Math.min(settleT, 1) * Math.PI) * 0.12;
        const labelOp = interpolate(frame, [lockStart + 18, lockStart + 30], [0, 1], EC);

        return (
          <div key={icon.kind} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity: iconOp }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: "50%",
                background: colors.primary,
                boxShadow: "0 12px 30px rgba(8,132,132,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${lockPop})`,
              }}
            >
              <OrbitGlyph kind={icon.kind} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 82,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: fonts.body,
                fontSize: 17,
                fontWeight: 700,
                color: colors.textSecondary,
                whiteSpace: "nowrap",
                opacity: labelOp,
              }}
            >
              {icon.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── ACT IV: proof beat (P7) ─────────────────────────────
const ProofBeat: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.PROOF || frame >= T.PROOF_END + 16) return null;
  const style = blurPushStyle(frame, T.PROOF, T.PROOF_END + 16);
  const subOp = interpolate(frame, [T.PROOF + 46, T.PROOF + 62], [0, 1], EC);

  return (
    <AbsoluteFill style={{ ...style, justifyContent: "center", alignItems: "center", zIndex: 28 }}>
      <Particles opacity={0.15} />
      <div style={{ maxWidth: 1560 }}>
        <WordReveal
          words={[...w("Live on every"), ...w("AI-ready", true), ...w("challenge")]}
          start={T.PROOF + 12}
          fontSize={96}
        />
      </div>
      <div
        style={{
          marginTop: 32,
          fontFamily: fonts.body,
          fontSize: 29,
          fontWeight: 600,
          color: colors.textSecondary,
          opacity: subOp,
        }}
      >
        From first read to local dev environment — guided.
      </div>
    </AbsoluteFill>
  );
};

// ── ACT IV: outro + minimal end card ────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.OUTRO || frame >= T.ENDCARD + 24) return null;

  const op =
    interpolate(frame, [T.OUTRO, T.OUTRO + 36], [0, 1], EC) *
    interpolate(frame, [T.ENDCARD, T.ENDCARD + 22], [1, 0], EC);
  const ctaScale = spring({ frame: Math.max(0, frame - T.OUTRO - 20), fps, config: { damping: 20, mass: 1 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        opacity: op,
        zIndex: 30,
      }}
    >
      <Particles />
      <div
        style={{
          position: "absolute",
          top: -76,
          left: 0,
          right: 0,
          height: "40%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
          transform: `scale(${ctaScale})`,
        }}
      >
        <Sequence from={T.OUTRO} layout="none">
          <PixelGirlSprite size={160} />
        </Sequence>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 48, fontWeight: 700, color: colors.primary, margin: 0, letterSpacing: "-0.01em" }}>
          speedrunethereum.com
        </h2>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "6%",
          transform: `scale(${ctaScale})`,
        }}
      >
        <h1
          style={{
            fontFamily: serifFont,
            color: colors.textPrimary,
            fontSize: 92,
            margin: 0,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          Learn Solidity with a teacher
          <br />
          <span style={{ color: colors.primary }}>right on the page</span>
        </h1>
        <p style={{ fontFamily: fonts.body, color: colors.textSecondary, fontSize: 32, marginTop: 30, textAlign: "center" }}>
          AI Teaching Assistant · Available now for all registered builders
        </p>
      </div>
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

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.ENDCARD) return null;
  const op =
    interpolate(frame, [T.ENDCARD + 14, T.ENDCARD + 34], [0, 1], EC) *
    interpolate(frame, [T.END - 26, T.END - 4], [1, 0], EC);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 32 }}>
      <div style={{ opacity: op }}>
        <h1
          style={{
            fontFamily: serifFont,
            fontSize: 84,
            fontWeight: 700,
            color: colors.primary,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          speedrunethereum.com
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// ── Sound design ────────────────────────────────────────
const Sound: React.FC = () => (
  <>
    <Audio
      src={staticFile("ai-tutor-video-music.mp3")}
      volume={f =>
        interpolate(
          f,
          // quiet dip under the problem beat, then back to the bed level
          [0, 40, T.PROB_IN, T.PROB_IN + 25, T.PROB_OUT, T.PROB_OUT + 25, T.END - 80, T.END],
          [0, 0.15, 0.15, 0.09, 0.09, 0.15, 0.15, 0],
          EC,
        )
      }
    />
    {[T.FAB_CLICK, T.CHIP_CLICK, T.U2_SEND, T.U3_SEND, T.U4_SEND, T.U5_SEND, T.A4].map((f, i) => (
      <Sequence key={`clk-${i}`} from={f} durationInFrames={30}>
        <Audio src={CLICK_SFX} volume={0.2} />
      </Sequence>
    ))}
    {ORBIT_ICONS.map((_, i) => (
      <Sequence key={`lock-${i}`} from={T.SETTLE + i * 8 + 14} durationInFrames={26}>
        <Audio src={CLICK_SFX} volume={0.13} />
      </Sequence>
    ))}
    {INPUT_ACTIONS.map((action, i) => (
      <Sequence key={`tap-${i}`} from={action.typeStartFrame} durationInFrames={action.sendFrame - action.typeStartFrame}>
        <Audio src={TAP_SFX} volume={0.14} />
      </Sequence>
    ))}
  </>
);

// ── Main ────────────────────────────────────────────────
export const WebAIAssistantLaunchV3: React.FC = () => (
  <AbsoluteFill style={{ background: "#f7feff" }}>
    <Background />
    <Sound />
    <ProductShot />
    <FloatingPanel />
    <OrbitBeat />
    <ChapterBadge />
    {INTERSTITIALS.map(it => (
      <Interstitial key={it.num} {...it} />
    ))}
    <ProblemBeat />
    <Hook />
    <ProofBeat />
    <Outro />
    <EndCard />
  </AbsoluteFill>
);
