import { ColumnSort, SortingState } from "@tanstack/react-table";
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

export async function findSortedUsersGroup(start: number, size: number, sorting: SortingState) {
  let query = db.select().from(users) as any;

  if (sorting.length) {
    const sort = sorting[0] as ColumnSort;
    const { id, desc } = sort as { id: keyof typeof users; desc: boolean };
    query = query.orderBy(users[id], desc ? "desc" : "asc");
  }

  const [users_data, total_count] = await Promise.all([query.limit(size).offset(start), db.$count(users)]);

  return {
    data: users_data,
    meta: {
      totalRowCount: total_count,
    },
  };
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
