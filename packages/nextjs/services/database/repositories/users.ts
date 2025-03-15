import { ReviewAction } from "../config/types";
import { UserRole } from "../config/types";
import { ColumnSort, SortingState } from "@tanstack/react-table";
import { InferInsertModel } from "drizzle-orm";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges, users } from "~~/services/database/config/schema";

type PickSocials<T> = {
  [K in keyof T as K extends `social${string}` ? K : never]?: T[K] extends string | null ? string : never;
};

export type UserInsert = InferInsertModel<typeof users>;
export type UserByAddress = Awaited<ReturnType<typeof findUserByAddress>>[0];
export type UserSocials = PickSocials<UserByAddress>;
export type UserWithChallengesData = Awaited<ReturnType<typeof findSortedUsersWithChallenges>>["data"][0];

export async function findUserByAddress(address: string) {
  return await db
    .select()
    .from(users)
    .where(eq(lower(users.userAddress), address.toLowerCase()));
}

export async function findSortedUsersWithChallenges(start: number, size: number, sorting: SortingState) {
  const sortingQuery = sorting[0] as ColumnSort;

  // Define SQL expressions once
  const challengesCompletedExpr = sql`(SELECT COUNT(DISTINCT uc.challenge_id) FROM ${userChallenges} uc WHERE uc.user_address = ${users.userAddress} AND uc.review_action = ${ReviewAction.ACCEPTED})`;
  const lastActivityExpr = sql`COALESCE(
    (SELECT MAX(uc.submitted_at) FROM ${userChallenges} uc WHERE uc.user_address = ${users.userAddress}),
    ${users.createdAt}
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
        return sortOrder(lastActivityExpr);
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
      lastActivity: lastActivityExpr.as("lastActivity"),
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
  return await db.insert(users).values(user).returning();
}

export async function updateUserSocials(userAddress: string, socials: UserSocials) {
  // Non-values on socials should be saved as NULL
  const socialsToUpdate = Object.fromEntries(Object.entries(socials).map(([key, value]) => [key, value || null]));

  // Update lastUpdatedAt whenever user data changes
  return await db
    .update(users)
    .set({
      ...socialsToUpdate,
      lastUpdatedAt: new Date(),
    })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();
}

export async function isUserJoinedBG(userAddress: string) {
  return Boolean(
    await db.$count(
      users,
      and(
        eq(lower(users.userAddress), userAddress.toLowerCase()),
        or(eq(users.role, UserRole.BUILDER), eq(users.role, UserRole.ADMIN)),
      ),
    ),
  );
}

export async function updateUserRoleToBuilder(userAddress: string) {
  return await db
    .update(users)
    .set({
      role: UserRole.BUILDER,
      lastUpdatedAt: new Date(),
    })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();
}
