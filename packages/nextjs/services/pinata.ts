// Pinata IPFS: used by /api/ipfs/* as a pinning proxy for SRE challenges,
// so that challenge repos don't need to ship IPFS credentials.

const PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

export const isPinningConfigured = () => Boolean(process.env.PINATA_JWT);
export const isGatewayConfigured = () => Boolean(process.env.PINATA_GATEWAY);

// Pins a JSON object and returns its CID (v0, "Qm..." — same format challenges used before)
export async function pinJSON(content: object): Promise<string> {
  const res = await fetch(PINATA_PIN_JSON_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PINATA_JWT}` },
    body: JSON.stringify({
      pinataContent: content,
      // Tag so pins from this proxy can be listed / cleaned up in Pinata
      pinataMetadata: { name: "sre-challenge-nft-metadata", keyvalues: { source: "sre-challenges" } },
      pinataOptions: { cidVersion: 0 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Pinata pin failed: ${res.status} ${await res.text()}`);
  }

  const { IpfsHash } = await res.json();
  return IpfsHash as string;
}

// Reads JSON by CID from our dedicated gateway. Returns null if not found.
// The gateway is restricted (default): it only serves content pinned to our account,
// and answers 403 for anything else.
export async function fetchPinnedJSON(cid: string): Promise<unknown | null> {
  const res = await fetch(`https://${process.env.PINATA_GATEWAY}/ipfs/${cid}`);

  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) {
    throw new Error(`Pinata gateway failed: ${res.status}`);
  }

  return res.json();
}
