import { NextResponse } from "next/server";
import { ReviewAction } from "~~/services/database/config/types";
import { findLatestSubmissionsPerChallengeByUser } from "~~/services/database/repositories/userChallengeSubmissions";
import { isUserJoinedBG, updateUserRoleToBuilder } from "~~/services/database/repositories/users";
import { isValidEIP712JoinBGSignature } from "~~/services/eip712/join-bg";
import { JOIN_BG_DEPENDENCIES } from "~~/utils/dependent-challenges";

type JoinBGPayload = {
  address: string;
  signature: `0x${string}`;
};

// TODO: consider weather should we make request to buidlguidl.com or not
export async function POST(req: Request) {
  try {
    const { address, signature } = (await req.json()) as JoinBGPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const userJoinedBG = await isUserJoinedBG(address);

    if (userJoinedBG) {
      return NextResponse.json({ error: "User already joined Build Guild" }, { status: 401 });
    }

    const submissions = await findLatestSubmissionsPerChallengeByUser(address);

    const completedJoinBgDependencies = JOIN_BG_DEPENDENCIES.every(joinBgDependency =>
      submissions.find(
        submission => submission.challengeId === joinBgDependency && submission.reviewAction === ReviewAction.ACCEPTED,
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

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.log("Error during authentication:", error);
    console.error("Error during authentication:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
