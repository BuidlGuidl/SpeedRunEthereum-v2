import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { BatchUserStatus, ReviewAction } from "~~/services/database/config/types";
import { getLatestOpenBatch } from "~~/services/database/repositories/batches";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress, updateUser } from "~~/services/database/repositories/users";
import { isValidEIP712JoinBatchSignature } from "~~/services/eip712/join-batch";
import { PlausibleEvent, trackPlausibleEvent } from "~~/services/plausible";
import { JOIN_BATCH_DEPENDENCIES } from "~~/utils/dependent-challenges";

type JoinBatchPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const { address, signature } = (await req.json()) as JoinBatchPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const latestOpenBatch = await getLatestOpenBatch();

    if (!latestOpenBatch) {
      return NextResponse.json({ error: "No active batch" }, { status: 400 });
    }

    const user = await getUserByAddress(address);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const userJoinedBatch = Boolean(user.batchId);

    if (userJoinedBatch) {
      return NextResponse.json({ error: "User already joined Batch" }, { status: 401 });
    }

    const userChallenges = await getLatestSubmissionPerChallengeByUser(address);

    const completedJoinBatchDependencies = JOIN_BATCH_DEPENDENCIES.every(joinBatchDependency =>
      userChallenges.find(
        userChallenge =>
          userChallenge.challengeId === joinBatchDependency && userChallenge.reviewAction === ReviewAction.ACCEPTED,
      ),
    );

    if (!completedJoinBatchDependencies) {
      return NextResponse.json({ error: "Required challenges have not been completed" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712JoinBatchSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const updatedUser = await updateUser(user.userAddress, {
      batchId: latestOpenBatch.id,
      batchStatus: BatchUserStatus.CANDIDATE,
    });

    const referrer = user?.referrer || undefined;
    const originalUtmParams = user?.originalUtmParams;
    waitUntil(
      trackPlausibleEvent(
        PlausibleEvent.JOIN_BATCH,
        {
          originalReferrer: referrer,
          originalUtmSource: originalUtmParams?.utm_source,
          originalUtmMedium: originalUtmParams?.utm_medium,
          originalUtmCampaign: originalUtmParams?.utm_campaign,
          originalUtmTerm: originalUtmParams?.utm_term,
          originalUtmContent: originalUtmParams?.utm_content,
        },
        req,
      ),
    );

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
