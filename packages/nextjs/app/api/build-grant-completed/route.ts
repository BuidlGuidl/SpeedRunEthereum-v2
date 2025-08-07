import { NextRequest, NextResponse } from "next/server";
import { getBuildByBuildId, updateBuildGrantFlag } from "~~/services/database/repositories/builds";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { recoverTypedDataAddress } from "viem";

function extractBuildIdFromLink(link: string): string | null {
  link = link.trim().replace(/^@/, "");
  const match = link.match(/builds\/([\w-]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  const raw = await request.text();
  console.log("RAW BODY:", raw);
  let grantId, action, txHash, txChainId, link, note, signature, signer;
  try {
    ({ grantId, action, txHash, txChainId, link, note, signature, signer } = JSON.parse(raw));
  } catch (e) {
    console.error("JSON parse error:", e, "RAW BODY:", raw);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (!grantId || !action || !txHash || !txChainId || !link || !signature || !signer) {
      console.log("Step: missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Reconstruct EIP-712 domain
    const domain = {
      name: "BuidlGuidl Grants",
      version: "1",
      chainId: Number(txChainId),
    };

    // 2. Reconstruct EIP-712 types
    let types;
    if (note !== undefined) {
      types = {
        Message: [
          { name: "grantId", type: "string" },
          { name: "action", type: "string" },
          { name: "txHash", type: "string" },
          { name: "txChainId", type: "string" },
          { name: "link", type: "string" },
          { name: "note", type: "string" },
        ],
      };
    } else {
      types = {
        Message: [
          { name: "grantId", type: "string" },
          { name: "action", type: "string" },
          { name: "txHash", type: "string" },
          { name: "txChainId", type: "string" },
          { name: "link", type: "string" },
        ],
      };
    }

    // 3. Reconstruct the message
    const message = note !== undefined
      ? { grantId, action, txHash, txChainId, link, note }
      : { grantId, action, txHash, txChainId, link };

    // 4. Verify the signature
    console.log("Step: signature validation");
    const recovered = await recoverTypedDataAddress({
      domain,
      types,
      primaryType: "Message",
      message,
      signature,
    });
    console.log("Recovered address:", recovered);
    if (recovered.toLowerCase() !== signer.toLowerCase()) {
      console.log("Step: signature mismatch");
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 5. Check admin role
    console.log("Step: admin check");
    const isAdmin = await isUserAdmin(signer);
    console.log("isAdmin:", isAdmin);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized admin" }, { status: 401 });
    }

    // 6. Extract build ID and update
    console.log("Step: buildId extraction");
    const buildId = extractBuildIdFromLink(link);
    console.log("Extracted buildId:", buildId);
    if (!buildId) {
      return NextResponse.json({ error: "Invalid build link format" }, { status: 400 });
    }

    console.log("Step: DB lookup");
    const build = await getBuildByBuildId(buildId);
    console.log("DB build:", build);
    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    console.log("Step: DB update");
    await updateBuildGrantFlag(buildId, true);
    console.log("Step: success");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API ERROR:", error, error?.stack);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
