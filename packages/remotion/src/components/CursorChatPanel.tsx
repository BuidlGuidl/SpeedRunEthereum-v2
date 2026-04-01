import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { fonts } from "../theme";

// ── Types ──────────────────────────────────────────────
export type ChatMsg = {
  id: string;
  role: "user" | "ai";
  text: string;
  appearFrame: number;
  streamCharsPerFrame?: number; // AI messages stream speed
};

export type InputAction = {
  text: string;
  typeStartFrame: number;
  sendFrame: number;
};

type Props = {
  messages: ChatMsg[];
  inputActions: InputAction[];
  width?: number;
  height?: number;
};

// ── Styles ─────────────────────────────────────────────
const COLORS = {
  bg: "#1e1e1e",
  headerBg: "#252526",
  inputBg: "#2a2a2a",
  border: "#3e3e42",
  text: "#cccccc",
  textDim: "#888888",
  userBubble: "#2d2f3a",
  aiBubble: "transparent",
  accent: "#007acc",
  sendBtn: "#666",
  sendBtnHover: "#007acc",
  aiLabel: "#c084fc",
  userLabel: "#60a5fa",
};

// ── Send Button SVG ────────────────────────────────────
const SendArrow: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 18V4M11 4L5 10M11 4L17 10"
      stroke={active ? "#fff" : COLORS.sendBtn}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Component ──────────────────────────────────────────
// Helper: smoothly compute displayed character count to avoid integer jumps
// Uses linear interpolation between whole characters so the last char fades in
function smoothCharCount(elapsed: number, charsPerFrame: number, totalChars: number): { count: number; partialOpacity: number } {
  const rawChars = elapsed * charsPerFrame;
  const count = Math.min(Math.floor(rawChars), totalChars);
  const partialOpacity = count < totalChars ? Math.min(rawChars - count, 1) : 0;
  return { count, partialOpacity };
}

export const CursorChatPanel: React.FC<Props> = ({
  messages,
  inputActions,
  width,
  height = 1000,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerH = 60;
  const inputAreaH = 140;
  const messagesH = height - headerH - inputAreaH;

  // ── Current input state ──
  let currentInputText = "";
  let sendBtnActive = false;
  let showCursorInInput = false;

  for (const action of inputActions) {
    if (frame >= action.typeStartFrame && frame < action.sendFrame) {
      const elapsed = frame - action.typeStartFrame;
      const charsPerFrame = action.text.length / ((action.sendFrame - action.typeStartFrame) * 0.7);
      const chars = Math.min(Math.floor(elapsed * charsPerFrame), action.text.length);
      currentInputText = action.text.slice(0, chars);
      showCursorInInput = true;
      sendBtnActive = chars >= action.text.length;
    }
  }

  // ── Visible messages ──
  const visibleMessages = messages.filter((m) => frame >= m.appearFrame);

  // ── Compute scroll — use displayed (streamed) text length for smooth follow ──
  let totalMsgHeight = 0;
  const msgHeights = visibleMessages.map((msg) => {
    let displayedLen = msg.text.length;
    if (msg.role === "ai" && msg.streamCharsPerFrame) {
      const elapsed = Math.max(0, frame - msg.appearFrame);
      displayedLen = Math.min(
        Math.round(elapsed * msg.streamCharsPerFrame),
        msg.text.length
      );
    }
    // Account for explicit \n line breaks AND character wrapping
    const displayedText = msg.text.slice(0, displayedLen);
    const segments = displayedText.split('\n');
    let lineCount = 0;
    for (const seg of segments) {
      lineCount += seg.length > 0 ? Math.ceil(seg.length / 40) : 1;
    }
    lineCount = Math.max(1, lineCount);
    const h = lineCount * 32 + 50;
    totalMsgHeight += h + 16;
    return h;
  });
  const scrollY = Math.max(0, totalMsgHeight - messagesH + 20);

  // ── Blinking input cursor ──
  const inputCursorOpacity = showCursorInInput
    ? interpolate((frame % 30) / 30, [0, 0.49, 0.51, 1], [1, 1, 0, 0])
    : 0;

  return (
    <div
      style={{
        width: width ?? "100%",
        height: "calc(100% - 8px)",
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${COLORS.border}`,
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          height: headerH,
          backgroundColor: COLORS.headerBg,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: `1px solid ${COLORS.border}`,
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: fonts.mono, color: COLORS.text, fontSize: 19, fontWeight: 600 }}>
          Chat
        </span>
        <span style={{ fontFamily: fonts.mono, color: COLORS.textDim, fontSize: 16 }}>
          AI Tutor
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: COLORS.textDim, fontSize: 16 }}>+</span>
          </div>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transform: `translateY(-${scrollY}px)`,
          }}
        >
          {visibleMessages.map((msg) => {
            const isUser = msg.role === "user";
            const popIn = spring({
              frame: frame - msg.appearFrame,
              fps,
              config: { damping: 14 },
            });

            // For AI messages, stream text with sub-character smoothing
            let displayText = msg.text;
            let nextCharOpacity = 0;
            let nextChar = '';
            if (!isUser && msg.streamCharsPerFrame) {
              const elapsed = Math.max(0, frame - msg.appearFrame);
              const { count, partialOpacity } = smoothCharCount(elapsed, msg.streamCharsPerFrame, msg.text.length);
              displayText = msg.text.slice(0, count);
              if (count < msg.text.length && partialOpacity > 0) {
                nextChar = msg.text[count];
                nextCharOpacity = partialOpacity;
              }
            }

            return (
              <div
                key={msg.id}
                style={{
                  opacity: interpolate(frame - msg.appearFrame, [0, 8], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                  transform: `scale(${popIn})`,
                  transformOrigin: isUser ? "bottom right" : "bottom left",
                }}
              >
                {/* Label */}
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 17,
                    color: isUser ? COLORS.userLabel : COLORS.aiLabel,
                    marginBottom: 8,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    lineHeight: 1,
                  }}
                >
                  {isUser ? "You" : "🤖 AI Tutor"}
                  {!isUser && (
                    <span style={{ color: COLORS.textDim, fontWeight: 400, fontSize: 15, lineHeight: 1 }}>
                      Claude Opus 4.6
                    </span>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  style={{
                    backgroundColor: isUser ? COLORS.userBubble : COLORS.aiBubble,
                    padding: isUser ? "12px 18px" : "4px 0",
                    borderRadius: isUser ? 14 : 0,
                    fontFamily: fonts.mono,
                    fontSize: 21,
                    lineHeight: 1.65,
                    color: COLORS.text,
                    whiteSpace: "pre-wrap",
                    borderLeft: isUser ? "none" : `3px solid ${COLORS.aiLabel}40`,
                    paddingLeft: isUser ? 16 : 12,
                  }}
                >
                  {displayText}
                  {nextCharOpacity > 0 && (
                    <span style={{ opacity: nextCharOpacity }}>{nextChar}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Input area ── */}
      <div
        style={{
          height: inputAreaH,
          borderTop: `1px solid ${COLORS.border}`,
          padding: "8px 12px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* Model selector row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 15,
              color: COLORS.textDim,
              backgroundColor: "#333",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            ○○ Agent
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 15, color: COLORS.textDim }}>
            Auto ▾
          </span>
        </div>

        {/* Input field + send button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: COLORS.inputBg,
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            padding: "12px 16px",
            flex: 1,
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            {currentInputText ? (
              <span style={{ fontFamily: fonts.mono, fontSize: 23, color: COLORS.text }}>
                {currentInputText}
                <span style={{ opacity: inputCursorOpacity, color: "#aeafad" }}>|</span>
              </span>
            ) : (
              <span style={{ fontFamily: fonts.mono, fontSize: 23, color: "#555" }}>
                Type a message...
              </span>
            )}
          </div>

          {/* Send button */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: sendBtnActive ? "#088484" : "transparent",
              border: `2px solid ${sendBtnActive ? "#088484" : COLORS.border}`,
              boxShadow: sendBtnActive ? "0 0 14px rgba(8, 132, 132, 0.5)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <SendArrow active={sendBtnActive} />
          </div>
        </div>
      </div>
    </div>
  );
};
