import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { ChallengeId, ReviewAction } from "~~/services/database/config/types";
import { getChallengeById } from "~~/services/database/repositories/challenges";
import { createUserChallenge, updateUserChallengeById } from "~~/services/database/repositories/userChallenges";
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

async function submitToAutograder({
  challengeId,
  contractAddress,
  network,
}: {
  challengeId: string;
  contractAddress: string;
  network: string;
}): Promise<AutogradingResult> {
  console.log("Autograder server", process.env.AUTOGRADING_SERVER);
  const response = await fetch(`${process.env.AUTOGRADING_SERVER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ challenge: challengeId, address: contractAddress, network }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit to autograder: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
    const submissionId = submissionResult[0]?.id;
    if (!submissionId) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    // Use waitUntil for background processing
    waitUntil(
      (async () => {
        try {
          const challenge = await getChallengeById(challengeId);
          const autoGraderChallengeId = challenge.sortOrder;
          const contractUrlObject = new URL(contractUrl);
          const network = contractUrlObject.host.split(".")[0];
          const contractAddress = contractUrlObject.pathname.replace("/address/", "");
          console.log("Submitted to the autograder waiting for result");
          const gradingResult = await submitToAutograder({
            challengeId: autoGraderChallengeId.toString(),
            contractAddress,
            network,
          });
          console.log("Grader result:", gradingResult);

          // Update the existing submission with the grading result
          const updateResult = await updateUserChallengeById(submissionId, {
            reviewAction: gradingResult.success ? ReviewAction.ACCEPTED : ReviewAction.REJECTED,
            reviewComment: gradingResult.feedback,
          });

          // Check if the update was successful
          if (!updateResult || updateResult.length === 0) {
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
          if (!updateResult || updateResult.length === 0) {
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
