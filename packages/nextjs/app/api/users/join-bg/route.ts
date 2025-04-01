import { NextResponse } from "next/server";
import { createBgMember, isBgMember } from "~~/services/api-bg/builders";
import { ReviewAction } from "~~/services/database/config/types";
import { findLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";
import { updateUserRoleToBuilder } from "~~/services/database/repositories/users";
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
      return NextResponse.json({ error: "User already joined Build Guild" }, { status: 401 });
    }

    const userChallenges = await findLatestSubmissionPerChallengeByUser(address);

    const completedJoinBgDependencies = JOIN_BG_DEPENDENCIES.every(joinBgDependency =>
      userChallenges.find(
        userChallenge =>
          userChallenge.challengeId === joinBgDependency && userChallenge.reviewAction === ReviewAction.ACCEPTED,
      ),
    );

    if (!completedJoinBgDependencies) {
      return NextResponse.json({ error: "Required challenges have not been completed" }, { status: 400 });
    }

    const isValidSignature = isValidEIP712JoinBGSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const users = await updateUserRoleToBuilder(address);
    await createBgMember(users[0]);

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
