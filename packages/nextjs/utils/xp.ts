export const CHALLENGE_XP = 10; // Points per accepted challenge
export const BATCH_XP = 20; // Points for being in a batch
export const BUILD_XP = 5; // Points for _first_ build only
export const SIDE_QUEST_XP = 5; // Points for each side quest completed

export function getTotalXP(challengesCount: number, sideQuestsCount: number) {
  return CHALLENGE_XP * challengesCount + BATCH_XP + BUILD_XP + SIDE_QUEST_XP * sideQuestsCount;
}
