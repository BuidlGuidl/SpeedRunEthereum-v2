import { NextRequest, NextResponse } from "next/server";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";
import { ReviewAction } from "~~/services/database/config/types";
import { createBuild } from "~~/services/database/repositories/builds";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { isValidEIP712SubmitBuildSignature } from "~~/services/eip712/builds";

export type SubmitBuildPayload = {
  address: string;
  signature: `0x${string}`;
} & BuildFormInputs;

export async function POST(request: NextRequest) {
  try {
    const { address, signature, ...build } = (await request.json()) as SubmitBuildPayload;

    if (!address || !signature || !build.name || !build.desc || !build.buildType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712SubmitBuildSignature({
      address,
      signature,
      build,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const userChallenges = await getLatestSubmissionPerChallengeByUser(address);
    const userCompletedChallenges = userChallenges.filter(
      challenge => challenge.reviewAction === ReviewAction.ACCEPTED,
    );

    if (userCompletedChallenges.length === 0) {
      return NextResponse.json({ error: "User has no completed challenges" }, { status: 400 });
    }

    const { insertedBuild, insertedBuildBuilder } = await createBuild({ ...build, userAddress: address });

    if (!insertedBuild || !insertedBuildBuilder) {
      return NextResponse.json({ error: "Failed to create build" }, { status: 500 });
    }

    return NextResponse.json({ build: insertedBuild, buildBuilder: insertedBuildBuilder }, { status: 200 });
  } catch (error) {
    console.error("Error during build submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
