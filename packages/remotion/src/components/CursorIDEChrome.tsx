import React from "react";
import { fonts } from "../theme";

const COLORS = {
  titleBar: "#323233",
  activityBar: "#333333",
  sidebar: "#252526",
  border: "#3e3e42",
  text: "#cccccc",
  textDim: "#888888",
  activeFile: "#ffffff",
  folderIcon: "#dcb67a",
  fileIcon: "#519aba",
  dot: { red: "#ff5f56", yellow: "#ffbd2e", green: "#27c93f" },
};

type Props = {
  codeEditor: React.ReactNode;
  chatPanel: React.ReactNode;
  activeFile?: string;
};

// ── Sidebar file tree ──────────────────────────────────
const FileTreeItem: React.FC<{
  name: string;
  isFolder?: boolean;
  indent?: number;
  isActive?: boolean;
  isOpen?: boolean;
}> = ({ name, isFolder, indent = 0, isActive, isOpen }) => (
  <div
    style={{
      fontFamily: fonts.mono,
      fontSize: 19,
      color: isActive ? COLORS.activeFile : COLORS.text,
      padding: "4px 10px",
      paddingLeft: 14 + indent * 20,
      backgroundColor: isActive ? "#37373d" : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap",
    }}
  >
    {isFolder && (
      <span style={{ color: COLORS.textDim, fontSize: 14 }}>{isOpen ? "▼" : "▶"}</span>
    )}
    <span style={{ color: isFolder ? COLORS.folderIcon : COLORS.fileIcon, fontSize: 20 }}>
      {isFolder ? "📁" : "📄"}
    </span>
    {name}
  </div>
);

export const CursorIDEChrome: React.FC<Props> = ({
  codeEditor,
  chatPanel,
  activeFile = "CrowdFund.sol",
}) => {
  const titleBarH = 44;
  const tabBarH = 48;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e1e1e",
        overflow: "hidden",
        borderRadius: 12,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* ── Title bar ── */}
      <div
        style={{
          height: titleBarH,
          backgroundColor: COLORS.titleBar,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.dot.red }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.dot.yellow }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.dot.green }} />
        </div>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 17,
            color: COLORS.textDim,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          Cursor — crowdfunding-foundry
        </span>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── Sidebar ── */}
        <div
          style={{
            width: 300,
            backgroundColor: COLORS.sidebar,
            borderRight: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "12px 14px",
              fontFamily: fonts.mono,
              fontSize: 15,
              color: COLORS.textDim,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 600,
            }}
          >
            Explorer
          </div>

          {/* File tree */}
          <FileTreeItem name="contracts" isFolder isOpen indent={0} />
          <FileTreeItem name="CrowdFund.sol" indent={1} isActive={activeFile === "CrowdFund.sol"} />
          <FileTreeItem name="FundingRecipient.sol" indent={1} />
          <FileTreeItem name="deployments" isFolder indent={0} />
          <FileTreeItem name="test" isFolder isOpen indent={0} />
          <FileTreeItem name="CrowdFund.t.sol" indent={1} />
          <FileTreeItem name="foundry.toml" indent={0} />
          <FileTreeItem name="package.json" indent={0} />
        </div>

        {/* ── Editor + Chat split ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab bar (above code editor only) */}
          <div
            style={{
              height: tabBarH,
              backgroundColor: "#252526",
              display: "flex",
              alignItems: "stretch",
              borderBottom: `1px solid ${COLORS.border}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#1e1e1e",
                borderRight: `1px solid ${COLORS.border}`,
                borderTop: "2px solid #007acc",
              }}
            >
              <span style={{ color: COLORS.fileIcon, fontSize: 20 }}>📄</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 19, color: COLORS.text }}>
                {activeFile}
              </span>
              <span style={{ color: COLORS.textDim, fontSize: 17, marginLeft: 8 }}>×</span>
            </div>
          </div>

          {/* ── Split: Code + Chat ── */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Code editor area */}
            <div style={{ flex: 6, overflow: "hidden" }}>{codeEditor}</div>

            {/* Chat panel */}
            <div style={{ flex: 4, overflow: "hidden" }}>{chatPanel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
