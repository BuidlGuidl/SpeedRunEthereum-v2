import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { users } from "~~/services/database/config/schema";

export type UserInsert = InferInsertModel<typeof users>;

export async function getAllUsers() {
  return await db.select().from(users);
}
export async function createUser(user: UserInsert) {
  return await db.insert(users).values(user);
}
