import { NextResponse } from "next/server";
import { createBuildLike, deleteBuildLike, getBuildLikeForUser } from "~~/services/database/repositories/builds";
import { isValidEIP712LikeBuildSignature } from "~~/services/eip712/builds";

export type LikeBuildPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function POST(request: Request, { params }: { params: { buildId: string } }) {
  const { buildId } = params;
  const { address, signature }: LikeBuildPayload = await request.json();

  const buildLike = await getBuildLikeForUser(buildId, address);

  const isValidSignature = await isValidEIP712LikeBuildSignature({
    address,
    signature,
    buildId,
    action: buildLike ? "unlike" : "like",
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (buildLike) {
    await deleteBuildLike(buildLike.id);
  } else {
    await createBuildLike(buildId, address);
  }

  return NextResponse.json({ success: true });
}
