import { NextResponse } from "next/server";
import { isPinningConfigured, pinJSON } from "~~/services/pinata";

// NFT metadata is a few hundred bytes; this leaves room for attributes.
const MAX_BODY_BYTES = 10_000;

// Minimal ERC-721 metadata shape (https://eips.ethereum.org/EIPS/eip-721)
const isNftMetadata = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const { name, description, image } = value as Record<string, unknown>;
  return (
    typeof name === "string" &&
    name.length > 0 &&
    typeof description === "string" &&
    typeof image === "string" &&
    image.length > 0
  );
};

export async function POST(request: Request) {
  if (!isPinningConfigured()) {
    return NextResponse.json({ error: "IPFS pinning service unavailable" }, { status: 503 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: `Body too large, max ${MAX_BODY_BYTES} bytes` }, { status: 413 });
  }

  let metadata: unknown;
  try {
    metadata = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  if (!isNftMetadata(metadata)) {
    return NextResponse.json(
      { error: "Body must be NFT metadata: an object with string name, description and image" },
      { status: 400 },
    );
  }

  try {
    const cid = await pinJSON(metadata);
    return NextResponse.json({ cid });
  } catch (error) {
    console.error("Error pinning to IPFS:", error);
    return NextResponse.json({ error: "Error pinning to IPFS" }, { status: 502 });
  }
}
