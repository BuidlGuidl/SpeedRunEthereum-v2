import { NextResponse } from "next/server";
import { getUserByAddress } from "~~/services/database/repositories/users";

export async function GET(_req: Request, props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const user = await getUserByAddress(address);
    if (!user) {
      return NextResponse.json({ user: undefined }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
