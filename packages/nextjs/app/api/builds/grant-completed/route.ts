import { NextRequest, NextResponse } from "next/server";
import { getBuildByBuildId, updateBuildGrantFlag } from "~~/services/database/repositories/builds";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { recoverTypedDataAddress } from "viem";
import { validateSafeSignature } from "~~/utils/safe-signature";

function extractBuildIdFromLink(link: string): string | null {
  link = link.trim().replace(/^@/, "");
  const match = link.match(/builds\/([\w-]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  let grantId, action, txHash, txChainId, link, note, signature, signer, isSafeSignature;
  try {
    ({ grantId, action, txHash, txChainId, link, note, signature, signer, isSafeSignature } = await request.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (!grantId || !action || !txHash || !txChainId || !link || !signature || !signer) {
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

    // 4. Verify the signature (Safe or EOA)
    let isValidSignature = false;
    if (isSafeSignature) {
      // Safe expects the full typedData structure
      const typedData = {
        domain,
        types,
        primaryType: "Message",
        message,
      };
      isValidSignature = await validateSafeSignature({
        chainId: Number(txChainId),
        safeAddress: signer,
        typedData: typedData as any,
        signature,
      });
    } else {
      const recovered = await recoverTypedDataAddress({
        domain,
        types,
        primaryType: "Message",
        message,
        signature,
      });
      isValidSignature = recovered.toLowerCase() === signer.toLowerCase();
    }
    if (!isValidSignature) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 5. Check admin role
    const isAdmin = await isUserAdmin(signer);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized admin" }, { status: 401 });
    }

    // 6. Extract build ID and update
    const buildId = extractBuildIdFromLink(link);
    if (!buildId) {
      return NextResponse.json({ error: "Invalid build link format" }, { status: 400 });
    }
    const build = await getBuildByBuildId(buildId);
    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }
    await updateBuildGrantFlag(buildId, true);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
