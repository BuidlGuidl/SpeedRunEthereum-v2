export const CHALLENGE_XP = 10; // Points per accepted challenge
export const BATCH_XP = 20; // Points for being in a batch
export const BUILD_XP = 5; // Points for _first_ build only

export function getTotalXP(challengesCount: number) {
  return CHALLENGE_XP * challengesCount + BATCH_XP + BUILD_XP;
}
