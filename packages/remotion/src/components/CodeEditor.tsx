import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { fonts } from "../theme";

// VS Code Dark+ theme colors
const C = {
  keyword: "#C586C0",
  type: "#4EC9B0",
  string: "#CE9178",
  number: "#B5CEA8",
  comment: "#6A9955",
  func: "#DCDCAA",
  variable: "#9CDCFE",
  builtin: "#4FC1FF",
  default: "#D4D4D4",
  lineNum: "#858585",
  bg: "#1e1e1e",
  activeLine: "#2a2d2e",
  cursor: "#aeafad",
};

const KEYWORDS = new Set([
  "pragma", "solidity", "contract", "function", "public", "private",
  "internal", "external", "view", "pure", "returns", "return",
  "if", "else", "revert", "require", "payable", "constructor",
  "error", "import", "receive", "bool", "emit", "is", "override",
  "virtual", "immutable", "memory", "storage", "new",
]);
const TYPES = new Set(["uint256", "uint", "address", "bool", "string", "bytes", "bytes32"]);
const BUILTINS = new Set(["msg", "block", "tx", "this", "true", "false"]);

const tokenizeLine = (line: string): Array<{ text: string; color: string }> => {
  if (line.trimStart().startsWith("//")) {
    return [{ text: line, color: C.comment }];
  }

  const tokens: Array<{ text: string; color: string }> = [];
  // Split keeping delimiters (whitespace, operators, braces)
  const parts = line.split(/(\s+|[{}(),.;=<>!+\-*/&|^~])/);

  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, color: C.default });
    } else if (KEYWORDS.has(part)) {
      tokens.push({ text: part, color: C.keyword });
    } else if (TYPES.has(part)) {
      tokens.push({ text: part, color: C.type });
    } else if (BUILTINS.has(part)) {
      tokens.push({ text: part, color: C.builtin });
    } else if (/^\d+$/.test(part)) {
      tokens.push({ text: part, color: C.number });
    } else if (/^["']/.test(part)) {
      tokens.push({ text: part, color: C.string });
    } else if (/^[{}(),.;=<>!+\-*/&|^~]$/.test(part)) {
      tokens.push({ text: part, color: C.default });
    } else {
      tokens.push({ text: part, color: C.variable });
    }
  }
  return tokens;
};

type CodeEditorProps = {
  code: string;
  fontSize?: number;
  showCursor?: boolean;
  cursorLine?: number;
  cursorCol?: number;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  fontSize = 18,
  showCursor = false,
  cursorLine,
  cursorCol,
}) => {
  const frame = useCurrentFrame();
  const lines = code.split("\n");
  const lineHeight = fontSize * 1.65;
  const gutterWidth = 55;

  // Blinking cursor
  const cursorOpacity = showCursor
    ? interpolate((frame % 30) / 30, [0, 0.49, 0.51, 1], [1, 1, 0, 0])
    : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: C.bg,
        fontFamily: fonts.mono,
        fontSize,
        lineHeight: `${lineHeight}px`,
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* Line numbers gutter */}
      <div
        style={{
          width: gutterWidth,
          flexShrink: 0,
          paddingTop: 12,
          textAlign: "right",
          paddingRight: 12,
          color: C.lineNum,
          userSelect: "none",
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ height: lineHeight }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code area */}
      <div style={{ flex: 1, paddingTop: 12, paddingLeft: 8, overflow: "hidden" }}>
        {lines.map((line, i) => {
          const isActiveLine = showCursor && cursorLine === i;
          const tokens = tokenizeLine(line);

          return (
            <div
              key={i}
              style={{
                height: lineHeight,
                backgroundColor: isActiveLine ? C.activeLine : "transparent",
                whiteSpace: "pre",
                position: "relative",
              }}
            >
              {tokens.map((t, j) => (
                <span key={j} style={{ color: t.color }}>
                  {t.text}
                </span>
              ))}
              {isActiveLine && cursorCol !== undefined && (
                <span
                  style={{
                    position: "absolute",
                    left: cursorCol * fontSize * 0.6 + 2,
                    top: 0,
                    width: 2,
                    height: lineHeight,
                    backgroundColor: C.cursor,
                    opacity: cursorOpacity,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
