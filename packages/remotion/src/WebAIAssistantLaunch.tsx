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

const { fontFamily: serifFont } = loadFont();
const CLICK_SFX = staticFile("sfx/confirmation.ogg");
const TAP_SFX = staticFile("mechanical-keyboard.mp3");
const EC = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ══ Concept: "editorial split" ═══════════════════════════
// The video opens on the hero composition (big left title column with the
// running girl + the real page in a mini browser on the right). The FAB click
// and panel-open happen inside the mini browser, then one continuous camera
// push dives into the chat corner while the left column scales down and locks
// as a permanent rail. The rail's pills morph into a 4-chapter checklist that
// lights up as the conversation advances — no overlay cards ever cover the
// chat. The chat renders bigger than any previous cut (~1.75x).

// ── Timeline (frames @ 30fps) ────────────────────────────
// Timing rule (from AITutorDemo): the viewer gets 60-80 frames to READ after
// each AI message finishes streaming before the next user action begins.
const T = {
  // HERO — big rail + mini browser
  OVERLINE: 8,
  GIRL: 12,
  TITLE: 22,
  PILL1: 42,
  PILL2: 52,
  PILL3: 62,
  SUB: 76,
  BROWSER_IN: 48,
  FAB_MOVE: 95,
  FAB_CLICK: 125,
  PANEL_IN: 131,

  // PUSH — camera dives into the chat corner, rail locks small
  PUSH: 155,
  PUSH_END: 205,
  LOCK: 205, // rail morph 205-240, chapter list in at 225

  // CH1 — It knows your challenge
  CH1: 252,
  CHIP_MOVE: 262,
  CHIP_CLICK: 290,
  U1: 296,
  A1: 326, // 402 chars @5.4 cpf → ends ~401 (covered by HL1 + keyword pops)
  HL1_IN: 400,
  HL1_OUT: 560,

  // CH2 — It checks it clicked
  // Retimed for faster streaming: each answer gets a ~50-62f read hold, then act.
  CH2: 562,
  A2: 577, // 79 chars @4.8 → ends ~594, hold 50f
  U2_TYPE: 644,
  U2_SEND: 669,
  U2: 674,
  A3: 686, // 127 chars @4.8 → ends ~713, hold 62f
  U3_TYPE: 775,
  U3_SEND: 845,
  U3: 850,
  A4: 862, // 217 chars @4.8 → ends ~908, hold 55f
  DIM_IN: 644,
  DIM_OUT: 968,

  // CH3 — Hints, not answers
  CH3: 948,
  U4_TYPE: 963,
  U4_SEND: 1013,
  U4: 1018,
  A5: 1030, // 284 chars @5.4 → ends ~1083, hold 60f

  // CH4 — It gets you running locally
  CH4: 1128,
  U5_TYPE: 1143,
  U5_SEND: 1193,
  U5: 1198,
  A6: 1210, // 312 chars @4.8 → ends ~1275
  TERM_IN: 1316,
  TERM_OUT: 1476,
  A7: 1481, // 125 chars @4.8 → ends ~1508
  HL2_IN: 1526,
  HL2_OUT: 1606,

  // Pull-back + outro
  PULL: 1616,
  PULL_END: 1668,
  OUTRO: 1681,
  END: 1916,
};
export const WEB_AI_ASSISTANT_TOTAL_DURATION = T.END;

// ── Screenshot geometry ─────────────────────────────────
// ss3.png is a native 1920x916 capture of the challenge page (FAB visible, no panel).
const PANEL_W = 440;
const FAB = { x: 1857, y: 798 }; // baked-in floating action button center (shot coords)
const CHIP1 = { x: 1700, y: 396 }; // first suggestion chip center (shot coords)

// ── One continuous camera ────────────────────────────────
// The whole product shot (page + live panel + cursor) lives in a single
// container. Its transform interpolates: mini browser → chat-dominant demo
// framing (right-bottom anchored, panel ~770px wide on screen, ~500px page
// sliver next to the rail) → back out to the full page for the outro.
const MINI = { x: 640, y: 208, s: 1220 / 1920 }; // content 1220x582 at (640,208)
const DEMO_S = 1.75;
// Right-bottom anchor: right edge at 1920, bottom edge flush with the screen
const anchorX = (s: number) => 1920 - 1920 * s;
const anchorY = (s: number) => 1080 - 916 * s;

function shotTransform(f: number): { x: number; y: number; s: number } {
  // Slow push through the chapters, then pull out to full page
  const drift = interpolate(f, [T.LOCK, T.CH2, T.CH3, T.CH4, T.PULL], [0, 0.02, 0.035, 0.05, 0.06], EC);
  const demoS = DEMO_S + drift;

  if (f < T.PUSH) return MINI;
  if (f < T.PULL) {
    const p = interpolate(f, [T.PUSH, T.PUSH_END], [0, 1], { ...EC, easing: Easing.inOut(Easing.cubic) });
    return {
      x: interpolate(p, [0, 1], [MINI.x, anchorX(demoS)]),
      y: interpolate(p, [0, 1], [MINI.y, anchorY(demoS)]),
      s: interpolate(p, [0, 1], [MINI.s, demoS]),
    };
  }
  const q = interpolate(f, [T.PULL, T.PULL_END], [0, 1], { ...EC, easing: Easing.inOut(Easing.cubic) });
  return {
    x: interpolate(q, [0, 1], [anchorX(demoS), 0]),
    y: interpolate(q, [0, 1], [anchorY(demoS), 82]),
    s: interpolate(q, [0, 1], [demoS, 1]),
  };
}

// ── Chat script (abridged from the real product conversation) ──
const MSGS: WebChatMsg[] = [
  { id: "u1", role: "user", text: CHIP_LABELS[0], appearFrame: T.U1 },
  {
    id: "a1",
    role: "ai",
    appearFrame: T.A1,
    streamCharsPerFrame: 5.4,
    text: `Crowdfunding is a perfect first dApp: a group of strangers pool money together without trusting each other — they only have to trust the code.\n\nIf enough ETH is collected before a deadline, the funds go to the recipient. If not, everyone gets their money back. No middleman, no escrow, no "trust me bro."\n\nThe rules are enforced by the smart contract itself — once deployed, nobody can change them.`,
  },
  {
    id: "a2",
    role: "ai",
    appearFrame: T.A2,
    streamCharsPerFrame: 4.8,
    text: `Does this make sense? Want me to test your understanding with a quick question?`,
  },
  { id: "u2", role: "user", text: "yes pls", appearFrame: T.U2 },
  {
    id: "a3",
    role: "ai",
    appearFrame: T.A3,
    streamCharsPerFrame: 4.8,
    text: `Try to answer this: why don't contributors need to trust each other — or a middleman — in this system? What enforces the rules?`,
  },
  {
    id: "u3",
    role: "user",
    text: "the smart contract enforces the rules — if we don't reach the goal, everyone just gets their money back",
    appearFrame: T.U3,
  },
  {
    id: "a4",
    role: "ai",
    appearFrame: T.A4,
    streamCharsPerFrame: 4.8,
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
    streamCharsPerFrame: 5.4,
    text: `Nice try 🙂 I won't hand you the code — you'd learn nothing.\n\nBut here's a hint: the contract needs to know how much each person contributed, not just the total. On-chain that's a mapping — think of it as a dictionary from each address to the amount they've sent.\n\nGive it a shot!`,
  },
  {
    id: "u5",
    role: "user",
    text: "help me set up locally",
    appearFrame: T.U5,
  },
  {
    // Real setup flow from the challenge README (create-eth + 3 terminals).
    id: "a6",
    role: "ai",
    appearFrame: T.A6,
    streamCharsPerFrame: 4.8,
    text: `Let's get you running — three terminals:\n\n$ npx create-eth@2.0.20 -e challenge-crowdfunding\nscaffolds the challenge\n\n$ yarn chain\nyour local blockchain — terminal 1\n\n$ yarn deploy\ndeploys the contracts — terminal 2\n\n$ yarn start\napp live at localhost:3000 — terminal 3\n\nHit an error? Paste it here.`,
  },
  {
    id: "a7",
    role: "ai",
    appearFrame: T.A7,
    streamCharsPerFrame: 4.8,
    text: `Want the full tutor? Open the repo in Cursor or Claude Code and run /start — right in your IDE. See you at the finish line 🏁`,
  },
];

const INPUT_ACTIONS: WebInputAction[] = [
  { text: "yes pls", typeStartFrame: T.U2_TYPE, sendFrame: T.U2_SEND },
  {
    text: "the smart contract enforces the rules — if we don't reach the goal, everyone just gets their money back",
    typeStartFrame: T.U3_TYPE,
    sendFrame: T.U3_SEND,
  },
  { text: "ok just write the withdraw function for me 😅", typeStartFrame: T.U4_TYPE, sendFrame: T.U4_SEND },
  { text: "help me set up locally", typeStartFrame: T.U5_TYPE, sendFrame: T.U5_SEND },
];

const DOT_WINDOWS: Array<[number, number]> = [
  [T.U1 + 8, T.A1],
  [T.A2 - 16, T.A2],
  [T.U2 + 8, T.A3],
  [T.U3 + 8, T.A4],
  [T.U4 + 8, T.A5],
  [T.U5 + 8, T.A6],
  [T.A7 - 16, T.A7],
];

// ── Rail chapter checklist ──────────────────────────────
const CHAPTERS = [
  { num: "01", title: "Knows your challenge", sub: "Context-aware help", start: T.CH1 },
  { num: "02", title: "Checks it clicked", sub: "Quick questions prove it stuck", start: T.CH2 },
  { num: "03", title: "Hints, not answers", sub: "You write the code", start: T.CH3 },
  { num: "04", title: "Gets you running locally", sub: "The exact local setup steps", start: T.CH4 },
];

const INTRO_PILLS = [
  { glyph: "⚡", label: "learn the gotchas" },
  { glyph: "✓", label: "quiz yourself" },
  { glyph: ">_", label: "get set up locally" },
];

// ── Background: SRE gradient + drifting grid ────────────
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

// ── Floating particles (rail/outro decoration) ──────────
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const baseX = (i * 240 + 80) % 1920;
        const baseY = 80 + ((i * 170) % 750);
        const offsetY = Math.sin(frame * 0.03 + i * 1.2) * 25;
        const sz = 6 + (i % 4) * 5;
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
              opacity: 0.15,
              zIndex: 0,
            }}
          />
        );
      })}
    </>
  );
};

// ── The left rail: hero → locked sidebar with chapter checklist ──
const Rail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const railOut = interpolate(frame, [T.PULL, T.PULL + 30], [1, 0], EC);
  if (railOut <= 0) return null;

  // Hero block morphs down and locks top-left
  const morph = interpolate(frame, [T.LOCK, T.LOCK + 35], [0, 1], { ...EC, easing: Easing.inOut(Easing.cubic) });
  // Locked state: a bit larger and nudged right so the block's left edge
  // lines up with the chapter checklist's number column below it.
  const k = interpolate(morph, [0, 1], [1, 0.77]);
  const blockY = interpolate(morph, [0, 1], [128, 40]);
  const blockX = interpolate(morph, [0, 1], [70, 120]);

  const overlineOp = interpolate(frame, [T.OVERLINE, T.OVERLINE + 14], [0, 1], EC);
  const girlPop = spring({ frame: Math.max(0, frame - T.GIRL), fps, config: { damping: 15, mass: 0.8 } });
  const titleOp = interpolate(frame, [T.TITLE, T.TITLE + 18], [0, 1], EC);
  const titleY = interpolate(frame, [T.TITLE, T.TITLE + 22], [18, 0], { ...EC, easing: Easing.out(Easing.cubic) });
  const pillsOp = interpolate(frame, [T.LOCK, T.LOCK + 14], [1, 0], EC);
  const listOp = interpolate(frame, [T.LOCK + 20, T.LOCK + 40], [0, 1], EC);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 640, zIndex: 40, opacity: railOut }}>
      {/* opaque band so the page never shows through, soft right edge */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, #f7feff 0%, #f7feff 86%, rgba(247,254,255,0) 100%)",
        }}
      />

      {/* Hero block (overline + girl + title), scales down and locks */}
      <div
        style={{
          position: "absolute",
          left: blockX,
          top: blockY,
          width: 470,
          transform: `scale(${k})`,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 17,
            letterSpacing: 3.5,
            color: colors.primary,
            fontWeight: 700,
            opacity: overlineOp,
            marginBottom: 18,
          }}
        >
          NEW ON SPEEDRUNETHEREUM.COM
        </div>
        <div style={{ transform: `scale(${girlPop})`, transformOrigin: "left bottom", marginBottom: 6, marginLeft: -8 }}>
          <PixelGirlSprite size={188} />
        </div>
        <h1
          style={{
            fontFamily: serifFont,
            fontSize: 68,
            fontWeight: 700,
            color: colors.textPrimary,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            opacity: titleOp,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Meet the AI Teaching Assistant
        </h1>

        {/* Hero pills — fade out when the rail locks */}
        {pillsOp > 0 && (
          <div style={{ opacity: pillsOp }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 30, alignItems: "flex-start" }}>
              {INTRO_PILLS.map((p, i) => {
                const pf = [T.PILL1, T.PILL2, T.PILL3][i];
                const ps = spring({ frame: Math.max(0, frame - pf), fps, config: { damping: 14, mass: 0.7 } });
                if (frame < pf) return null;
                return (
                  <div
                    key={p.label}
                    style={{
                      transform: `scale(${ps})`,
                      transformOrigin: "left center",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#fff",
                      border: "1.5px solid rgba(8,132,132,0.4)",
                      borderRadius: 999,
                      padding: "11px 24px 11px 18px",
                      boxShadow: "0 6px 22px rgba(2,98,98,0.12)",
                    }}
                  >
                    <span style={{ fontFamily: fonts.mono, fontSize: 20, color: colors.primary, fontWeight: 700 }}>{p.glyph}</span>
                    <span style={{ fontFamily: fonts.body, fontSize: 24, color: colors.textPrimary, fontWeight: 600 }}>{p.label}</span>
                  </div>
                );
              })}
            </div>
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 22,
                color: colors.textSecondary,
                margin: "26px 0 0",
                opacity: interpolate(frame, [T.SUB, T.SUB + 16], [0, 1], EC),
              }}
            >
              No experience needed. It lives on every challenge page.
            </p>
          </div>
        )}
      </div>

      {/* Chapter checklist — lights up as the conversation advances */}
      {listOp > 0 && (
        <div style={{ position: "absolute", left: 70, top: 480, width: 460, opacity: listOp, display: "flex", flexDirection: "column", gap: 14 }}>
          {CHAPTERS.map((ch, i) => {
            const next = CHAPTERS[i + 1];
            const active = frame >= ch.start && (!next || frame < next.start);
            const done = next ? frame >= next.start : false;
            const activate = spring({ frame: Math.max(0, frame - ch.start), fps, config: { damping: 16, mass: 0.7 } });
            const grow = frame >= ch.start ? activate : 0;

            return (
              <div
                key={ch.num}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  background: active ? `rgba(10,10,18,${0.9 * Math.min(1, grow)})` : "transparent",
                  border: active ? "1px solid rgba(103,221,222,0.3)" : "1px solid transparent",
                  borderRadius: 16,
                  padding: active ? "16px 20px" : "8px 20px",
                  boxShadow: active ? "0 16px 44px rgba(2,98,98,0.28)" : "none",
                  transform: active ? `scale(${0.96 + Math.min(1, grow) * 0.04})` : "scale(1)",
                  transformOrigin: "left center",
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: active ? colors.accent : done ? colors.primary : "rgba(2,98,98,0.35)",
                    lineHeight: "30px",
                  }}
                >
                  {done ? "✓" : ch.num}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: 25,
                      fontWeight: 750,
                      color: active ? "#fff" : done ? colors.textPrimary : "rgba(2,98,98,0.4)",
                      lineHeight: "30px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {ch.title}
                  </div>
                  {active && (
                    <div
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 17,
                        color: "rgba(255,255,255,0.55)",
                        marginTop: 4,
                        opacity: interpolate(frame, [ch.start + 6, ch.start + 20], [0, 1], EC),
                      }}
                    >
                      {ch.sub}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Page overlays in screen space (over the page sliver) ──

// Small keyword chip popping out of the conversation onto the sliver
const KeywordPop: React.FC<{ text: string; x: number; y: number; inF: number; outF: number; mono?: boolean }> = ({
  text,
  x,
  y,
  inF,
  outF,
  mono,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < inF || frame > outF + 12) return null;
  const pop = spring({ frame: Math.max(0, frame - inF), fps, config: { damping: 15, mass: 0.7 } });
  const op = interpolate(frame, [outF - 10, outF + 10], [1, 0], EC);
  const slideX = interpolate(pop, [0, 1], [46, 0]);
  const float = Math.sin((frame - inF) * 0.09) * 4;

  return (
    <div
      style={{
        position: "absolute",
        left: x + slideX,
        top: y + float,
        transform: `scale(${pop})`,
        transformOrigin: "right center",
        background: "#fff",
        border: `1.5px solid ${colors.primary}`,
        borderRadius: 10,
        padding: "9px 16px",
        fontFamily: mono ? fonts.mono : fonts.body,
        fontSize: mono ? 18 : 20,
        fontWeight: 600,
        color: colors.textPrimary,
        boxShadow: "0 10px 30px rgba(2,98,98,0.22)",
        opacity: op,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {text}
    </div>
  );
};

// Mini terminal window "running" yarn chain in the sliver during setup
const TERM_LINES = [
  "Started HTTP and WebSocket JSON-RPC",
  "server at http://127.0.0.1:8545/",
  "",
  "Accounts",
  "========",
  "(0) 0xf39F…92266 (10000 ETH)",
  "(1) 0x7099…c79C8 (10000 ETH)",
  "(2) 0x3C44…293BC (10000 ETH)",
];
const TERM_CMD = "yarn chain";
const TERM_TYPE_START = T.TERM_IN + 10;
const TERM_OUT_START = T.TERM_IN + 46;

const MiniTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.TERM_IN || frame > T.TERM_OUT + 10) return null;
  const pop = spring({ frame: Math.max(0, frame - T.TERM_IN), fps, config: { damping: 17, mass: 0.8 } });
  const op = interpolate(frame, [T.TERM_OUT - 18, T.TERM_OUT], [1, 0], EC);
  const typed = TERM_CMD.slice(0, Math.max(0, Math.floor((frame - TERM_TYPE_START) / 3)));
  const cursorOn = interpolate((frame % 22) / 22, [0, 0.49, 0.51, 1], [1, 1, 0, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 620,
        top: 330,
        width: 505,
        transform: `scale(${0.92 + pop * 0.08})`,
        transformOrigin: "50% 60%",
        opacity: pop * op,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 30px 70px rgba(2,30,30,0.45)",
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      <div
        style={{
          height: 34,
          background: "#122",
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 14px",
          borderBottom: "1px solid rgba(103,221,222,0.15)",
        }}
      >
        {["#FF8863", "#FFCF72", "#67DDDE"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 10, fontFamily: fonts.mono, fontSize: 12.5, color: "rgba(200,245,255,0.6)" }}>
          challenge-crowdfunding — terminal 1
        </span>
      </div>
      <div style={{ background: "#0d1a1a", padding: "14px 16px 18px", fontFamily: fonts.mono, fontSize: 13.5, lineHeight: "21px" }}>
        <div style={{ color: colors.accent }}>
          <span style={{ color: "rgba(200,245,255,0.55)" }}>$ </span>
          {typed}
          {frame < TERM_OUT_START && <span style={{ opacity: cursorOn, color: colors.accent }}>▊</span>}
        </div>
        {TERM_LINES.map((ln, i) => {
          const lf = TERM_OUT_START + i * 7;
          if (frame < lf) return null;
          return (
            <div key={i} style={{ color: i < 2 ? colors.claudeGreen : "rgba(200,245,255,0.75)", minHeight: 21 }}>
              {ln}
            </div>
          );
        })}
        {frame >= TERM_OUT_START + TERM_LINES.length * 7 && (
          <span style={{ opacity: cursorOn, color: colors.accent }}>▊</span>
        )}
      </div>
    </div>
  );
};

// Teal highlight sweep over a page region, in shot-native coords
const PageHighlight: React.FC<{ x: number; y: number; w: number; h: number; inF: number; outF: number }> = ({
  x,
  y,
  w,
  h,
  inF,
  outF,
}) => {
  const frame = useCurrentFrame();
  if (frame < inF || frame > outF + 14) return null;
  const op = interpolate(frame, [inF, inF + 12, outF - 14, outF], [0, 1, 1, 0], EC);
  const wipe = interpolate(frame, [inF, inF + 26], [0, 1], { ...EC, easing: Easing.out(Easing.cubic) });
  const sweepX = interpolate(frame, [inF + 4, inF + 40], [0, w + 120], EC);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: op, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: w * wipe,
          height: h,
          borderRadius: 12,
          background: "rgba(103,221,222,0.16)",
          border: "2px solid rgba(8,132,132,0.55)",
          boxShadow: "0 0 0 6px rgba(103,221,222,0.12), 0 8px 30px rgba(8,132,132,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: sweepX - 120,
            width: 120,
            height: h,
            background: "linear-gradient(90deg, transparent, rgba(103,221,222,0.35), transparent)",
          }}
        />
      </div>
    </div>
  );
};

// ── The product shot: one container from mini browser to demo framing ──
const ProductShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.BROWSER_IN) return null;

  const { x, y, s } = shotTransform(frame);
  const outroFade = interpolate(frame, [T.OUTRO, T.OUTRO + 30], [1, 0], EC);

  // Mini browser entrance: rise + fade
  const enterOp = interpolate(frame, [T.BROWSER_IN, T.BROWSER_IN + 18], [0, 1], EC);
  const enterRise = interpolate(frame, [T.BROWSER_IN, T.BROWSER_IN + 24], [30, 0], { ...EC, easing: Easing.out(Easing.cubic) });

  // Browser chrome fades as the push starts; corners square off
  const pushP = interpolate(frame, [T.PUSH, T.PUSH + 18], [0, 1], EC);
  const chromeOp = 1 - pushP;
  const radius = interpolate(frame, [T.PUSH, T.PUSH + 30], [14, 0], EC);
  const shadow = 1 - pushP;

  // Panel slide-in from the right
  const panelSlide = spring({
    frame: Math.max(0, frame - T.PANEL_IN),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.9 },
  });
  const panelX = interpolate(panelSlide, [0, 1], [PANEL_W + 20, 0]);
  const panelOpen = frame >= T.PANEL_IN;

  // FAB attention pulse before the click
  const fabPulse = frame >= T.BROWSER_IN + 20 && frame < T.FAB_CLICK + 8;
  const pulseT = ((frame - T.BROWSER_IN) % 40) / 40;

  // Quiz spotlight: dim the page while the quiz plays so the panel glows
  const dim =
    interpolate(frame, [T.DIM_IN, T.DIM_IN + 30], [0, 1], EC) *
    interpolate(frame, [T.DIM_OUT, T.DIM_OUT + 30], [1, 0], EC);

  return (
    <AbsoluteFill style={{ opacity: enterOp * outroFade }}>
      {/* Browser chrome bar (mini phase only) */}
      {chromeOp > 0 && (
        <div
          style={{
            position: "absolute",
            left: MINI.x,
            top: MINI.y - 44 + enterRise,
            width: 1920 * MINI.s,
            height: 44,
            background: "#eafcff",
            border: "1px solid rgba(8,132,132,0.18)",
            borderBottom: "none",
            borderRadius: "14px 14px 0 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 18px",
            opacity: chromeOp,
            zIndex: 5,
          }}
        >
          {["#FF8863", "#FFCF72", "#67DDDE"].map(c => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <div
            style={{
              marginLeft: 14,
              background: "#fff",
              border: "1px solid rgba(8,132,132,0.14)",
              borderRadius: 8,
              padding: "4px 16px",
              fontFamily: fonts.mono,
              fontSize: 14.5,
              color: colors.textSecondary,
            }}
          >
            speedrunethereum.com/challenge/crowdfunding
          </div>
        </div>
      )}

      {/* The shot container: page + panel + cursor, one transform throughout */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + enterRise,
          width: 1920,
          height: 916,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
          borderRadius: radius / s,
          overflow: "hidden",
          border: chromeOp > 0 ? "1px solid rgba(8,132,132,0.18)" : "none",
          boxShadow: shadow > 0 ? `0 ${40 * shadow}px ${90 * shadow}px rgba(2,98,98,${0.25 * shadow})` : "none",
        }}
      >
        <Img
          src={staticFile("web-ai-assistant-sshots/ss3.png")}
          style={{ width: 1920, height: 916, display: "block" }}
        />

        {/* Quiz spotlight dim (page area only, panel stays bright) */}
        {dim > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1920 - PANEL_W,
              height: 916,
              background: "radial-gradient(ellipse at 78% 62%, rgba(1,38,38,0.16), rgba(1,38,38,0.38))",
              opacity: dim,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Highlight sweeps synced to the conversation (page coords) */}
        <PageHighlight x={680} y={650} w={770} h={162} inF={T.HL1_IN} outF={T.HL1_OUT} />
        <PageHighlight x={720} y={490} w={725} h={126} inF={T.HL2_IN} outF={T.HL2_OUT} />

        {/* FAB pulse ring (the button itself is baked into the screenshot) */}
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

        {/* Live chat panel */}
        {panelOpen && (
          <div style={{ position: "absolute", right: 0, top: 0, transform: `translateX(${panelX}px)` }}>
            <WebChatPanel
              messages={MSGS}
              inputActions={INPUT_ACTIONS}
              dotWindows={DOT_WINDOWS}
              chipClickFrame={T.CHIP_CLICK}
              width={PANEL_W}
              height={916}
            />
          </div>
        )}

        {/* Cursor: glide to FAB and click */}
        <Sequence from={T.FAB_MOVE} durationInFrames={T.FAB_CLICK - T.FAB_MOVE + 16} layout="none">
          <AnimatedCursor
            positions={[
              { x: 1520, y: 620, frame: 0 },
              { x: FAB.x - 6, y: FAB.y - 8, frame: T.FAB_CLICK - T.FAB_MOVE },
            ]}
            clickAtEnd
            size={26}
            color={colors.primary}
          />
        </Sequence>

        {/* Cursor: glide to the first suggestion chip and click */}
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

// ── Outro ───────────────────────────────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.OUTRO) return null;

  const op = interpolate(frame, [T.OUTRO, T.OUTRO + 40], [0, 1], EC);
  const ctaScale = spring({ frame: Math.max(0, frame - T.OUTRO - 25), fps, config: { damping: 20, mass: 1 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
        opacity: op,
        zIndex: 60,
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
          <span style={{ color: colors.primary }}>right on the challenge page</span>
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

// ── Sound design ────────────────────────────────────────
const Sound: React.FC = () => (
  <>
    <Audio
      src={staticFile("ai-tutor-video-music.mp3")}
      volume={f => interpolate(f, [0, 40, T.END - 80, T.END], [0, 0.15, 0.15, 0], EC)}
    />
    {[T.PILL1, T.PILL2, T.PILL3].map(f => (
      <Sequence key={`pill-${f}`} from={f} durationInFrames={24}>
        <Audio src={CLICK_SFX} volume={0.1} />
      </Sequence>
    ))}
    {/* Rail chapter activations */}
    {CHAPTERS.map(ch => (
      <Sequence key={`ch-${ch.num}`} from={ch.start} durationInFrames={24}>
        <Audio src={CLICK_SFX} volume={0.12} />
      </Sequence>
    ))}
    {[T.FAB_CLICK, T.CHIP_CLICK, T.U2_SEND, T.U3_SEND, T.U4_SEND, T.U5_SEND, T.A4, T.TERM_IN].map((f, i) => (
      <Sequence key={`clk-${i}`} from={f} durationInFrames={30}>
        <Audio src={CLICK_SFX} volume={0.2} />
      </Sequence>
    ))}
    {INPUT_ACTIONS.map((action, i) => (
      <Sequence key={`tap-${i}`} from={action.typeStartFrame} durationInFrames={action.sendFrame - action.typeStartFrame}>
        <Audio src={TAP_SFX} volume={0.14} />
      </Sequence>
    ))}
    {/* Terminal typing */}
    <Sequence from={TERM_TYPE_START} durationInFrames={TERM_OUT_START - TERM_TYPE_START}>
      <Audio src={TAP_SFX} volume={0.12} />
    </Sequence>
  </>
);

// ── Main ────────────────────────────────────────────────
export const WebAIAssistantLaunch: React.FC = () => (
  <AbsoluteFill style={{ background: "#f7feff" }}>
    <Background />
    <Sound />
    <ProductShot />
    {/* Screen-space overlays over the page sliver */}
    <KeywordPop text="no middleman 🤝" x={655} y={385} inF={410} outF={488} />
    <KeywordPop text="goal missed → everyone refunded" x={685} y={480} inF={448} outF={535} />
    <KeywordPop text="mapping(address => uint256)" x={650} y={430} inF={1066} outF={1156} mono />
    <MiniTerminal />
    <Rail />
    <Outro />
  </AbsoluteFill>
);
