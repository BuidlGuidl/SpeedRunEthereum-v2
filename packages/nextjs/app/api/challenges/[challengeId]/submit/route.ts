import { NextRequest, NextResponse } from "next/server";
import { ChallengeId, ReviewAction } from "~~/services/database/config/types";
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

// TODO: Remove this and make request to actual autograder
async function mockAutograding(contractUrl: string): Promise<AutogradingResult> {
  console.log("Mock autograding for contract:", contractUrl);
  await new Promise(resolve => setTimeout(resolve, 1000));
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

    // Create the initial submission record
    const submissionResult = await createUserChallenge({
      userAddress: userAddress,
      challengeId,
      frontendUrl,
      contractUrl,
      signature,
      // Initially set as SUBMITTED
      reviewAction: ReviewAction.SUBMITTED,
    });

    // Get the ID of the newly created submission
    const submissionId = submissionResult[0]?.id;
    if (!submissionId) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    // TODO: Make request to actual autograder
    // TODO: Think if we want to wait the autograder to finish or just return the result immediately
    // - Check Vercel timeout limit and see if we return and have the function idle until the result is ready
    // An alternative is have and endpoint that receives the autograder result and update the database
    const gradingResult = await mockAutograding(contractUrl);

    // Update the existing submission with the grading result
    const updateResult = await updateUserChallengeById(submissionId, {
      reviewAction: gradingResult.success ? ReviewAction.ACCEPTED : ReviewAction.REJECTED,
      reviewComment: gradingResult.feedback,
    });

    // Check if the update was successful
    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json({ error: "Failed to update submission with grading result" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Challenge submitted and graded successfully",
      autoGradingResult: gradingResult,
    });
  } catch (error) {
    console.error("Error submitting challenge:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
