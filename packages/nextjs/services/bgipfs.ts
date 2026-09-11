// BuidlGuidl IPFS (bgipfs.com): used by /api/ipfs/* as a pinning proxy for SRE challenges,
// so that challenge repos don't need to ship IPFS credentials.

// Kubo-compatible add endpoint, see https://github.com/buidlguidl/buidlguidl-ipfs/tree/main/packages/ipfs-proxy
const BGIPFS_UPLOAD_URL = "https://upload.bgipfs.com/api/v0/add";
const BGIPFS_GATEWAY_URL = "https://community.bgipfs.com/ipfs";

export const isPinningConfigured = () => Boolean(process.env.BGIPFS_API_KEY);

// Pins a JSON object and returns its CID (v0, "Qm..." — same format challenges used before)
export async function pinJSON(content: object): Promise<string> {
  const formData = new FormData();
  formData.append("file", new Blob([JSON.stringify(content)], { type: "application/json" }), "metadata.json");

  const res = await fetch(`${BGIPFS_UPLOAD_URL}?cid-version=0`, {
    method: "POST",
    headers: { "X-API-Key": process.env.BGIPFS_API_KEY as string, "x-pin-name": "sre-challenge-nft-metadata" },
    body: formData,
    signal: AbortSignal.timeout(20_000),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`bgipfs upload failed: ${res.status} ${text}`);
  }

  // Kubo-style response: one JSON line per added entry, {"Name","Hash","Size"}
  const lastLine = text.trim().split("\n").pop() ?? "";
  const { Hash } = JSON.parse(lastLine);
  if (typeof Hash !== "string") {
    throw new Error(`bgipfs upload: no Hash in response: ${text}`);
  }

  return Hash;
}

// Reads JSON by CID from the BuidlGuidl gateway.
// The gateway serves any public CID; an unknown one answers 500 "no providers found".
export async function fetchPinnedJSON(cid: string): Promise<unknown> {
  const res = await fetch(`${BGIPFS_GATEWAY_URL}/${cid}`, { signal: AbortSignal.timeout(15_000) });

  if (!res.ok) {
    throw new Error(`bgipfs gateway failed: ${res.status}`);
  }

  return res.json();
}
