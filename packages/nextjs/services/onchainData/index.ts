import { UserByAddress } from "../database/repositories/users";
import { fetchSideQuestsSnapshot } from "../sideQuests";
import { SideQuestsSnapshot } from "../sideQuests/types";
import type { EnsData } from "./ens";
import { fetchEnsData } from "./ens";

export type OnchainData = {
  ensData?: EnsData;
  sideQuestsSnapshot?: SideQuestsSnapshot;
};

export async function fetchOnchainData(user: NonNullable<UserByAddress>): Promise<OnchainData> {
  const onchainData: OnchainData = {};
  try {
    const ensData = await fetchEnsData(user.userAddress);
    onchainData.ensData = ensData;
  } catch (error) {
    console.error("Error fetching ENS data:", error);
    throw error;
  }

  try {
    const sideQuestsSnapshot = await fetchSideQuestsSnapshot({
      ...user,
      // Use fetched data if available since it's not saved to db yet
      ens: onchainData.ensData?.name || user.ens,
      ensAvatar: onchainData.ensData?.avatar || user.ensAvatar,
    });
    onchainData.sideQuestsSnapshot = sideQuestsSnapshot;
  } catch (error) {
    console.error("Error fetching side quests snapshot:", error);
    throw error;
  }

  return onchainData;
}
