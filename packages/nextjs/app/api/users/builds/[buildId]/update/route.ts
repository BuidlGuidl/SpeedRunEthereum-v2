import { NextResponse } from "next/server";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";
import { isOwnerOfBuild, updateBuild } from "~~/services/database/repositories/builds";
import { isValidEIP712UpdateBuildSignature } from "~~/services/eip712/builds";

export type UpdateBuildPayload = {
  signature: `0x${string}`;
  build: BuildFormInputs;
  address: string;
};

export async function PUT(request: Request, { params }: { params: { buildId: string } }) {
  try {
    const { buildId } = params;
    const { signature, build, address }: UpdateBuildPayload = await request.json();
    const isOwner = await isOwnerOfBuild(buildId, address);

    const isValidSignature = await isValidEIP712UpdateBuildSignature({
      address,
      signature,
      build,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!isOwner) {
      return NextResponse.json({ error: "Not authorized to update this build" }, { status: 403 });
    }

    const updatedBuild = await updateBuild(buildId, {
      ...build,
      userAddress: address,
    });

    return NextResponse.json({ build: updatedBuild });
  } catch (error) {
    console.error("Error updating build:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
