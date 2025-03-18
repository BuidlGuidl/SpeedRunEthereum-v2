import { NextResponse } from "next/server";
import { findLatestSubmissionsPerChallengeByUser } from "~~/services/database/repositories/userChallengeSubmissions";

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const submissions = await findLatestSubmissionsPerChallengeByUser(address);

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching user challenge submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
