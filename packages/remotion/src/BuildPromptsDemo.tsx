import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { StepLabel } from "./components/StepLabel";
import { ChooseAndCopyScene } from "./scenes/ChooseAndCopyScene";
import { ClaudePasteScene } from "./scenes/ClaudePasteScene";
import { OutputShowcaseScene } from "./scenes/OutputShowcaseScene";
import { CTAScene } from "./scenes/CTAScene";

// Scene durations (in frames at 30fps)
const CHOOSE_COPY_DURATION = 370; // ~12.3s — hook text + 3D scroll-in + card + copy
const CLAUDE_PASTE_DURATION = 240; // 8s
const OUTPUT_SHOWCASE_DURATION = 555; // ~18.5s (4×150 - 3×15 transitions)
const CTA_DURATION = 150; // 5s

const TRANSITION_DURATION = 15; // 0.5s

export const BuildPromptsDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0b1e" }}>
      {/* Background music */}
      <Audio
        src={staticFile("build-prompts-8bit-music.mp3")}
        volume={0.3}
      />
      <TransitionSeries>
        {/* Scene 1: Hook + Choose Build + Copy Prompt */}
        <TransitionSeries.Sequence durationInFrames={CHOOSE_COPY_DURATION}>
          <ChooseAndCopyScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Claude Code Paste */}
        <TransitionSeries.Sequence durationInFrames={CLAUDE_PASTE_DURATION}>
          <ClaudePasteScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Output Showcase (contains internal transitions) */}
        <TransitionSeries.Sequence durationInFrames={OUTPUT_SHOWCASE_DURATION}>
          <OutputShowcaseScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: CTA */}
        <TransitionSeries.Sequence durationInFrames={CTA_DURATION}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Workflow step labels */}
      <Sequence from={70} durationInFrames={155}>
        <StepLabel step="STEP 1" text="Choose a Build" duration={155} />
      </Sequence>
      <Sequence from={240} durationInFrames={75}>
        <StepLabel step="STEP 2" text="Copy the Prompt" duration={75} />
      </Sequence>
      <Sequence from={370} durationInFrames={70}>
        <StepLabel step="STEP 3" text="Paste & Let AI Build" duration={70} />
      </Sequence>
    </AbsoluteFill>
  );
};
