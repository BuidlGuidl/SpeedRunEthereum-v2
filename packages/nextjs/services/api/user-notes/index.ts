import { DeleteUserNotePayload } from "~~/app/api/users/[address]/notes/[noteId]/route";
import { CreateUserNotePayload } from "~~/app/api/users/[address]/notes/route";
import { UserNote, UserNoteWithAuthor } from "~~/services/database/repositories/userNotes";

export async function fetchUserNotes(userAddress: string): Promise<UserNoteWithAuthor[]> {
  const response = await fetch(`/api/users/${userAddress}/notes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user notes: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.notes as UserNoteWithAuthor[];
}

export async function createUserNote(
  payload: CreateUserNotePayload & { userAddress: string },
): Promise<{ note: UserNote }> {
  const response = await fetch(`/api/users/${payload.userAddress}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create note");
  }

  return response.json();
}

export async function deleteUserNote(
  userAddress: string,
  noteId: number,
  payload: DeleteUserNotePayload,
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/users/${userAddress}/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete note");
  }

  return response.json();
}
