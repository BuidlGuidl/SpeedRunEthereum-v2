import { Composition } from "remotion";
import { BuildPromptsDemo } from "./BuildPromptsDemo";
import { AITutorDemo, AITUTOR_TOTAL_DURATION } from "./AITutorDemo";
import {
  FoundryAnnouncement,
  FOUNDRY_TOTAL_DURATION,
} from "./FoundryAnnouncement";
import {
  FoundryAnnouncementV2,
  FOUNDRY_V2_TOTAL_DURATION,
} from "./FoundryAnnouncementV2";

// Total duration calculation:
// Scenes: 370 + 240 + 555 + 150 = 1315 frames
// Minus transitions: 3 transitions × 15 frames = 45 frames
// Total: 1315 - 45 = 1270 frames ≈ 42.3 seconds
const TOTAL_DURATION = 1270;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BuildPromptsDemo"
        component={BuildPromptsDemo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AITutorDemo"
        component={AITutorDemo}
        durationInFrames={AITUTOR_TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FoundryAnnouncement"
        component={FoundryAnnouncement}
        durationInFrames={FOUNDRY_TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FoundryAnnouncementV2"
        component={FoundryAnnouncementV2}
        durationInFrames={FOUNDRY_V2_TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
