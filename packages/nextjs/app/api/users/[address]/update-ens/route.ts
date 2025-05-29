import { NextResponse } from "next/server";
import { updateUser } from "~~/services/database/repositories/users";
import { publicClient } from "~~/utils/ens-or-address";

export async function PUT(req: Request, { params }: { params: { address: string } }) {
  try {
    const address = params.address.toLowerCase();

    try {
      const ensName = await publicClient.getEnsName({ address });

      if (!ensName) {
        return NextResponse.json({ error: "No ENS name found for this address" }, { status: 400 });
      }

      const user = await updateUser(address, { ens: ensName });

      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error(`Error getting ENS name for user ${address}:`, error);
      return NextResponse.json({ error: "Failed to resolve ENS name" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error during ENS update:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
