import { Address, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(getAlchemyHttpUrl(mainnet.id)),
});

export async function getEnsOrAddress(address: Address) {
  let ensName = null;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-6)}`;

  try {
    ensName = await publicClient.getEnsName({ address });
  } catch (error) {
    console.error("Error resolving ENS name:", error);
  }

  return {
    ensName,
    shortAddress,
  };
}
