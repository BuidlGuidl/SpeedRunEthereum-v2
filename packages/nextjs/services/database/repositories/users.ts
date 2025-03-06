import { UserRole } from "../config/types";
import { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, users } from "~~/services/database/config/schema";

type PickSocials<T> = {
  [K in keyof T as K extends `social${string}` ? K : never]?: T[K] extends string | null ? string : never;
};

export type UserInsert = InferInsertModel<typeof users>;
export type UserByAddress = Awaited<ReturnType<typeof findUserByAddress>>[0];
export type UserSocials = PickSocials<UserByAddress>;

export async function findUserByAddress(address: string) {
  return await db
    .select()
    .from(users)
    .where(eq(lower(users.userAddress), address.toLowerCase()));
}

export async function isUserRegistered(address: string) {
  return Boolean(await db.$count(users, eq(users.userAddress, address)));
}

export async function createUser(user: UserInsert) {
  return await db.insert(users).values(user).returning();
}

export async function updateUserSocials(userAddress: string, socials: UserSocials) {
  // Non-values on socials should be saved as NULL
  const socialsToUpdate = Object.fromEntries(Object.entries(socials).map(([key, value]) => [key, value || null]));

  return await db
    .update(users)
    .set(socialsToUpdate)
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();
}

export async function isUserJoinedBG(userAddress: string) {
  return Boolean(
    await db.$count(users, eq(lower(users.userAddress), userAddress.toLowerCase()) && eq(users.role, UserRole.BUILDER)),
  );
}

export async function updateUserJoinBG(userAddress: string) {
  return await db
    .update(users)
    .set({ role: UserRole.BUILDER })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();
}
