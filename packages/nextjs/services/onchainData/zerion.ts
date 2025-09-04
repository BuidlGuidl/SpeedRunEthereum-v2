type ZerionTransactionsResponse = {
  links: {
    self: string;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      operation_type?: string;
    };
  }[];
};

/**
 * Fetches transactions from Zerion for a given wallet address.
 *
 * @see https://developers.zerion.io/reference/listwallettransactions
 */
export async function fetchTransactions(address: string, params: Record<string, string> = {}) {
  const apiKey = process.env.ZERION_API_KEY;
  if (!apiKey) throw new Error("ZERION_API_KEY is not set");

  const url = new URL(`https://api.zerion.io/v1/wallets/${address}/transactions/`);

  const defaultParams: Record<string, string> = {
    "page[size]": "1",
    "filter[trash]": "only_non_trash",
  };

  Object.entries({ ...defaultParams, ...params }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch transactions from Zerion: ${res.statusText}`);
  }

  const jsonResponse = (await res.json()) as ZerionTransactionsResponse;
  return jsonResponse.data;
}
