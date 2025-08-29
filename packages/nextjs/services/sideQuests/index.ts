import { UserByAddress } from "../database/repositories/users";
import { SIDEQUEST_IDS } from "./schema";
import { SIDEQUESTS } from "./schema";
import { SideQuestsSnapshot } from "./types";

export type SideQuestCheckArgs = {
  address: string;
  ensName?: string | null;
};

export async function fetchSideQuestsSnapshot(user: NonNullable<UserByAddress>) {
  const snapshot: SideQuestsSnapshot = {};
  const completedSidequests = user.sideQuestsSnapshot;
  for (const sideQuestId of SIDEQUEST_IDS) {
    // Skip if already completed
    if (completedSidequests?.[sideQuestId]) {
      continue;
    }

    const sideQuest = SIDEQUESTS[sideQuestId];
    try {
      const completed = await sideQuest.check({ user });
      if (completed) {
        snapshot[sideQuestId] = { id: sideQuestId, completedAt: new Date() };
      }
    } catch (err) {
      console.error(`Error checking side quest ${sideQuestId} for user ${user.userAddress}:`, err);
      throw err;
    }
  }
  return snapshot;
}
