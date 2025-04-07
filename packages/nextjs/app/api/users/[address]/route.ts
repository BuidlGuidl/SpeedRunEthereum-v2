import { NextResponse } from "next/server";
import { getUserByAddress } from "~~/services/database/repositories/users";

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const user = await getUserByAddress(address);

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("Error fetching user:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during fetching user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
