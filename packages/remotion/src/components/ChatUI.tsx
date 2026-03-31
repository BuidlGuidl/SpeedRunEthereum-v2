import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { TypewriterText } from "./TypewriterText";
import { colors, fonts } from "../theme";

export type ChatMessage = {
  id: string;
  role: "user" | "tutor";
  text: string;
  startFrame: number;
};

export const ChatUI: React.FC<{ messages: ChatMessage[]; containerWidth?: number }> = ({ messages, containerWidth = 800 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      width: containerWidth,
      backgroundColor: "#1e1e1e",
      borderRadius: 16,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      overflow: "hidden",
      border: "1px solid #333",
      display: "flex",
      flexDirection: "column",
      maxHeight: 700
    }}>
      {/* Header */}
      <div style={{ height: 40, backgroundColor: "#2d2d2d", display: "flex", alignItems: "center", padding: "0 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />
        </div>
        <span style={{ fontFamily: fonts.mono, color: "#888", fontSize: 14, marginLeft: "auto", marginRight: "auto" }}>
          AI Tutor Chat
        </span>
      </div>

      {/* Messages */}
      <div style={{ padding: 30, flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column", gap: 24 }}>
        {messages.map((msg, index) => {
          if (frame < msg.startFrame) return null;

          const isUser = msg.role === "user";
          const popIn = spring({ frame: frame - msg.startFrame, fps, config: { damping: 12 } });
          const opacity = interpolate(Math.max(0, frame - msg.startFrame), [0, 10], [0, 1]);

          return (
            <div key={msg.id} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isUser ? "flex-end" : "flex-start",
              opacity,
              transform: `scale(${popIn})`,
              transformOrigin: isUser ? "bottom right" : "bottom left"
            }}>
              <div style={{
                backgroundColor: isUser ? colors.claudePurple : "#2d2d2d",
                color: isUser ? "#fff" : colors.claudeGreen,
                padding: "16px 24px",
                borderRadius: 16,
                borderBottomRightRadius: isUser ? 4 : 16,
                borderBottomLeftRadius: isUser ? 16 : 4,
                maxWidth: "85%",
                fontFamily: fonts.mono,
                fontSize: 22,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap"
              }}>
                <TypewriterText 
                  text={msg.text} 
                  startFrame={msg.startFrame + 5} 
                  charsPerFrame={isUser ? 3 : 1.5} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
