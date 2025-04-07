import { NextRequest, NextResponse } from "next/server";
import { updateUserSocials } from "~~/services/database/repositories/users";
import { UserSocials } from "~~/services/database/repositories/users";
import { isValidEIP712UpdateSocialsSignature } from "~~/services/eip712/socials";

export type UpdateSocialsPayload = {
  userAddress: string;
  socials: UserSocials;
  signature: `0x${string}`;
};

export async function POST(req: NextRequest) {
  try {
    const { userAddress, socials, signature } = (await req.json()) as UpdateSocialsPayload;

    if (!userAddress || !socials || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712UpdateSocialsSignature({
      address: userAddress,
      signature,
      socials,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const updatedUser = await updateUserSocials(userAddress, socials);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Socials updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating socials:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
