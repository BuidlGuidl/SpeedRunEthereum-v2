import { NextResponse } from "next/server";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";
import { isOwnerOfBuild, updateBuild } from "~~/services/database/repositories/builds";
import { isValidEIP712UpdateBuildSignature } from "~~/services/eip712/builds";
import { isAdminSession } from "~~/utils/auth";

export type UpdateBuildPayload = {
  signature: `0x${string}`;
  build: BuildFormInputs;
  userAddress: string;
  signatureAddress: string;
};

export async function PUT(request: Request, { params }: { params: { buildId: string } }) {
  try {
    const { buildId } = params;
    const { signature, build, userAddress, signatureAddress }: UpdateBuildPayload = await request.json();

    if (!build.name || !build.desc || !build.buildType || !signatureAddress || !signature || !userAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712UpdateBuildSignature({
      address: signatureAddress,
      signature,
      build: { ...build, buildId },
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let isAuthorized = false;
    const isAdmin = await isAdminSession();

    if (isAdmin) {
      isAuthorized = true;
    } else if (signatureAddress.toLowerCase() === userAddress.toLowerCase()) {
      const isOwner = await isOwnerOfBuild(buildId, userAddress);
      isAuthorized = isOwner;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized to update this build" }, { status: 403 });
    }

    const updatedBuild = await updateBuild(buildId, {
      ...build,
      userAddress,
    });

    return NextResponse.json({ build: updatedBuild });
  } catch (error) {
    console.error("Error updating build:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
