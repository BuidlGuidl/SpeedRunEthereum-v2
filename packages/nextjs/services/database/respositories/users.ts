import { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { users } from "~~/services/database/config/schema";

export type UserInsert = InferInsertModel<typeof users>;

export async function findUserByAddress(address: string) {
  return await db.select().from(users).where(eq(users.id, address));
}

export async function createUser(user: UserInsert) {
  return await db.insert(users).values(user);
}
