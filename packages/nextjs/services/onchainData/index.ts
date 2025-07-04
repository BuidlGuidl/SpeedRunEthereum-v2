import type { EnsData } from "./ens";
import { fetchEnsData } from "./ens";

export type OnchainData = {
  ensData: EnsData;
};

export async function fetchOnchainData(address: string): Promise<OnchainData> {
  const ensData = await fetchEnsData(address);

  return {
    ensData,
  };
}
