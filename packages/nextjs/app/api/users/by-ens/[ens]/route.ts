import { NextResponse } from "next/server";
import { getUserByEns } from "~~/services/database/repositories/users";

export async function GET(_req: Request, { params }: { params: { ens: string } }) {
  try {
    const { ens } = params;

    if (!ens) {
      return NextResponse.json({ error: "Ens is required" }, { status: 400 });
    }

    const user = await getUserByEns(ens);
    if (!user) {
      return NextResponse.json({ user: undefined }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
