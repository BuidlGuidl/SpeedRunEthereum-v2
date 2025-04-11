import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { submitToAutograder } from "~~/services/autograder";
import { ChallengeId, ReviewAction } from "~~/services/database/config/types";
import { getChallengeById } from "~~/services/database/repositories/challenges";
import { createUserChallenge, updateUserChallengeById } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { isValidEIP712ChallengeSubmitSignature } from "~~/services/eip712/challenge";
import { PlausibleEvent, trackPlausibleEvent } from "~~/services/plausible";

// This function can run for a maximum of 60 seconds in Vercel
export const maxDuration = 60;

export type ChallengeSubmitPayload = {
  userAddress: string;
  frontendUrl: string;
  contractUrl: string;
  signature: `0x${string}`;
};

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

    const user = await getUserByAddress(userAddress);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const challenge = await getChallengeById(challengeId);
    if (!challenge || challenge.disabled) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const submissionResult = await createUserChallenge({
      userAddress: userAddress,
      challengeId,
      frontendUrl,
      contractUrl,
      signature,
      reviewAction: ReviewAction.SUBMITTED,
      reviewComment: "Your submission is being processed by the autograder...",
    });

    // Get the ID of the newly created submission
    const submissionId = submissionResult?.id;
    if (!submissionId) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    trackPlausibleEvent(PlausibleEvent.CHALLENGE_SUBMISSION, { challengeId }, req);

    // Use waitUntil for background processing
    waitUntil(
      (async () => {
        try {
          const autoGraderChallengeId = challenge.sortOrder;

          const gradingResult = await submitToAutograder({
            challengeId: autoGraderChallengeId,
            contractUrl,
          });

          // Update the existing submission with the grading result
          const updateResult = await updateUserChallengeById(submissionId, {
            reviewAction: gradingResult.success ? ReviewAction.ACCEPTED : ReviewAction.REJECTED,
            reviewComment: gradingResult.feedback,
          });

          // Check if the update was successful
          if (!updateResult) {
            return NextResponse.json({ error: "Failed to update submission with grading result" }, { status: 500 });
          }

          console.log(`Background autograding completed for user ${userAddress}, challenge ${challengeId}`);
        } catch (error) {
          console.error("Error in background autograding:", error);
          // Update the existing submission with the grading result
          const updateResult = await updateUserChallengeById(submissionId, {
            reviewAction: ReviewAction.REJECTED,
            reviewComment: "There was an error while grading your submission. Please try again later.",
          });
          if (!updateResult) {
            return NextResponse.json(
              { error: "Failed to update submission with grading result in error" },
              { status: 500 },
            );
          }
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
