import { NextResponse } from "next/server";
import { getUserByAddress } from "~~/services/database/repositories/users";

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const users = await getUserByAddress(address);
    if (users.length === 0) {
      return NextResponse.json({ user: undefined }, { status: 404 });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
