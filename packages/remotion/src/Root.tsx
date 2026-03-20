import { Composition } from "remotion";
import { BuildPromptsDemo } from "./BuildPromptsDemo";

// Total duration calculation:
// Scenes: 210 + 180 + 240 + 555 + 150 = 1335 frames
// Minus transitions: 4 transitions × 15 frames = 60 frames
// Total: 1335 - 60 = 1275 frames ≈ 42.5 seconds
const TOTAL_DURATION = 1275;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BuildPromptsDemo"
      component={BuildPromptsDemo}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
