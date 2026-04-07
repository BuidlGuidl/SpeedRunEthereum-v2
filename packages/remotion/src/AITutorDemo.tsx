import React from "react";
import {
  AbsoluteFill, Audio, Sequence,
  useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { CodeEditor } from "./components/CodeEditor";
import { CursorChatPanel, ChatMsg, InputAction } from "./components/CursorChatPanel";
import { CursorIDEChrome } from "./components/CursorIDEChrome";
import { AnimatedCursor } from "./components/AnimatedCursor";
import { Confetti } from "./components/Confetti";
import { PixelGirlSprite } from "./components/PixelGirlSprite";
import { fonts, colors } from "./theme";

const { fontFamily: serifFont } = loadFont();
const CLICK_SFX = staticFile("sfx/confirmation.ogg");
const TAP_SFX = staticFile("mechanical-keyboard.mp3");
const EC = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ── Intro duration (frames @ 30fps) ──────────────────────
const INTRO_DUR = 45; // 1.5 seconds for sprite intro card

// ── Timeline (frames @ 30fps) ────────────────────────────
// All values are auto-offset by INTRO_DUR so the intro plays first.
// Timing rule: viewer gets 60-80 frames to READ after each AI message
// finishes streaming before the next user action begins.
const _T = {
  // HOOK — single flowing intro (~6s)
  HOOK_L1: 15,       // "If you don't want to solo"
  HOOK_L2: 55,       // "your Solidity education anymore."
  DUO_L1: 100,       // "Now you can duo with your agent"
  DUO_L2: 130,       // "and speedrun it!"
  HOOK_OUT: 178,      // all 4 lines begin fading out together

  // UC1: Learn gotchas (+30 fr hold = 113 frames total)
  UC1: 210, UC1_END: 323,
  IDE_IN: 323, IDE_READY: 353,
  START_TYPE: 363, START_SEND: 393, START_MSG: 398, AI_WELCOME: 406,
  // a1: ~308 chars / 2.0 cps = 154 fr → finishes ~560. Wait 75 fr → 635
  READY_TYPE: 635, READY_SEND: 658, READY_MSG: 663, AI_TEACH: 671,

  // a2: ~420 chars / 2.5 cps = 168 fr → finishes ~839
  // UC2: Prove understanding (+30 fr hold)
  UC2: 872, UC2_END: 985,
  // After UC2 transition, viewer re-reads the question for 50 fr → 1035
  ANSWER_TYPE: 1035, ANSWER_SEND: 1078, ANSWER_MSG: 1083, AI_CONFIRM: 1091,

  // a3: ~310 chars / 2.0 cps = 155 fr → finishes ~1246
  // UC3: Get hints (+30 fr hold)
  UC3: 1269, UC3_END: 1382,
  AI_REENTRANCY: 1390,
  // a4: ~200 chars / 2.2 cps = 91 fr → finishes ~1481. Wait halved: 65→33 fr
  HINT_TYPE: 1499, HINT_SEND: 1522, HINT_MSG: 1527, AI_HINT: 1535,

  // a5: ~270 chars / 2.0 cps = 135 fr → finishes ~1670
  // UC4: Code. Check. Fix. (+30 fr hold)
  UC4: 1697, UC4_END: 1810,
  AI_TASK: 1818,
  // a_task: ~300 chars / 2.5 cps = 120 fr → finishes ~1938
  // Code zoom starts AFTER task message streams, code typing starts AFTER zoom-in
  CODE_ZOOM_START: 1945,   // zoom into code panel (zoom-in finishes at 1990)
  CODE_PUSH: 1990,         // code appears after zoom-in completes
  CODE_TYPE_START: 1995, CODE_TYPE_END: 2135,
  CODE_RETURN: 2145,
  CODE_ZOOM_END: 2160,     // zoom-out starts (finishes at 2205)
  // User types "check" after full view is restored
  CHECK1_TYPE: 2220, CHECK1_SEND: 2247, CHECK1_MSG: 2252, AI_BUG: 2260,
  // a6: ~260 chars / 2.2 cps = 118 fr → finishes ~2378
  // BUG_HL appears 50 fr after AI_BUG starts (mid-stream, explanation visible)
  BUG_HL: 2310,
  FIX_STEP1: 2414, FIX_STEP2: 2444,
  CHECK2_TYPE: 2479, CHECK2_SEND: 2506, CHECK2_MSG: 2511, AI_TESTS: 2519,
  // a7: ~235 chars / 1.8 cps = 131 fr → finishes ~2650
  SUCCESS: 2664,

  // OUTRO — 5s hold
  OUTRO: 2764, END: 2914,
};
// Offset all timeline values by INTRO_DUR
const T = Object.fromEntries(
  Object.entries(_T).map(([k, v]) => [k, v + INTRO_DUR])
) as typeof _T;
export const AITUTOR_TOTAL_DURATION = T.END;

// ── Chat-focus & Code-focus zooms (stage-based) ─────────
// Default view: scale 1.0 = full IDE visible, large fonts for readability
// Zooms crop into specific panels for focus
// ty = vertical translate to keep bottom in viewport (negative = shift up)
const IDE_H = 1040;       // 1080 - 40 padding
const VIEWPORT_H = 1080;
const IDE_TOP = 20;       // padding

// Chat zoom: anchor bottom-right of IDE to viewport edges
function calcBottomAnchorTy(scale: number, oy: number): number {
  const originScreenY = IDE_TOP + (oy / 100) * IDE_H;
  const bottomScreenY = originScreenY + (IDE_H - (oy / 100) * IDE_H) * scale;
  const maxBottom = VIEWPORT_H - 30;
  return bottomScreenY > maxBottom ? -(bottomScreenY - maxBottom) / scale : 0;
}

const IDE_W = 1880;       // 1920 - 40 padding
const IDE_LEFT = 20;      // padding

function calcRightAnchorTx(scale: number, ox: number): number {
  const originScreenX = IDE_LEFT + (ox / 100) * IDE_W;
  const rightScreenX = originScreenX + (IDE_W - (ox / 100) * IDE_W) * scale;
  const maxRight = 1920 - 10;
  return rightScreenX > maxRight ? -(rightScreenX - maxRight) / scale : 0;
}

const STAGE_ZOOM_CHAT = { scale: 1.55, ox: 85, oy: 55 };   // focus on chat panel (right side)
const STAGE_ZOOM_CODE = { scale: 1.35, ox: 32, oy: 55 };   // focus on code editor (left side)

// Pre-calculate the translates needed to anchor chat within viewport
const CHAT_TY = calcBottomAnchorTy(STAGE_ZOOM_CHAT.scale, STAGE_ZOOM_CHAT.oy);
const CHAT_TX = calcRightAnchorTx(STAGE_ZOOM_CHAT.scale, STAGE_ZOOM_CHAT.ox);

// ── Camera — stage-based zooms + point zooms ────────────
// [easeInStart, easeInEnd, easeOutStart, easeOutEnd, scale, ox%, oy%]
type Z7 = [number, number, number, number, number, number, number];
const ZOOMS: Z7[] = [
  [T.CODE_PUSH, T.CODE_PUSH + 50, T.CODE_RETURN, T.CODE_RETURN + 50, 1.18, 35, 60],
  [T.BUG_HL - 10, T.BUG_HL + 35, T.FIX_STEP2 + 5, T.CHECK2_TYPE - 5, 1.15, 35, 42],
  [T.AI_TESTS + 15, T.AI_TESTS + 60, T.SUCCESS - 5, T.SUCCESS + 30, 1.10, 78, 55],
];

// Transition durations for stage zooms
const STAGE_ZOOM_EASE = 45; // frames to ease in/out

function getCamera(f: number): { scale: number; ox: number; oy: number; tx: number; ty: number } {
  // ── Stage-based zoom: chat focus during stages 1-3 ──
  const chatZoomStart = T.UC1_END;
  const chatZoomEnd = T.UC4;
  if (f >= chatZoomStart && f <= chatZoomEnd + STAGE_ZOOM_EASE) {
    let t: number;
    if (f <= chatZoomStart + STAGE_ZOOM_EASE) {
      t = interpolate(f, [chatZoomStart, chatZoomStart + STAGE_ZOOM_EASE], [0, 1], EC);
    } else if (f >= chatZoomEnd) {
      t = interpolate(f, [chatZoomEnd, chatZoomEnd + STAGE_ZOOM_EASE], [1, 0], EC);
    } else {
      t = 1;
    }
    const e = Easing.inOut(Easing.cubic)(t);
    return {
      scale: 1 + (STAGE_ZOOM_CHAT.scale - 1) * e,
      ox: 50 + (STAGE_ZOOM_CHAT.ox - 50) * e,
      oy: 50 + (STAGE_ZOOM_CHAT.oy - 50) * e,
      ty: CHAT_TY * e,
      tx: CHAT_TX * e,
    };
  }

  // ── Stage-based zoom: code focus during stage 4 ──
  const codeZoomStart = T.CODE_ZOOM_START;
  const codeZoomEnd = T.CODE_ZOOM_END;
  if (f >= codeZoomStart && f <= codeZoomEnd + STAGE_ZOOM_EASE) {
    let t: number;
    if (f <= codeZoomStart + STAGE_ZOOM_EASE) {
      t = interpolate(f, [codeZoomStart, codeZoomStart + STAGE_ZOOM_EASE], [0, 1], EC);
    } else if (f >= codeZoomEnd) {
      t = interpolate(f, [codeZoomEnd, codeZoomEnd + STAGE_ZOOM_EASE], [1, 0], EC);
    } else {
      t = 1;
    }
    const e = Easing.inOut(Easing.cubic)(t);
    return {
      scale: 1 + (STAGE_ZOOM_CODE.scale - 1) * e,
      ox: 50 + (STAGE_ZOOM_CODE.ox - 50) * e,
      oy: 50 + (STAGE_ZOOM_CODE.oy - 50) * e,
      ty: 0,
      tx: 0,
    };
  }

  // ── Point zooms (code interactions) ──
  for (const [es, ee, xs, xe, s, ox, oy] of ZOOMS) {
    if (f < es || f > xe) continue;
    let t: number;
    if (f <= ee) t = interpolate(f, [es, ee], [0, 1], EC);
    else if (f < xs) t = 1;
    else t = interpolate(f, [xs, xe], [1, 0], EC);
    const e = Easing.inOut(Easing.cubic)(t);
    return { scale: 1 + (s - 1) * e, ox: 50 + (ox - 50) * e, oy: 50 + (oy - 50) * e, tx: 0, ty: 0 };
  }
  return { scale: 1, ox: 50, oy: 50, tx: 0, ty: 0 };
}

// ── Use-case cards (full-screen title overlays → persist as compact badge) ──
const UC_CARDS = [
  { start: T.UC1, end: T.UC1_END, persistUntil: T.UC2, num: "01", title: "Learn Ethereum's gotchas", sub: "Your AI breaks down concepts and edge cases", badgeTitle: "Learn gotchas" },
  { start: T.UC2, end: T.UC2_END, persistUntil: T.UC3, num: "02", title: "Test your knowledge", sub: "Answer quick questions to validate your knowledge", badgeTitle: "Test knowledge" },
  { start: T.UC3, end: T.UC3_END, persistUntil: T.UC4, num: "03", title: "Get hints when stuck", sub: "Ask your tutor for targeted hints", badgeTitle: "Get hints" },
  { start: T.UC4, end: T.UC4_END, persistUntil: T.OUTRO, num: "04", title: "Code. Check. Fix.", sub: "Write code and get real-time reviews", badgeTitle: "Code. Check. Fix." },
];

const CODE_TOP_Y = 80; // reused below

// ── Code content ────────────────────────────────────────
const CODE_SKELETON = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract CrowdFund {
    address public fundingRecipient;

    // Events
    event Contribution(address, uint256);

    constructor(address _recipient) {
        fundingRecipient = _recipient;
    }

    function contribute() public payable {
        // TODO: Implement
    }
}`;

const TYPED_CODE = `        mapping(address => uint256) public balances;
        balances[msg.sender] += msg.value;
        emit Contribution(msg.sender, msg.value);`;

const CODE_MID_FIX = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract CrowdFund {
    address public fundingRecipient;

    // Events
    event Contribution(address, uint256);

    constructor(address _recipient) {
        fundingRecipient = _recipient;
    }

    function contribute() public payable {
        balances[msg.sender] += msg.value;
        emit Contribution(msg.sender, msg.value);
    }
}`;

const CODE_FIXED = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract CrowdFund {
    address public fundingRecipient;
    mapping(address => uint256) public balances;

    // Events
    event Contribution(address, uint256);

    constructor(address _recipient) {
        fundingRecipient = _recipient;
    }

    function contribute() public payable {
        balances[msg.sender] += msg.value;
        emit Contribution(msg.sender, msg.value);
    }
}`;

// ── Chat messages — based on real conversation references ──
const MESSAGES: ChatMsg[] = [
  { id: "u1", role: "user", text: "/start", appearFrame: T.START_MSG },
  { id: "a1", role: "ai", appearFrame: T.AI_WELCOME, streamCharsPerFrame: 2.0,
    text: `Starting the Crowdfunding challenge...\n\nWelcome! You'll build a CrowdFund contract — if enough ETH is collected before a deadline, funds go to a FundingRecipient. If not, everyone gets refunded.\n\nOpen separate terminals and run:\n  1. yarn chain\n  2. yarn deploy\n  3. yarn start\n\nSay ready when you're set up!` },
  { id: "u2", role: "user", text: "ready!", appearFrame: T.READY_MSG },
  { id: "a2", role: "ai", appearFrame: T.AI_TEACH, streamCharsPerFrame: 2.5,
    text: `Checkpoint 1: Contributing\n\nMappings — an on-chain key-value store:\n  mapping(address => uint256) public balances;\n\nEvents — logs that frontends subscribe to:\n  event Contribution(address, uint256);\n\npayable lets a function receive ETH. Inside it:\n  msg.sender — who called\n  msg.value — how much wei they sent\n\nQuick check: if someone sends 0.5 ETH then 0.3 ETH, what should their balance show? Why use += instead of = ?` },
  { id: "u3", role: "user", text: "0.8 ETH, because += adds up the total", appearFrame: T.ANSWER_MSG },
  { id: "a3", role: "ai", appearFrame: T.AI_CONFIRM, streamCharsPerFrame: 2.0,
    text: `Exactly right — = would overwrite with only the latest payment, += keeps the running total.\n\nGreat understanding! Next we'll look at a security pattern, then you'll implement the full function.` },
  { id: "a4", role: "ai", appearFrame: T.AI_REENTRANCY, streamCharsPerFrame: 2.2,
    text: `Checkpoint 2: Withdrawing\n\nChecks → Effects → Interactions (CEI):\n\nWhy do we set balances[msg.sender] = 0 before sending ETH with call? What can go wrong if we zero the balance only after the transfer?` },
  { id: "u4", role: "user", text: "hint", appearFrame: T.HINT_MSG },
  { id: "a5", role: "ai", appearFrame: T.AI_HINT, streamCharsPerFrame: 2.0,
    text: `💡 When you use call to send ETH, the recipient's receive() runs before your function finishes.\n\nIf balances still shows the full amount, that contract can call withdraw() again — that's reentrancy (same class of bug as the DAO hack).\n\nZero the balance first, then send.` },
  { id: "a_task", role: "ai", appearFrame: T.AI_TASK, streamCharsPerFrame: 2.5,
    text: `Now implement contribute() in CrowdFund.sol:\n\n1. State variable: mapping(address => uint256) public balances\n2. Event: event Contribution(address, uint256)\n3. contribute() body:\n  • balances[msg.sender] += msg.value\n  • emit Contribution(msg.sender, msg.value)\n\nCode it up, then say check!` },
  { id: "u5", role: "user", text: "check", appearFrame: T.CHECK1_MSG },
  { id: "a6", role: "ai", appearFrame: T.AI_BUG, streamCharsPerFrame: 2.2,
    text: `❌ Contract doesn't compile.\n\nmapping(address => uint256) public balances is declared inside contribute(). In Solidity, mappings belong at contract level — not inside a function.\n\nMove it to State Variables (same level as fundingRecipient), then say check again.` },
  { id: "u6", role: "user", text: "check", appearFrame: T.CHECK2_MSG },
  { id: "a7", role: "ai", appearFrame: T.AI_TESTS, streamCharsPerFrame: 1.8,
    text: `Running tests...\n\n$ forge test --match-test Checkpoint1\n\n  ✅ test_ContributeUpdatesBalance\n  ✅ test_ContributeEmitsEvent\n  ✅ test_MultipleContributions\n  ✅ test_ContractBalance\n  ✅ test_PerAddressTracking\n\nAll 5 passed! Checkpoint 1 complete 🎉` },
];

const INPUT_ACTIONS: InputAction[] = [
  { text: "/start", typeStartFrame: T.START_TYPE, sendFrame: T.START_SEND },
  { text: "ready!", typeStartFrame: T.READY_TYPE, sendFrame: T.READY_SEND },
  { text: "0.8 ETH, because += adds up the total", typeStartFrame: T.ANSWER_TYPE, sendFrame: T.ANSWER_SEND },
  { text: "hint", typeStartFrame: T.HINT_TYPE, sendFrame: T.HINT_SEND },
  { text: "check", typeStartFrame: T.CHECK1_TYPE, sendFrame: T.CHECK1_SEND },
  { text: "check", typeStartFrame: T.CHECK2_TYPE, sendFrame: T.CHECK2_SEND },
];

// ── Helpers ─────────────────────────────────────────────
function getCodeForFrame(f: number): string {
  if (f < T.CODE_TYPE_START) return CODE_SKELETON;
  if (f <= T.CODE_TYPE_END) {
    const p = Math.min((f - T.CODE_TYPE_START) / (T.CODE_TYPE_END - T.CODE_TYPE_START), 1);
    return CODE_SKELETON.replace("        // TODO: Implement", TYPED_CODE.slice(0, Math.floor(p * TYPED_CODE.length)));
  }
  if (f < T.FIX_STEP1) return CODE_SKELETON.replace("        // TODO: Implement", TYPED_CODE);
  if (f < T.FIX_STEP2) return CODE_MID_FIX;
  return CODE_FIXED;
}

function getCursorInfo(f: number) {
  if (f < T.CODE_TYPE_START || f > T.CODE_TYPE_END) return null;
  const p = Math.min((f - T.CODE_TYPE_START) / (T.CODE_TYPE_END - T.CODE_TYPE_START), 1);
  const partial = TYPED_CODE.slice(0, Math.floor(p * TYPED_CODE.length));
  const lines = partial.split("\n");
  return { line: 14 + lines.length - 1, col: lines[lines.length - 1].length };
}

const LH = 22 * 1.65;
const CODE_TOP = 104;

// ── Full-screen use-case title card → shrinks & slides to top, then persists ──
// Three phases: (A) hold at center, (B) shrink+slide to top, (C) persist as compact badge
const UseCaseCard: React.FC<{
  num: string; title: string; sub: string; badgeTitle: string;
  frame: number; startFrame: number; endFrame: number; persistUntil: number; fps: number;
}> = ({ num, title, sub, badgeTitle, frame, startFrame, endFrame, persistUntil, fps }) => {
  const dur = endFrame - startFrame;
  const holdEnd = startFrame + Math.floor(dur * 0.55); // center hold (longer)
  const shrinkEnd = startFrame + Math.floor(dur * 0.72); // shrink finishes (faster)
  const transEnd = startFrame + Math.floor(dur * 0.85); // slide finishes (faster)

  const fadeIn = interpolate(frame, [startFrame, startFrame + 15], [0, 1], EC);
  const s = spring({ frame: Math.max(0, frame - startFrame), fps, config: { damping: 18, mass: 0.8 } });

  // Fade out near the end of the persist phase
  const fadeOut = interpolate(frame, [persistUntil - 15, persistUntil], [1, 0], EC);
  if (fadeIn <= 0 || frame >= persistUntil) return null;

  // After endFrame, lock all animations to their final values (compact badge state)
  const isPersisting = frame >= endFrame;

  // Sub-phase A: shrink at center (holdEnd → shrinkEnd)
  const shrinkProg = isPersisting ? 1 : (frame <= holdEnd ? 0 : interpolate(frame, [holdEnd, shrinkEnd], [0, 1], EC));
  // Sub-phase B: slide up (shrinkEnd → transEnd) — ease-out for snappy movement
  const slideRaw = isPersisting ? 1 : (frame <= shrinkEnd ? 0 : interpolate(frame, [shrinkEnd, transEnd], [0, 1], EC));
  const slideProg = Easing.out(Easing.cubic)(slideRaw);

  // Position: stays at center during shrink, then slides up to badge position
  const yPos = interpolate(slideProg, [0, 1], [50, 4.5]);

  // Scale: shrinks from 1 to 0.58 during sub-phase A
  const scale = interpolate(shrinkProg, [0, 1], [1, 0.58]);

  // Subtitle fades early in shrink — animate opacity, margin, and height together
  const subOp = interpolate(shrinkProg, [0, 0.35], [1, 0], EC);
  const subMargin = interpolate(shrinkProg, [0, 0.35], [20, 0], EC);
  const subMaxH = interpolate(shrinkProg, [0, 0.35], [120, 0], EC);

  // Background and padding
  const bgOp = interpolate(shrinkProg, [0, 0.5], [0.92, 0.85], EC);
  const padV = interpolate(shrinkProg, [0, 1], [64, 14]);
  const padH = interpolate(shrinkProg, [0, 1], [140, 44]);
  const radius = interpolate(shrinkProg, [0, 1], [24, 20]);

  // Num margin: column gap reduces as it becomes compact
  const numMb = interpolate(shrinkProg, [0, 1], [16, 6]);

  const op = isPersisting ? fadeOut : fadeIn;

  return (
    <AbsoluteFill style={{
      justifyContent: "flex-start", alignItems: "center",
      zIndex: 50, opacity: op, pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute",
        top: `${yPos}%`,
        left: "50%",
        transform: `translate(-50%, -50%) scale(${(isPersisting ? 1 : s) * scale})`,
        background: `rgba(10,10,18,${bgOp})`,
        backdropFilter: "blur(16px)",
        padding: `${padV}px ${padH}px`,
        borderRadius: radius,
        textAlign: "center",
        border: "1px solid rgba(103,221,222,0.2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column" as const,
        alignItems: "center",
      }}>
        <div style={{ color: colors.accent, fontSize: 39, fontFamily: fonts.mono, fontWeight: 700, marginBottom: numMb, letterSpacing: 2, opacity: 0.8 }}>{num}</div>
        <h2 style={{ color: "#fff", fontSize: 81, fontFamily: fonts.heading, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{title}</h2>
        <div style={{ overflow: "hidden", maxHeight: subMaxH, marginTop: subMargin }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 35, fontFamily: fonts.body, margin: 0, opacity: subOp }}>{sub}</p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Persistent stage badge (top center, stays during entire stage) ──
const StageBadge: React.FC<{
  frame: number; stages: typeof STAGE_RANGES;
}> = ({ frame, stages }) => {
  let activeStage: typeof STAGE_RANGES[0] | null = null;
  for (const stage of stages) {
    if (frame >= stage.start && frame < stage.end) {
      activeStage = stage;
      break;
    }
  }
  if (!activeStage) return null;

  // No fade-in — UseCaseCard already transitioned to this position seamlessly
  const fadeOut = interpolate(frame, [activeStage.end - 15, activeStage.end], [1, 0], EC);
  const op = fadeOut;

  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 40,
        opacity: op,
        transform: "none",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          background: "rgba(10, 10, 18, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(103,221,222,0.25)",
          borderRadius: 20,
          padding: "14px 44px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: 2,
            opacity: 0.8,
          }}
        >
          {activeStage.num}
        </span>
        <span
          style={{
            fontFamily: fonts.heading,
            fontSize: 42,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.01em",
          }}
        >
          {activeStage.title}
        </span>
      </div>
    </div>
  );
};

// ── Main ────────────────────────────────────────────────
export const AITutorDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══ HOOK — single flowing intro, all 4 lines on same screen ═══
  // Line 1: "You don't have to solo"
  const hookL1Op = interpolate(frame, [T.HOOK_L1, T.HOOK_L1 + 30, T.HOOK_OUT, T.HOOK_OUT + 25], [0, 1, 1, 0], EC);
  const hookL1Y = interpolate(frame, [T.HOOK_L1, T.HOOK_L1 + 40], [20, 0], { ...EC, easing: Easing.out(Easing.cubic) });
  // Line 2: "your Solidity education anymore."
  const hookL2Op = interpolate(frame, [T.HOOK_L2, T.HOOK_L2 + 30, T.HOOK_OUT, T.HOOK_OUT + 25], [0, 1, 1, 0], EC);
  const hookL2Y = interpolate(frame, [T.HOOK_L2, T.HOOK_L2 + 40], [20, 0], { ...EC, easing: Easing.out(Easing.cubic) });
  // Line 3: "Now you can duo with your agent"  — appears while lines 1-2 still visible
  const duoL1Op = interpolate(frame, [T.DUO_L1, T.DUO_L1 + 25, T.HOOK_OUT, T.HOOK_OUT + 25], [0, 1, 1, 0], EC);
  const duoL1Y = interpolate(frame, [T.DUO_L1, T.DUO_L1 + 35], [18, 0], { ...EC, easing: Easing.out(Easing.cubic) });
  // Line 4: "and speedrun it!"
  const duoL2Op = interpolate(frame, [T.DUO_L2, T.DUO_L2 + 25, T.HOOK_OUT, T.HOOK_OUT + 25], [0, 1, 1, 0], EC);
  const duoL2Y = interpolate(frame, [T.DUO_L2, T.DUO_L2 + 35], [18, 0], { ...EC, easing: Easing.out(Easing.cubic) });

  // IDE — slow entrance
  const ideOp = interpolate(frame, [T.IDE_IN, T.IDE_IN + 50], [0, 1], EC);
  const ideY = interpolate(
    spring({ frame: Math.max(0, frame - T.IDE_IN), fps, config: { damping: 22, mass: 1.2 } }),
    [0, 1], [30, 0]
  );

  // Camera — gentle pushes
  const cam = getCamera(frame);

  // Bug highlight — soft red glow
  const bugHlOp = interpolate(frame, [T.BUG_HL, T.BUG_HL + 20, T.FIX_STEP1 - 10, T.FIX_STEP1], [0, 0.22, 0.22, 0], EC);
  // Removal flash — disabled (bug highlight fade-out provides sufficient feedback)
  const removeFlash = 0;
  // Addition flash — subtle green pulse
  const addFlash = interpolate(frame, [T.FIX_STEP2, T.FIX_STEP2 + 8, T.FIX_STEP2 + 28], [0, 0.25, 0], EC);

  // Success — controlled spring
  const successScale = spring({ frame: Math.max(0, frame - T.SUCCESS), fps, config: { damping: 20, mass: 0.8 } });
  const successOp = interpolate(frame, [T.SUCCESS, T.SUCCESS + 8, T.OUTRO - 3, T.OUTRO], [0, 1, 1, 0], EC);

  // Outro — slow, final
  const outroOp = interpolate(frame, [T.OUTRO, T.OUTRO + 40], [0, 1], EC);
  const outroIdeFade = frame >= T.OUTRO ? 1 - outroOp : 1;
  const ctaScale = spring({ frame: Math.max(0, frame - T.OUTRO - 25), fps, config: { damping: 20, mass: 1 } });

  const code = getCodeForFrame(frame);
  const cursorInfo = getCursorInfo(frame);
  const SEND_X = 1855, SEND_Y = 1008;

  return (
    <AbsoluteFill style={{ background: "#0a0a12" }}>
      <Audio src={staticFile("ai-tutor-video-music.mp3")} volume={0.18} />

      {/* Click SFX — on send */}
      {[T.START_SEND, T.READY_SEND, T.ANSWER_SEND, T.HINT_SEND, T.CHECK1_SEND, T.CHECK2_SEND].map((f, i) => (
        <Sequence key={`clk-${i}`} from={f} durationInFrames={30}><Audio src={CLICK_SFX} volume={0.2} /></Sequence>
      ))}
      {/* Typing SFX — continuous mechanical typing loop during code writing */}
      <Sequence from={T.CODE_TYPE_START} durationInFrames={T.CODE_TYPE_END - T.CODE_TYPE_START}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Sequence key={`type-loop-${i}`} from={i * 90}>
            <Audio src={TAP_SFX} volume={0.15} />
          </Sequence>
        ))}
      </Sequence>
      {/* Typing SFX — user chat input fast typing */}
      {INPUT_ACTIONS.map((action, idx) => {
        const dur = action.sendFrame - action.typeStartFrame;
        return (
          <Sequence key={`usr-tap-${idx}`} from={action.typeStartFrame} durationInFrames={dur}>
            <Audio src={TAP_SFX} volume={0.15} />
          </Sequence>
        );
      })}

      {/* ═══ COMBINED INTRO + HOOK — SRE gradient background ═══ */}
      {frame < T.HOOK_OUT + 30 && (() => {
        // Intro sprite animations
        const introFadeIn = interpolate(frame, [0, 12], [0, 1], EC);
        const spriteScale = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
        const titleOp = interpolate(frame, [18, 38], [0, 1], EC);
        const titleY = interpolate(frame, [18, 38], [15, 0], { ...EC, easing: Easing.out(Easing.cubic) });
        // Whole scene fades out at HOOK_OUT
        const sceneOut = interpolate(frame, [T.HOOK_OUT, T.HOOK_OUT + 25], [1, 0], EC);

        return (
          <AbsoluteFill style={{
            background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
            opacity: introFadeIn * sceneOut,
            zIndex: 60,
          }}>
            {/* Floating background particles */}
            {Array.from({ length: 8 }, (_, i) => {
              const baseX = (i * 240 + 80) % 1920;
              const baseY = 80 + (i * 170) % 750;
              const offsetY = Math.sin(frame * 0.03 + i * 1.2) * 25;
              const sz = 6 + (i % 4) * 5;
              return (
                <div key={`p-${i}`} style={{
                  position: "absolute", left: baseX, top: baseY + offsetY,
                  width: sz, height: sz, borderRadius: 2,
                  background: i % 2 === 0 ? colors.accent : colors.primaryLight,
                  opacity: 0.15, zIndex: 0,
                }} />
              );
            })}
            {/* ── Top half: Sprite + Title (in white area) ── */}
            <div style={{
              position: "absolute",
              top: -38, left: 0, right: 0,
              height: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <div style={{ transform: `scale(${spriteScale})`, marginBottom: 36 }}>
                <PixelGirlSprite size={240} />
              </div>
              <div style={{
                opacity: titleOp,
                transform: `translateY(${titleY}px)`,
              }}>
                <h1 style={{
                  fontFamily: serifFont,
                  fontSize: 108,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}>
                  AI Tutor mode
                </h1>
              </div>
            </div>

            <div style={{
              position: "absolute",
              bottom: 38, left: 0, right: 0,
              height: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
              {/* Line 1: "If you don't want to solo" */}
              <div style={{ opacity: hookL1Op, transform: `translateY(${hookL1Y}px)`, textAlign: "center" }}>
                <h1 style={{ fontFamily: fonts.heading, fontSize: 64, fontWeight: 800, margin: 0, color: colors.textPrimary, letterSpacing: "-0.02em" }}>
                  If you don't want to <span style={{ color: colors.textMuted, fontStyle: "italic" }}>solo</span>
                </h1>
              </div>
              {/* Line 2: "your Solidity education" */}
              <div style={{ opacity: hookL2Op, transform: `translateY(${hookL2Y}px)`, textAlign: "center", marginTop: 8 }}>
                <h2 style={{ fontFamily: fonts.heading, fontSize: 44, fontWeight: 500, margin: 0, color: colors.textSecondary }}>your Solidity education.</h2>
              </div>

              {/* Spacer */}
              <div style={{ height: 28 }} />

              {/* Line 3: "You can now activate AI Tutor mode" */}
              <div style={{ opacity: duoL1Op, transform: `translateY(${duoL1Y}px)`, textAlign: "center" }}>
                <h1 style={{ fontFamily: fonts.heading, fontSize: 56, fontWeight: 800, margin: 0, color: colors.textPrimary }}>
                  You can now activate <span style={{ color: colors.primary }}>AI Tutor mode</span>
                </h1>
              </div>
              {/* Line 4: "and speedrun it in duo" */}
              <div style={{ opacity: duoL2Op, transform: `translateY(${duoL2Y}px)`, textAlign: "center", marginTop: 12 }}>
                <h2 style={{ fontFamily: fonts.heading, fontSize: 48, fontWeight: 700, margin: 0, color: colors.primary }}>and speedrun it in duo</h2>
              </div>
            </div>
            {/* Bottom teal bar */}
            <div style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 60,
              background: `linear-gradient(180deg, ${colors.accent}44, ${colors.primary})`,
              zIndex: 0,
            }} />
          </AbsoluteFill>
        );
      })()}

      {/* ═══ USE-CASE TITLE CARDS (animate to top, then persist as compact badge) ═══ */}
      {UC_CARDS.map((uc) => <UseCaseCard key={uc.num} {...uc} frame={frame} startFrame={uc.start} endFrame={uc.end} persistUntil={uc.persistUntil} fps={fps} />)}

      {/* ═══ IDE ═══ */}
      {frame >= T.IDE_IN && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", opacity: ideOp * outroIdeFade, transform: `translateY(${ideY}px)`, padding: 20 }}>
          <div style={{
            width: 1920 - 40, height: 1080 - 40,
            transform: `scale(${cam.scale}) translate(${cam.tx}px, ${cam.ty}px)`, transformOrigin: `${cam.ox}% ${cam.oy}%`,
            borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.5)", position: "relative",
          }}>
            <CursorIDEChrome
              codeEditor={<CodeEditor code={code} fontSize={22} showCursor={cursorInfo !== null} cursorLine={cursorInfo?.line} cursorCol={cursorInfo?.col} />}
              chatPanel={<CursorChatPanel messages={MESSAGES} inputActions={INPUT_ACTIONS} />}
            />

            {/* Red highlight on buggy mapping line (index 14) */}
            {bugHlOp > 0 && (
              <div style={{
                position: "absolute", top: CODE_TOP + 14 * LH, left: 300, width: 972, height: LH,
                backgroundColor: `rgba(255,70,70,${bugHlOp})`,
                borderLeft: `3px solid rgba(255,70,70,${Math.min(bugHlOp * 3, 0.7)})`,
                pointerEvents: "none",
              }} />
            )}
            {/* Red removal pulse (line removed from function) */}
            {removeFlash > 0 && (
              <div style={{
                position: "absolute", top: CODE_TOP + 14 * LH, left: 300, width: 972, height: LH,
                backgroundColor: `rgba(255,70,70,${removeFlash})`,
                borderLeft: "3px solid rgba(255,70,70,0.6)", pointerEvents: "none",
              }} />
            )}
            {/* Green addition pulse (line added at contract level, index 5) */}
            {addFlash > 0 && (
              <div style={{
                position: "absolute", top: CODE_TOP + 5 * LH, left: 300, width: 972, height: LH,
                backgroundColor: `rgba(39,201,63,${addFlash})`,
                borderLeft: "3px solid rgba(39,201,63,0.6)", pointerEvents: "none",
              }} />
            )}

            {/* Mouse cursor — controlled click on send */}
            {INPUT_ACTIONS.map((action, i) => (
              <Sequence key={`cur-${i}`} from={action.sendFrame - 20} durationInFrames={35}>
                <AnimatedCursor positions={[{ x: SEND_X - 50, y: SEND_Y - 12, frame: 0 }, { x: SEND_X, y: SEND_Y, frame: 20 }]} clickAtEnd size={18} />
              </Sequence>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SUCCESS + CONFETTI ═══ */}
      {frame >= T.SUCCESS && frame < T.OUTRO + 10 && (
        <>
          <Confetti startFrame={T.SUCCESS} durationFrames={T.OUTRO - T.SUCCESS} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none", zIndex: 20, opacity: successOp }}>
            <div style={{ backgroundColor: "rgba(8,132,132,0.94)", padding: "20px 60px", borderRadius: 100, transform: `scale(${successScale})`, boxShadow: "0 16px 48px rgba(8,132,132,0.3)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#fff", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span style={{ color: colors.primary, fontSize: 22, fontWeight: "bold" }}>✓</span>
              </div>
              <span style={{ color: "#fff", fontSize: 42, fontFamily: fonts.heading, fontWeight: 800 }}>Checkpoint 1 Complete!</span>
            </div>
          </AbsoluteFill>
        </>
      )}

      {/* ═══ OUTRO ═══ */}
      {frame >= T.OUTRO && (
        <AbsoluteFill style={{
          background: `linear-gradient(180deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
          opacity: outroOp,
          zIndex: 30,
        }}>
          {/* Floating background particles */}
          {Array.from({ length: 8 }, (_, i) => {
            const baseX = (i * 240 + 80) % 1920;
            const baseY = 80 + (i * 170) % 750;
            const offsetY = Math.sin(frame * 0.03 + i * 1.2) * 25;
            const sz = 6 + (i % 4) * 5;
            return (
              <div key={`op-${i}`} style={{
                position: "absolute", left: baseX, top: baseY + offsetY,
                width: sz, height: sz, borderRadius: 2,
                background: i % 2 === 0 ? colors.accent : colors.primaryLight,
                opacity: 0.15, zIndex: 0,
              }} />
            );
          })}
          {/* ── Top: Sprite + speedrunethereum.com ── */}
          <div style={{
            position: "absolute",
            top: -76, left: 0, right: 0,
            height: "40%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            transform: `scale(${ctaScale})`,
          }}>
            <Sequence from={T.OUTRO} layout="none">
              <PixelGirlSprite size={160} />
            </Sequence>
            <h2 style={{
              fontFamily: fonts.heading,
              fontSize: 48,
              fontWeight: 700,
              color: colors.primary,
              margin: 0,
              letterSpacing: "-0.01em",
            }}>
              speedrunethereum.com
            </h2>
          </div>

          {/* ── Center: Main CTA text ── */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "6%", // Pushes it slightly below true center, but much higher than before
            transform: `scale(${ctaScale})`,
          }}>
            <h1 style={{ fontFamily: serifFont, color: colors.textPrimary, fontSize: 96, margin: 0, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, textAlign: "center" }}>
              Learn Solidity with<br /><span style={{ color: colors.primary }}>your AI tutor</span>
            </h1>
            <p style={{ fontFamily: fonts.body, color: colors.textSecondary, fontSize: 33, marginTop: 30, textAlign: "center" }}>Interactive challenges · Code reviews · Guided learning</p>
          </div>
          {/* Bottom teal bar */}
          <div style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 60,
            background: `linear-gradient(180deg, ${colors.accent}44, ${colors.primary})`,
            zIndex: 0,
          }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
