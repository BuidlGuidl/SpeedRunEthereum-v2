import { publicClient } from "~~/utils/short-address-and-ens";

export type EnsData = {
  name: string | null;
  avatar: string | null;
};

export async function fetchEnsData(address: string): Promise<EnsData> {
  let name: string | null = null;
  let avatar: string | null = null;

  try {
    name = await publicClient.getEnsName({ address });
  } catch (error) {
    console.error(`Error getting ENS name for ${address}:`, error);
  }

  if (name) {
    try {
      avatar = await publicClient.getEnsAvatar({ name });
    } catch (error) {
      console.error(`Error getting ENS avatar for ${address}:`, error);
    }
  }

  return { name, avatar };
}
