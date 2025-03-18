import { NextResponse } from "next/server";
import { findLatestSubmissionPerChallengeByUser } from "~~/services/database/repositories/userChallenges";

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const challenges = await findLatestSubmissionPerChallengeByUser(address);

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Error fetching user challenges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
