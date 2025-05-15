import { NextResponse } from "next/server";
import { deleteBuild, isOwnerOfBuild } from "~~/services/database/repositories/builds";
import { isValidEIP712DeleteBuildSignature } from "~~/services/eip712/builds";
import { isAdminSession } from "~~/utils/auth";

export type DeleteBuildPayload = {
  signature: `0x${string}`;
  signatureAddress: string;
  userAddress: string;
};

export async function DELETE(request: Request, { params }: { params: { buildId: string } }) {
  try {
    const { buildId } = params;
    const { signature, signatureAddress, userAddress }: DeleteBuildPayload = await request.json();

    const isValidSignature = await isValidEIP712DeleteBuildSignature({
      address: signatureAddress,
      signature,
      buildId: buildId,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let isAuthorized = false;
    const isAdmin = await isAdminSession();

    if (isAdmin) {
      isAuthorized = true;
    } else {
      const isOwner = await isOwnerOfBuild(buildId, userAddress);
      isAuthorized = isOwner;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized to delete this build" }, { status: 403 });
    }

    await deleteBuild(buildId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting build:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
