import { Composition } from "remotion";
import { BuildPromptsDemo } from "./BuildPromptsDemo";

// Total duration calculation:
// Scenes: 210 + 120 + 300 + 240 + 555 + 150 = 1575 frames
// Minus transitions: 5 transitions × 15 frames = 75 frames
// Total: 1575 - 75 = 1500 frames = 50 seconds
const TOTAL_DURATION = 1500;

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
