import { NextRequest, NextResponse } from "next/server";
import { UserLocation, updateUserLocation } from "~~/services/database/repositories/users";
import { isValidEIP712UpdateLocationSignature } from "~~/services/eip712/location";

export type UpdateLocationPayload = {
  userAddress: string;
  location: UserLocation;
  signature: `0x${string}`;
};

export async function POST(req: NextRequest) {
  try {
    const { userAddress, location, signature } = (await req.json()) as UpdateLocationPayload;

    if (!userAddress || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValidSignature = await isValidEIP712UpdateLocationSignature({
      address: userAddress,
      signature,
      location: location || "",
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const updatedUser = await updateUserLocation(userAddress, location);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
