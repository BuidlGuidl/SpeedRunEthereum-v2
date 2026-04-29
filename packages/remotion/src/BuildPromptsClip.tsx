import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BuildPromptsDemo } from "./BuildPromptsDemo";

// Clip window (frames in the original BuildPromptsDemo timeline)
// 170 = build prompts page fully settled, just before the cursor appears
// 595 = end of the Claude Code paste (CLI terminal) scene
export const CLIP_START = 355;
export const CLIP_END = 565;
export const CLIP_DURATION = CLIP_END - CLIP_START; // 210 frames = 7s @30fps

export const BuildPromptsClip: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b1e" }}>
      <Sequence from={-CLIP_START}>
        <BuildPromptsDemo hideStepLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
