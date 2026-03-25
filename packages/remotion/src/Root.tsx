import { Composition } from "remotion";
import { BuildPromptsDemo } from "./BuildPromptsDemo";

// Total duration calculation:
// Scenes: 370 + 240 + 555 + 150 = 1315 frames
// Minus transitions: 3 transitions × 15 frames = 45 frames
// Total: 1315 - 45 = 1270 frames ≈ 42.3 seconds
const TOTAL_DURATION = 1270;

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
