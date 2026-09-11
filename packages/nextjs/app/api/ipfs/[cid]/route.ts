import { NextResponse } from "next/server";
import { fetchPinnedJSON } from "~~/services/bgipfs";

// CIDv0 ("Qm...", base58btc) or CIDv1 ("b...", base32)
const CID_REGEX = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{50,})$/;

// Content is immutable (same CID = same bytes), so cache forever. Vercel CDN honors s-maxage,
// which makes this a shared cache for every challenge user.
const IMMUTABLE_CACHE = "public, max-age=31536000, s-maxage=31536000, immutable";

export async function GET(_req: Request, props: { params: Promise<{ cid: string }> }) {
  const { cid } = await props.params;

  if (!CID_REGEX.test(cid)) {
    return NextResponse.json({ error: "Invalid CID" }, { status: 400 });
  }

  try {
    const content = await fetchPinnedJSON(cid);
    if (content === null) {
      return NextResponse.json(
        { error: "Not found. Only content pinned via /api/ipfs/pin is served" },
        { status: 404 },
      );
    }

    return NextResponse.json(content, { headers: { "Cache-Control": IMMUTABLE_CACHE } });
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return NextResponse.json({ error: "Error fetching from IPFS" }, { status: 502 });
  }
}
