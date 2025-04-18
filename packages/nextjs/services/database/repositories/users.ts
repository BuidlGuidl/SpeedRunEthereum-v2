import { ReviewAction } from "../config/types";
import { UserRole } from "../config/types";
import { ColumnSort, SortingState } from "@tanstack/react-table";
import { InferInsertModel } from "drizzle-orm";
import { eq, sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges, users } from "~~/services/database/config/schema";

type PickSocials<T> = {
  [K in keyof T as K extends `social${string}` ? K : never]?: T[K] extends string | null ? string : never;
};

export type UserInsert = InferInsertModel<typeof users>;
export type UserByAddress = Awaited<ReturnType<typeof getUserByAddress>>;
export type UserSocials = PickSocials<NonNullable<UserByAddress>>;
export type UserLocation = NonNullable<UserByAddress>["location"];
export type UserWithChallengesData = Awaited<ReturnType<typeof getSortedUsersWithChallenges>>["data"][0];

export async function getUserByAddress(address: string) {
  return await db.query.users.findFirst({
    where: eq(lower(users.userAddress), address.toLowerCase()),
  });
}

export async function getSortedUsersWithChallenges(start: number, size: number, sorting: SortingState) {
  const sortingQuery = sorting[0] as ColumnSort;

  const challengesCompletedExpr = sql`(SELECT COUNT(DISTINCT uc.challenge_id) FROM ${userChallenges} uc WHERE uc.user_address = ${users.userAddress} AND uc.review_action = ${ReviewAction.ACCEPTED})`;
  const lastActivityIsoExpr = sql`to_char(
    COALESCE(
      (SELECT MAX(uc.submitted_at) FROM ${userChallenges} uc WHERE uc.user_address = ${users.userAddress}),
      ${users.createdAt}
    ),
    'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
  )`;

  const query = db.query.users.findMany({
    limit: size,
    offset: start,
    orderBy: (users, { desc, asc }) => {
      if (!sortingQuery) return [];

      const sortOrder = sortingQuery.desc ? desc : asc;
      // Use the pre-defined SQL expressions for sorting
      if (sortingQuery.id === "challengesCompleted") {
        return sortOrder(challengesCompletedExpr);
      }

      if (sortingQuery.id === "lastActivity") {
        return sortOrder(lastActivityIsoExpr);
      }

      // For regular fields in the users table
      if (sortingQuery.id in users) {
        return sortOrder(users[sortingQuery.id as keyof typeof users]);
      }

      return [];
    },
    extras: {
      // Reuse the same SQL expressions for the extras
      challengesCompleted: challengesCompletedExpr.as("challengesCompleted"),
      lastActivity: lastActivityIsoExpr.as("lastActivity"),
    },
    with: {
      userChallenges: true,
    },
  });

  const [usersData, totalCount] = await Promise.all([query, db.$count(users)]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const preparedUsersData = usersData.map(({ userChallenges, ...restUser }) => ({
    ...restUser,
    challengesCompleted: Number(restUser.challengesCompleted),
    lastActivity: restUser.lastActivity as Date,
  }));

  return {
    data: preparedUsersData,
    meta: {
      totalRowCount: totalCount,
    },
  };
}

export async function isUserRegistered(address: string) {
  return Boolean(await db.$count(users, eq(users.userAddress, address)));
}

export async function createUser(user: UserInsert) {
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

export async function updateUserSocials(userAddress: string, socials: UserSocials) {
  // Non-values on socials should be saved as NULL
  const socialsToUpdate = Object.fromEntries(Object.entries(socials).map(([key, value]) => [key, value || null]));

  // Update updatedAt whenever user data changes
  const result = await db
    .update(users)
    .set({
      ...socialsToUpdate,
      updatedAt: new Date(),
    })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();

  return result[0];
}

export async function updateUserLocation(userAddress: string, location: UserLocation) {
  const result = await db
    .update(users)
    .set({
      location,
      updatedAt: new Date(),
    })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();

  return result[0];
}

export async function updateUserRoleToBuilder(userAddress: string) {
  const result = await db
    .update(users)
    .set({
      role: UserRole.BUILDER,
      updatedAt: new Date(),
    })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();

  return result[0];
}
