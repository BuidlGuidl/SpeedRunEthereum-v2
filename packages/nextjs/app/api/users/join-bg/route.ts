import { NextResponse } from "next/server";
import { isBgMember } from "~~/services/api-bg/builders";
import { createBgMember } from "~~/services/api-bg/builders";
import { ReviewAction } from "~~/services/database/config/types";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { isValidEIP712JoinBGSignature } from "~~/services/eip712/join-bg";
import { JOIN_BG_DEPENDENCIES } from "~~/utils/dependent-challenges";

type JoinBGPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function POST(req: Request) {
  try {
    const { address, signature } = (await req.json()) as JoinBGPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const userJoinedBG = await isBgMember(address);

    if (userJoinedBG) {
      return NextResponse.json({ error: "User already joined BuidlGuidl" }, { status: 401 });
    }

    const userChallenges = await getLatestSubmissionPerChallengeByUser(address);

    const completedJoinBgDependencies = JOIN_BG_DEPENDENCIES.every(joinBgDependency =>
      userChallenges.find(
        userChallenge =>
          userChallenge.challengeId === joinBgDependency && userChallenge.reviewAction === ReviewAction.ACCEPTED,
      ),
    );

    if (!completedJoinBgDependencies) {
      return NextResponse.json({ error: "Required challenges have not been completed" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712JoinBGSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const user = await getUserByAddress(address);

    await createBgMember(user);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error during joining BuidlGuidl:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during joining BuidlGuidl";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
