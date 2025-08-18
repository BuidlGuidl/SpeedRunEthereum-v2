export type SideQuestKey =
  | "ensRegistered"
  | "contractDeployed"
  | "swappedOnDex"
  | "heldStablecoins"
  | "usedL2"
  | "sentMainnetTx"
  | "mintedNFT";

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
    sent_from?: string;
    sent_to?: string;
    direction?: string;
    mined_at?: string;
    operation_type?: string;
    transfers?: {
      direction?: string;
      fungible_info?: { symbol?: string };
    }[];
    hash?: string;
  };
  relationships?: {
    chain?: { data?: { id?: string } };
  };
};

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
    minedAt: attr.mined_at,
  };
};

const questCheckers: Record<
  Exclude<SideQuestKey, "ensRegistered">,
  (txInfo: ReturnType<typeof getTxInfo>) => boolean
> = {
  contractDeployed: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "deploy",

  swappedOnDex: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "trade" ||
    // Check added to filter out NFT trades
    (attr.transfers ?? []).some(tr => !!tr.fungible_info),

  heldStablecoins: ({ attr }) =>
    (attr.transfers ?? []).some((tr) => {
      const symbol =
        (tr.fungible_info?.symbol ?? "").toUpperCase();
      return tr.direction === "in" && (STABLES.has(symbol) || symbol.includes("USD"));
    }),

  usedL2: ({ isOutgoing, chain }) => isOutgoing && L2_CHAINS.has(chain),

  sentMainnetTx: ({ isOutgoing, chain }) =>
    isOutgoing && chain === "ethereum",

  mintedNFT: ({ attr }) =>
    (attr.operation_type ?? "").toLowerCase() === "mint",
};

async function fetchZerionTransactionsPage(
  addr: string,
  cursor?: string
): Promise<{ txs: ZerionTransaction[]; nextCursor?: string }> {
  const key = process.env.ZERION_API_KEY;
  if (!key) return { txs: [] };

  const url = new URL(`https://api.zerion.io/v1/wallets/${addr}/transactions/`);
  url.searchParams.set('page[size]', '100');
  url.searchParams.set('filter[trash]', 'only_non_trash');

  if (cursor) {
    url.searchParams.set('page[after]', cursor);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${encodeBase64(`${key}:`)}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return { txs: [] };

    const json = await res.json();
    const txs = (json.data ?? []).map((d: any) => ({
      attributes: d.attributes,
      relationships: d.relationships,
    }));

    // Extract next cursor from links.next if available
    const nextCursor = json.links?.next ?
      new URL(json.links.next).searchParams.get('page[after]') || undefined :
      undefined;

    return { txs, nextCursor };
  } catch {
    return { txs: [] };
  }
}

async function fetchAllTransactionsUntilQuestsComplete(
  address: string,
  _ensName: string | null
): Promise<ZerionTransaction[]> {
  const user = address.toLowerCase();

  // Initialize pending quests (ENS handled via database, not transactions)
  const pendingQuests = new Set(Object.keys(questCheckers) as Array<keyof typeof questCheckers>);

  const allTransactions: ZerionTransaction[] = [];
  let cursor: string | undefined;
  let hasMorePages = true;

  while (hasMorePages && pendingQuests.size > 0) {
    const { txs, nextCursor } = await fetchZerionTransactionsPage(address, cursor);

    if (txs.length === 0) {
      hasMorePages = false;
      break;
    }

    allTransactions.push(...txs);

    // Check if any pending quests are completed by these transactions
    for (const tx of txs) {
      const info = getTxInfo(tx, user);
      if (!info.minedAt) continue;

      for (const questKey of pendingQuests) {
        if (questCheckers[questKey](info)) {
          pendingQuests.delete(questKey);
          if (pendingQuests.size === 0) {
            // All quests completed, we can stop fetching
            hasMorePages = false;
            break;
          }
        }
      }

      if (pendingQuests.size === 0) break;
    }

    cursor = nextCursor;
    if (!cursor) {
      hasMorePages = false;
    }
  }

  return allTransactions;
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

  const questKeys = Object.keys(questCheckers) as Array<keyof typeof questCheckers>;

  for (const tx of txs) {
    const info = getTxInfo(tx, user);
    if (!info.minedAt) continue;

    for (const key of questKeys) {
      if (questCheckers[key](info)) {
        if (!completed[key]) {
          completed[key] = {
            date: info.minedAt || now,
            chain: info.chain,
            txHash: info.attr.hash,
          } as any;
        }
      }
    }

    if (questKeys.every((k) => completed[k as SideQuestKey])) break; // early exit
  }

  const outputKeys: SideQuestKey[] = ["ensRegistered", ...questKeys as SideQuestKey[]];

  return outputKeys.reduce((acc, key) => {
    const completion = completed[key];
    acc[key] = {
      name: QUEST_NAMES[key],
      status: completion ? "completed" : "pending",
      lastUpdate: now,
      // TODO: decide if keep or delete
      completionDate: completion && completion.date !== "pre-existing" ? (completion.date as string) : undefined,
      completionChain: (completion as any)?.chain,
      completionTxHash: (completion as any)?.txHash,
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
  const txs = await fetchAllTransactionsUntilQuestsComplete(address, ensName);
  return { sideQuests: evaluateSideQuests(address, txs, { ensName }) };
}
