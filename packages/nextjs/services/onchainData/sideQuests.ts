type SideQuestKey =
  | "ensRegistered"
  | "contractDeployed"
  | "swappedOnDex"
  | "usedL2"
  | "sentMainnetTx"
  | "mintedNFT";

type SideQuestEntry = {
  name: string;
  status: "completed" | "pending";
  lastUpdate: string;
};

type OnchainSideQuests = Record<SideQuestKey, SideQuestEntry>;
export type SideQuestsSnapshot = { sideQuests: OnchainSideQuests };

type ZerionTransaction = {
  attributes?: {
    operation_type?: string;
  };
};

const QUEST_NAMES: Record<SideQuestKey, string> = {
  ensRegistered: "Registered ENS",
  contractDeployed: "Deployed a Contract",
  swappedOnDex: "Swapped on a DEX",
  usedL2: "Used an L2",
  sentMainnetTx: "Sent a Mainnet Tx",
  mintedNFT: "Minted an NFT",
};

const encodeBase64 = (value: string) => Buffer.from(value, "utf8").toString("base64");

async function fetchTargetedTransactions(
  addr: string,
  filters: Record<string, string>
): Promise<ZerionTransaction[]> {
  const key = process.env.ZERION_API_KEY;
  if (!key) return [];

  const url = new URL(`https://api.zerion.io/v1/wallets/${addr}/transactions/`);
  url.searchParams.set('page[size]', '1');
  url.searchParams.set('filter[trash]', 'only_non_trash');

  Object.entries(filters).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${encodeBase64(`${key}:`)}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    return (json.data ?? []).map((d: any) => ({
      attributes: d.attributes,
    }));
  } catch {
    return [];
  }
}

async function fetchSideQuestTransactions(address: string): Promise<Record<SideQuestKey, ZerionTransaction | null>> {
  const questFilters = {
    contractDeployed: { 'filter[operation_types]': 'deploy' },
    swappedOnDex: { 'filter[operation_types]': 'trade', 'filter[asset_types]': 'fungible' },
    mintedNFT: { 'filter[operation_types]': 'mint', 'filter[asset_types]': 'nft' },
    usedL2: { 'filter[chain_ids]': 'abstract,ape,arbitrum,base,blast,bob,celo,cyber,degen,fraxtal,katana,linea,lisk,manta-pacific,mantle,metis-andromeda,mode,okbchain,opbnb,optimism,polygon-zkevm,rari,redstone,scroll,swellchain,taiko,world,zero,zklink-nova,zksync-era,zora' },
    sentMainnetTx: { 'filter[chain_ids]': 'ethereum' },
  };

  const results: Record<SideQuestKey, ZerionTransaction | null> = {
    ensRegistered: null,
    contractDeployed: null,
    swappedOnDex: null,
    usedL2: null,
    sentMainnetTx: null,
    mintedNFT: null,
  };

  const promises = Object.entries(questFilters).map(async ([questKey, filters]) => {
    const txs = await fetchTargetedTransactions(address, filters);
    results[questKey as SideQuestKey] = txs[0] || null;
  });

  await Promise.all(promises);
  return results;
}

function evaluateSideQuests(
  questResults: Record<SideQuestKey, ZerionTransaction | null>,
  { ensName }: { ensName: string | null }
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
