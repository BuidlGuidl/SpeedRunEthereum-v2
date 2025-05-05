import { NextResponse } from "next/server";
import { BatchUserStatus, UserRole } from "~~/services/database/config/types";
import { updateUser } from "~~/services/database/repositories/users";
import { isUserAdmin } from "~~/services/database/repositories/users";
import { isValidEIP712UpdateUserSignature } from "~~/services/eip712/users";

export type UpdateUserPayload = {
  signature: `0x${string}`;
  role: UserRole;
  batchId?: number;
  batchStatus?: BatchUserStatus;
  address: string;
};

export async function PUT(request: Request, { params }: { params: { address: string } }) {
  try {
    const { address: userAddress } = params;
    const { signature, role, batchId, batchStatus, address }: UpdateUserPayload = await request.json();

    if (!address || !signature || !role || !userAddress || (batchId && !batchStatus)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isUserAdmin(address);
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can update users" }, { status: 403 });
    }

    const isValidSignature = await isValidEIP712UpdateUserSignature({
      address,
      signature,
      role,
      batchId,
      batchStatus,
      userAddress,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const updatedUser = await updateUser(userAddress, {
      role,
      batchId,
      batchStatus,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
