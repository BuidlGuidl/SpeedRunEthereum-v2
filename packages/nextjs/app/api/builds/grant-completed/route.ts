import { NextRequest, NextResponse } from "next/server";
import { getBuildByBuildId, updateBuildGrantFlag } from "~~/services/database/repositories/builds";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { recoverTypedDataAddress } from "viem";
import { validateSafeSignature } from "~~/utils/safe-signature";

type GrantCompletedPayload = {
  grantId: string;
  action: string;
  txHash: string;
  txChainId: string | number;
  link: string;
  note?: string;
  signature: `0x${string}`;
  signer: string;
  isSafeSignature: boolean;
};

function extractBuildIdFromLink(link: string): string | null {
  link = link.trim().replace(/^@/, "");
  const match = link.match(/builds\/([\w-]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  let payload: GrantCompletedPayload;
  try {
    payload = (await request.json()) as GrantCompletedPayload;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { grantId, action, txHash, txChainId, link, note, signature, signer, isSafeSignature } = payload;

    if (!grantId || !action || !txHash || !txChainId || !link || !signature || !signer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const domain = {
      name: "BuidlGuidl Grants",
      version: "1",
      chainId: Number(txChainId),
    };

    // EIP-712 must match signed struct exactly; include note only when present
    const types = note !== undefined
      ? {
          Message: [
            { name: "grantId", type: "string" },
            { name: "action", type: "string" },
            { name: "txHash", type: "string" },
            { name: "txChainId", type: "string" },
            { name: "link", type: "string" },
            { name: "note", type: "string" },
          ],
        }
      : {
          Message: [
            { name: "grantId", type: "string" },
            { name: "action", type: "string" },
            { name: "txHash", type: "string" },
            { name: "txChainId", type: "string" },
            { name: "link", type: "string" },
          ],
        };

    const message = note !== undefined
      ? { grantId, action, txHash, txChainId, link, note }
      : { grantId, action, txHash, txChainId, link };

    let isValidSignature = false;
    if (isSafeSignature) {
      const typedData = {
        domain,
        types,
        primaryType: "Message",
        message,
      };
      isValidSignature = await validateSafeSignature({
        chainId: Number(txChainId),
        safeAddress: signer,
        typedData,
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

    // Only allow platform admins to toggle grant flag
    const isAdmin = await isUserAdmin(signer);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: signer is not an admin" }, { status: 403 });
    }

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
