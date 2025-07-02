import { NextResponse } from "next/server";
import { isUserAdmin, updateUser } from "~~/services/database/repositories/users";
import { isValidEIP712UpdateEnsSignature } from "~~/services/eip712/ens";
import { publicClient } from "~~/utils/short-address-and-ens";

type UpdateEnsPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function PUT(req: Request, { params }: { params: { address: string } }) {
  try {
    const { address, signature } = (await req.json()) as UpdateEnsPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    const addressToUpdateEns = params.address.toLowerCase();

    if (address.toLowerCase() !== addressToUpdateEns.toLowerCase() && !isAdmin) {
      return NextResponse.json({ error: "Address mismatch" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712UpdateEnsSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    try {
      const ensName = await publicClient.getEnsName({ address: addressToUpdateEns });

      if (!ensName) {
        return NextResponse.json({ error: "No ENS name found for this address" }, { status: 400 });
      }

      const ensAvatar = await publicClient.getEnsAvatar({ name: ensName });

      const user = await updateUser(addressToUpdateEns, { ens: ensName, ensAvatar });

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
