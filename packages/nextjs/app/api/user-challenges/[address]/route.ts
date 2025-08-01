import { NextResponse } from "next/server";
import { getLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";

export async function GET(_req: Request, props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const challenges = await getLatestSubmissionPerChallengeByUser(address);

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Error fetching user challenges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
