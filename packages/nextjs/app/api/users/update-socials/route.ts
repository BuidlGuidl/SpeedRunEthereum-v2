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

    return NextResponse.json({
      success: true,
      message: "Socials updated successfully",
      user: updatedUser,
    });
  } catch (error: unknown) {
    console.error("Error updating socials:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during updating socials";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
