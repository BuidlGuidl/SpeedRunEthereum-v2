import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { PortfolioCardScene } from "./scenes/PortfolioCardScene";
import { BuildPromptsPageScene } from "./scenes/BuildPromptsPageScene";
import { ClaudePasteScene } from "./scenes/ClaudePasteScene";
import { OutputShowcaseScene } from "./scenes/OutputShowcaseScene";
import { CTAScene } from "./scenes/CTAScene";

// Scene durations (in frames at 30fps)
const INTRO_DURATION = 210; // 7s — hook text + fly-in + scroll down
const PORTFOLIO_DURATION = 120; // 4s
const BUILD_PROMPTS_DURATION = 300; // 10s
const CLAUDE_PASTE_DURATION = 240; // 8s
const OUTPUT_SHOWCASE_DURATION = 555; // ~18.5s (4×150 - 3×15 transitions)
const CTA_DURATION = 150; // 5s

const TRANSITION_DURATION = 15; // 0.5s

export const BuildPromptsDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b1e" }}>
      {/* Background music */}
      <Audio
        src={staticFile("echoes-in-blue-by-tokyo-music-walker-chosic.com_.mp3")}
        volume={0.3}
      />
      <TransitionSeries>
        {/* Scene 1: Hook / Intro */}
        <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Portfolio Card */}
        <TransitionSeries.Sequence durationInFrames={PORTFOLIO_DURATION}>
          <PortfolioCardScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Build Prompts Page */}
        <TransitionSeries.Sequence durationInFrames={BUILD_PROMPTS_DURATION}>
          <BuildPromptsPageScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Claude Code Paste */}
        <TransitionSeries.Sequence durationInFrames={CLAUDE_PASTE_DURATION}>
          <ClaudePasteScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5: Output Showcase (contains internal transitions) */}
        <TransitionSeries.Sequence durationInFrames={OUTPUT_SHOWCASE_DURATION}>
          <OutputShowcaseScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 6: CTA */}
        <TransitionSeries.Sequence durationInFrames={CTA_DURATION}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
