export const CHALLENGE_POINTS = 10; // Points per accepted challenge
export const BATCH_POINTS = 20; // Points for being in a batch
export const BUILD_POINTS = 5; // Points for _first_ build only

export function getTotalPoints(challengesCount: number) {
  return CHALLENGE_POINTS * challengesCount + BATCH_POINTS + BUILD_POINTS;
}
