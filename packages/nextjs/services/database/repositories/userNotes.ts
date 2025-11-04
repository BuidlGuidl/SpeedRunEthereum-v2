import { InferInsertModel, InferSelectModel, desc, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { userNotes } from "~~/services/database/config/schema";

export type UserNote = InferSelectModel<typeof userNotes>;
export type UserNoteInsert = InferInsertModel<typeof userNotes>;

export type UserNoteWithAuthor = UserNote & {
  author: {
    userAddress: string;
    ens: string | null;
    ensAvatar: string | null;
  };
};

export async function getUserNotes(userAddress: string): Promise<UserNoteWithAuthor[]> {
  const notes = await db.query.userNotes.findMany({
    where: eq(userNotes.userAddress, userAddress),
    orderBy: [desc(userNotes.createdAt)],
    with: {
      author: {
        columns: {
          userAddress: true,
          ens: true,
          ensAvatar: true,
        },
      },
    },
  });

  return notes;
}

export async function createUserNote(note: UserNoteInsert): Promise<UserNote> {
  const result = await db.insert(userNotes).values(note).returning();
  return result[0];
}

export async function deleteUserNote(noteId: number): Promise<void> {
  await db.delete(userNotes).where(eq(userNotes.id, noteId));
}
