import { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, users } from "~~/services/database/config/schema";

export type UserInsert = InferInsertModel<typeof users>;
export type UserByAddress = Awaited<ReturnType<typeof findUserByAddress>>[0];

export async function findUserByAddress(address: string) {
  return await db
    .select()
    .from(users)
    .where(eq(lower(users.id), address.toLowerCase()));
}

export async function isUserRegistered(address: string) {
  return Boolean(await db.$count(users, eq(users.id, address)));
}

export async function createUser(user: UserInsert) {
  return await db.insert(users).values(user).returning();
}
