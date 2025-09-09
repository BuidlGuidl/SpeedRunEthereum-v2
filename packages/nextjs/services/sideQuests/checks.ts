import { type SideQuestCheckArgs } from "./types";
import { fetchTransactions } from "~~/services/onchainData/zerion";

const L2_CHAIN_IDS =
  "abstract,arbitrum,base,blast,celo,linea,optimism,polygon,polygon-zkevm,scroll,zklink-nova,zksync-era,zora";

export async function checkEnsRegistered({ user }: SideQuestCheckArgs) {
  return Boolean(user.ens);
}

export async function checkEnsAvatarSet({ user }: SideQuestCheckArgs) {
  return Boolean(user.ensAvatar);
}

export async function checkContractDeployed({ user }: SideQuestCheckArgs) {
  const txs = await fetchTransactions(user.userAddress, { "filter[operation_types]": "deploy" });
  return txs.length > 0;
}

export async function checkSwappedOnDex({ user }: SideQuestCheckArgs) {
  const txs = await fetchTransactions(user.userAddress, {
    "filter[operation_types]": "trade",
    "filter[asset_types]": "fungible",
  });
  return txs.length > 0;
}

export async function checkMintedNFT({ user }: SideQuestCheckArgs) {
  const txs = await fetchTransactions(user.userAddress, {
    "filter[operation_types]": "mint",
    "filter[asset_types]": "nft",
  });
  return txs.length > 0;
}

export async function checkUsedL2({ user }: SideQuestCheckArgs) {
  const txs = await fetchTransactions(user.userAddress, {
    "filter[chain_ids]": L2_CHAIN_IDS,
  });
  return txs.length > 0;
}

export async function checkSentMainnetTx({ user }: SideQuestCheckArgs) {
  const txs = await fetchTransactions(user.userAddress, {
    "filter[chain_ids]": "ethereum",
  });
  return txs.length > 0;
}
