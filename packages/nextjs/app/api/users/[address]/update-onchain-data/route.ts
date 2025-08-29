import { NextResponse } from "next/server";
import { UserUpdate, getUserByAddress, isUserAdmin, updateUser } from "~~/services/database/repositories/users";
import { isValidEIP712UpdateOnchainDataSignature } from "~~/services/eip712/onchain-data";
import { fetchOnchainData } from "~~/services/onchainData";

type UpdateOnchainDataPayload = {
  address: string;
  signature: `0x${string}`;
};

export async function PUT(req: Request, props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  try {
    const { address, signature } = (await req.json()) as UpdateOnchainDataPayload;

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature are required" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    const addressToUpdate = params.address.toLowerCase();

    if (address.toLowerCase() !== addressToUpdate.toLowerCase() && !isAdmin) {
      return NextResponse.json({ error: "Address mismatch" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712UpdateOnchainDataSignature({ address, signature });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    try {
      const currentUser = await getUserByAddress(addressToUpdate);

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const { ensData, sideQuestsSnapshot } = await fetchOnchainData(currentUser);

      const updateData: UserUpdate = {
        ens: ensData?.name || undefined,
        ensAvatar: ensData?.avatar || undefined,
      };

      if (sideQuestsSnapshot) {
        // Merge existing completed side quests with new ones
        const existingSnapshot = currentUser.sideQuestsSnapshot || {};
        updateData.sideQuestsSnapshot = { ...existingSnapshot, ...sideQuestsSnapshot };
      }

      const user = await updateUser(addressToUpdate, updateData);

      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error(`Error updating onchain data for user ${address}:`, error);
      return NextResponse.json({ error: "Failed to update onchain data" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error during onchain data update:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
