import { ZerionResult, fetchTransactions } from "./zerion";

type SideQuestKey = "ensRegistered" | "contractDeployed" | "swappedOnDex" | "usedL2" | "sentMainnetTx" | "mintedNFT";

type SideQuestEntry = {
  name: string;
  status: "completed" | "pending";
  lastUpdate: string;
};

type OnchainSideQuests = Record<SideQuestKey, SideQuestEntry>;
export type SideQuestsSnapshot = { sideQuests: OnchainSideQuests };

const QUEST_NAMES: Record<SideQuestKey, string> = {
  ensRegistered: "Registered ENS",
  contractDeployed: "Deployed a Contract",
  swappedOnDex: "Swapped on a DEX",
  usedL2: "Used an L2",
  sentMainnetTx: "Sent a Mainnet Tx",
  mintedNFT: "Minted an NFT",
};

async function fetchSideQuestTransactions(address: string): Promise<Record<SideQuestKey, ZerionResult[number] | null>> {
  const questFilters = {
    contractDeployed: { "filter[operation_types]": "deploy" },
    swappedOnDex: { "filter[operation_types]": "trade", "filter[asset_types]": "fungible" },
    mintedNFT: { "filter[operation_types]": "mint", "filter[asset_types]": "nft" },
    usedL2: {
      "filter[chain_ids]":
        "abstract,ape,arbitrum,base,blast,bob,celo,cyber,degen,fraxtal,katana,linea,lisk,manta-pacific,mantle,metis-andromeda,mode,okbchain,opbnb,optimism,polygon-zkevm,rari,redstone,scroll,swellchain,taiko,world,zero,zklink-nova,zksync-era,zora",
    },
    sentMainnetTx: { "filter[chain_ids]": "ethereum" },
  };

  const results: Record<SideQuestKey, ZerionResult[number] | null> = {
    ensRegistered: null,
    contractDeployed: null,
    swappedOnDex: null,
    usedL2: null,
    sentMainnetTx: null,
    mintedNFT: null,
  };

  const promises = Object.entries(questFilters).map(async ([questKey, filters]) => {
    const txs = await fetchTransactions(address, filters);
    results[questKey as SideQuestKey] = txs[0] || null;
  });

  await Promise.all(promises);
  return results;
}

function evaluateSideQuests(
  questResults: Record<SideQuestKey, ZerionResult[number] | null>,
  { ensName }: { ensName: string | null },
): OnchainSideQuests {
  const now = new Date().toISOString();

  return (Object.keys(QUEST_NAMES) as SideQuestKey[]).reduce((acc, key) => {
    const isCompleted = key === "ensRegistered" ? !!ensName : !!questResults[key];

    acc[key] = {
      name: QUEST_NAMES[key],
      status: isCompleted ? "completed" : "pending",
      lastUpdate: now,
    };

    return acc;
  }, {} as OnchainSideQuests);
}

export async function fetchSideQuestsSnapshot({
  address,
  ensName,
}: {
  address: string;
  ensName: string | null;
}): Promise<SideQuestsSnapshot> {
  const questResults = await fetchSideQuestTransactions(address);
  return { sideQuests: evaluateSideQuests(questResults, { ensName }) };
}
