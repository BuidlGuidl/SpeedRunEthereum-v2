import { NextRequest, NextResponse } from "next/server";
import { createEvent } from "~~/services/database/respositories/events";
import { upsertUserChallenge } from "~~/services/database/respositories/userChallenges";
import { findUserByAddress } from "~~/services/database/respositories/users";
import { isValidEIP712ChallengeSubmitSignature } from "~~/utils/eip712/challenge";

export type ChallengeSubmitPayload = {
  userAddress: string;
  deployedUrl: string;
  contractUrl: string;
  signature: `0x${string}`;
};

export type AutogradingResult = {
  success: boolean;
  feedback: string;
};

async function mockAutograding(contractUrl: string): Promise<AutogradingResult> {
  console.log("Mock autograding for contract:", contractUrl);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    feedback: "All tests passed successfully! Great work!",
  };
}

export async function POST(req: NextRequest, { params }: { params: { challengeId: string } }) {
  try {
    console.log("Submit challenge");
    const challengeId = params.challengeId;
    const { userAddress, deployedUrl, contractUrl, signature } = (await req.json()) as ChallengeSubmitPayload;
    const lowerCasedUserAddress = userAddress.toLowerCase();

    if (!userAddress || !deployedUrl || !contractUrl || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712ChallengeSubmitSignature({
      address: userAddress,
      signature,
      challengeId,
      deployedUrl,
      contractUrl,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const user = await findUserByAddress(lowerCasedUserAddress);
    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await createEvent({
      eventType: "challenge.submit",
      signature,
      userAddress: lowerCasedUserAddress,
      challengeCode: challengeId,
      deployedUrl,
      contractUrl,
    });

    const gradingResult = await mockAutograding(contractUrl);

    await upsertUserChallenge({
      userAddress: lowerCasedUserAddress,
      challengeCode: challengeId,
      deployedUrl,
      contractUrl,
      reviewAction: gradingResult.success ? "ACCEPTED" : "REJECTED",
      reviewComment: gradingResult.feedback,
    });

    await createEvent({
      eventType: "challenge.autograde",
      signature,
      userAddress: lowerCasedUserAddress,
      challengeCode: challengeId,
      reviewAction: gradingResult.success ? "ACCEPTED" : "REJECTED",
      reviewMessage: gradingResult.feedback,
    });

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
