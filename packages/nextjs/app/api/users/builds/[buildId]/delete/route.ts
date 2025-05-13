import { NextResponse } from "next/server";
import { deleteBuild, isOwnerOfBuild } from "~~/services/database/repositories/builds";
import { isValidEIP712DeleteBuildSignature } from "~~/services/eip712/builds";

export type DeleteBuildPayload = {
  signature: `0x${string}`;
  address: string;
};

export async function DELETE(request: Request, { params }: { params: { buildId: string } }) {
  try {
    const { buildId } = params;
    const { signature, address }: DeleteBuildPayload = await request.json();

    const isValidSignature = await isValidEIP712DeleteBuildSignature({
      address,
      signature,
      buildId: buildId,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const isOwner = await isOwnerOfBuild(buildId, address);
    if (!isOwner) {
      return NextResponse.json({ error: "Not authorized to delete this build" }, { status: 403 });
    }

    await deleteBuild(buildId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting build:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
