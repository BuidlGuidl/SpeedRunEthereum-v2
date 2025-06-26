import { Address, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(getAlchemyHttpUrl(mainnet.id)),
});

export async function getShortAddressAndEns(address: Address) {
  let ensName = null;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-6)}`;

  try {
    const user = await getUserByAddress(address);
    ensName = user?.ens;
  } catch (error) {
    console.error("Error resolving ENS name:", error);
  }

  return {
    ensName,
    shortAddress,
  };
}
