import { NextRequest, NextResponse } from "next/server";
import { createUserNote, getUserNotes } from "~~/services/database/repositories/userNotes";
import { isValidEIP712CreateUserNoteSignature } from "~~/services/eip712/userNotes";
import { isAdminSession } from "~~/utils/auth";

export type CreateUserNotePayload = {
  address: string;
  signature: `0x${string}`;
  comment: string;
};

export async function GET(request: NextRequest, props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  try {
    const { address: userAddress } = params;

    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can view user notes" }, { status: 403 });
    }

    const notes = await getUserNotes(userAddress);
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ address: string }> }) {
  const params = await props.params;
  try {
    const { address: userAddress } = params;
    const { address: authorAddress, signature, comment }: CreateUserNotePayload = await request.json();

    if (!authorAddress || !signature || !comment || !userAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can create user notes" }, { status: 403 });
    }

    const isValidSignature = await isValidEIP712CreateUserNoteSignature({
      address: authorAddress,
      signature,
      userAddress,
      comment,
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const note = await createUserNote({ userAddress, authorAddress, comment });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Error creating user note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
