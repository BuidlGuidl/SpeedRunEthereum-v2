import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { ChallengeId, EventType, ReviewAction } from "~~/services/database/config/types";
import { createEvent } from "~~/services/database/repositories/events";
import { upsertUserChallenge } from "~~/services/database/repositories/userChallenges";
import { findUserByAddress } from "~~/services/database/repositories/users";
import { isValidEIP712ChallengeSubmitSignature } from "~~/services/eip712/challenge";

export type ChallengeSubmitPayload = {
  userAddress: string;
  frontendUrl: string;
  contractUrl: string;
  signature: `0x${string}`;
};

export type AutogradingResult = {
  success: boolean;
  feedback: string;
};

// TODO: Remove this and make request to actual autograder
async function mockAutograding(contractUrl: string): Promise<AutogradingResult> {
  console.log("Mock autograding for contract:", contractUrl);
  await new Promise(resolve => setTimeout(resolve, 10000));
  return {
    success: true,
    feedback: "All tests passed successfully! Great work!",
  };
}

export async function POST(req: NextRequest, { params }: { params: { challengeId: ChallengeId } }) {
  try {
    const challengeId = params.challengeId;
    const { userAddress, frontendUrl, contractUrl, signature } = (await req.json()) as ChallengeSubmitPayload;

    if (!userAddress || !frontendUrl || !contractUrl || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712ChallengeSubmitSignature({
      address: userAddress,
      signature,
      challengeId,
      frontendUrl,
      contractUrl,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const user = await findUserByAddress(userAddress);
    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a CHALLENGE_SUBMIT event
    await createEvent({
      eventType: EventType.CHALLENGE_SUBMIT,
      userAddress: userAddress,
      signature: signature,
      payload: {
        challengeId: challengeId,
        frontendUrl: frontendUrl,
        contractUrl: contractUrl,
      },
    });

    await upsertUserChallenge({
      userAddress: userAddress,
      challengeId,
      frontendUrl,
      contractUrl,
      reviewAction: ReviewAction.SUBMITTED,
      reviewComment: "Your submission is being processed by the autograder...",
    });

    // Use waitUntil for background processing
    waitUntil(
      (async () => {
        try {
          // Run autograding
          const gradingResult = await mockAutograding(contractUrl);

          await upsertUserChallenge({
            userAddress: userAddress,
            challengeId,
            frontendUrl,
            contractUrl,
            reviewAction: gradingResult.success ? ReviewAction.ACCEPTED : ReviewAction.REJECTED,
            reviewComment: gradingResult.feedback,
          });

          await createEvent({
            eventType: EventType.CHALLENGE_AUTOGRADE,
            userAddress: userAddress,
            signature: signature,
            payload: {
              autograding: true,
              challengeId: challengeId,
              reviewAction: gradingResult.success ? ReviewAction.ACCEPTED : ReviewAction.REJECTED,
              reviewMessage: gradingResult.feedback,
            },
          });

          console.log(`Background autograding completed for user ${userAddress}, challenge ${challengeId}`);
        } catch (error) {
          console.error("Error in background autograding:", error);
        }
      })(),
    );

    // Return response immediately
    return NextResponse.json({
      success: true,
      message: "Challenge submitted successfully. Autograding in progress...",
      status: "SUBMITTED",
    });
  } catch (error) {
    console.error("Error submitting challenge:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
