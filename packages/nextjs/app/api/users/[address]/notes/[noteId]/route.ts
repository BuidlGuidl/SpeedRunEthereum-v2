import { NextRequest, NextResponse } from "next/server";
import { deleteUserNote } from "~~/services/database/repositories/userNotes";
import { isValidEIP712DeleteUserNoteSignature } from "~~/services/eip712/userNotes";
import { isAdminSession } from "~~/utils/auth";

export type DeleteUserNotePayload = {
  address: string;
  signature: `0x${string}`;
};

export async function DELETE(request: NextRequest, props: { params: Promise<{ address: string; noteId: string }> }) {
  const params = await props.params;
  try {
    const { noteId } = params;
    const { address, signature }: DeleteUserNotePayload = await request.json();

    if (!address || !signature || !noteId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAdmin = await isAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Only admins can delete user notes" }, { status: 403 });
    }

    const isValidSignature = await isValidEIP712DeleteUserNoteSignature({
      address,
      signature,
      noteId: Number(noteId),
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    await deleteUserNote(Number(noteId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
