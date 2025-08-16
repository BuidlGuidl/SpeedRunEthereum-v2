export type SideQuestKey =
  | "ensRegistered"
  | "contractDeployed"
  | "swappedOnDex"
  | "heldStablecoins"
  | "usedL2"
  | "sentMainnetTx"
  | "mintedNFT"
  | "stakedTokens";

export type SideQuestEntry = {
  name: string;
  status: "completed" | "pending";
  lastUpdate: string;
  completionDate?: string;
  completionChain?: string;
  completionTxHash?: string;
};

export type OnchainSideQuests = Record<SideQuestKey, SideQuestEntry>;
export type SideQuestsSnapshot = { sideQuests: OnchainSideQuests };

export type ZerionTransaction = {
  attributes?: {
    from?: string;
    to?: string;
    sent_from?: string;
    sent_to?: string;
    direction?: string;
    status?: string;
    chain_id?: string;
    chain?: string;
    mined_at?: string;
    operation_type?: string;
    tx_type?: string;
    method?: { name?: string };
    protocol?: { category?: string };
    operations?: { type?: string }[];
    transfers?: {
      direction?: string;
      fungible_info?: { symbol?: string };
      token?: { symbol?: string };
    }[];
    hash?: string;
  };
  relationships?: {
    chain?: { data?: { id?: string } };
  };
};

const ENS_REVERSE = "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb";

/* popular L2s const L2_CHAINS = new Set([
  "optimism","arbitrum","base","polygon","zksync",
  "linea","scroll","blast","mantle","mode"
]);
*/
// full list of L2s matching zerion API with l2beat
const L2_CHAINS = new Set([
  "abstract",
  "ape",
  "arbitrum",
  "base",
  "blast",
  "bob",
  "celo",
  "cyber",
  "degen",
  "fraxtal",
  "katana",
  "linea",
  "lisk",
  "manta-pacific",
  "mantle",
  "metis-andromeda",
  "mode",
  "okbchain",
  "opbnb",
  "optimism",
  "polygon-zkevm",
  "rari",
  "redstone",
  "scroll",
  "swellchain",
  "taiko",
  "world",
  "zero",
  "zklink-nova",
  "zksync-era",
  "zora",
]);

const STABLES = new Set([
  "USDC","USDT","DAI","FRAX","LUSD","USDbC","USDCE","USDS","USDe",
  "GHO","GUSD","BUSD","SUSD","USDD","PYUSD","TUSD","FDUSD"
]);

const QUEST_NAMES: Record<SideQuestKey, string> = {
  ensRegistered   : "Registered ENS",
  contractDeployed: "Deployed a Contract",
  swappedOnDex    : "Swapped on a DEX",
  heldStablecoins : "Held Stablecoins",
  usedL2          : "Used an L2",
  sentMainnetTx   : "Sent a Mainnet Tx",
  mintedNFT       : "Minted an NFT",
  stakedTokens    : "Staked Tokens",
};

const encodeBase64 = (value: string) => Buffer.from(value, "utf8").toString("base64");

/* Normalize transaction data for easier checks */
const getTxInfo = (tx: ZerionTransaction, user: string) => {
  const attr = tx.attributes ?? {};
  const rel = tx.relationships ?? {};

  const from = (attr.sent_from ?? "").toLowerCase();
  const to = (attr.sent_to ?? "").toLowerCase();
  const chain = (rel.chain?.data?.id ?? "").toLowerCase();

  return {
    attr,
    from,
    to,
    chain,
    isOutgoing: attr.direction === "out" || from === user,
    isSuccessful: ["success", "confirmed"].includes((attr.status ?? "").toLowerCase()),
    minedAt: attr.mined_at,
  };
};

const questCheckers: Record<
  SideQuestKey,
  (txInfo: ReturnType<typeof getTxInfo>) => boolean
> = {
  ensRegistered: ({ to, chain, attr }) =>
    chain === "ethereum" &&
    to === ENS_REVERSE &&
    (attr.method?.name ?? "").toLowerCase().includes("setname"),

  contractDeployed: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "deploy",

  swappedOnDex: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "trade" ||
    (attr.tx_type ?? "").toLowerCase().includes("swap") ||
    (attr.protocol?.category ?? "").toLowerCase() === "dex" ||
    (attr.operations ?? []).some(
      (op) => (op.type ?? "").toLowerCase().includes("swap")
    ),

  heldStablecoins: ({ attr }) =>
    (attr.transfers ?? []).some((tr) => {
      const symbol =
        (tr.fungible_info?.symbol ?? tr.token?.symbol ?? "").toUpperCase();
      return tr.direction === "in" && (STABLES.has(symbol) || symbol.includes("USD"));
    }),

  usedL2: ({ isOutgoing, chain }) => isOutgoing && L2_CHAINS.has(chain),

  sentMainnetTx: ({ isOutgoing, chain, isSuccessful }) =>
    isOutgoing && isSuccessful && chain === "ethereum",

  mintedNFT: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "mint",

  stakedTokens: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "stake",
};

async function fetchZerionTransactions(addr: string): Promise<ZerionTransaction[]> {
  const key = process.env.ZERION_API_KEY;
  if (!key) return [];

  const url =
    `https://api.zerion.io/v1/wallets/${addr}/transactions/` +
    `?page[size]=100&filter[trash]=only_non_trash`;

  try {
    const res = await fetch(url, {
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
      relationships: d.relationships,
    }));
  } catch {
    return [];
  }
}

export function evaluateSideQuests(
  address: string,
  txs: ZerionTransaction[],
  { ensName }: { ensName: string | null }
): OnchainSideQuests {
  const user = address.toLowerCase();
  const now = new Date().toISOString();

  const completed: Partial<Record<SideQuestKey, {
    date: string | "pre-existing";
    chain?: string;
    txHash?: string;
  }>> = {};

  if (ensName) {
    completed.ensRegistered = { date: "pre-existing" };
  }

  const questKeys = Object.keys(questCheckers) as SideQuestKey[];

  for (const tx of [...txs].reverse()) { // oldest → newest
    const info = getTxInfo(tx, user);
    if (!info.minedAt) continue;

    for (const key of questKeys) {
      if (!completed[key] && questCheckers[key](info)) {
        completed[key] = {
          date: info.minedAt,
          chain: info.chain,
          txHash: info.attr.hash,
        };
      }
    }

    if (questKeys.every((k) => completed[k])) break; // early exit
  }

  return questKeys.reduce((acc, key) => {
    const completion = completed[key];
    acc[key] = {
      name: QUEST_NAMES[key],
      status: completion ? "completed" : "pending",
      lastUpdate: now,
      completionDate: completion && completion.date !== "pre-existing" ? completion.date : undefined,
      completionChain: completion?.chain,
      completionTxHash: completion?.txHash,
    };

    // Debug logging for completed quests TODO: remove
    if (completion) {
      console.log(`✅ ${QUEST_NAMES[key]}:`);
      console.log(`   📅 Date: ${completion.date}`);
      if (completion.chain) console.log(`   🔗 Chain: ${completion.chain}`);
      if (completion.txHash) console.log(`   🔗 Tx: ${completion.txHash}`);
    }

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
  const txs = await fetchZerionTransactions(address);
  return { sideQuests: evaluateSideQuests(address, txs, { ensName }) };
}
