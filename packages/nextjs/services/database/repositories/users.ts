import { ReviewAction } from "../config/types";
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
export type UserWithChallengesData = Awaited<ReturnType<typeof findSortedUsersWithChallenges>>["data"][0];

export async function findUserByAddress(address: string) {
  return await db
    .select()
    .from(users)
    .where(eq(lower(users.userAddress), address.toLowerCase()));
}

export async function findSortedUsersWithChallenges(start: number, size: number, sorting: SortingState) {
  const sortingQuery = sorting[0] as ColumnSort;
  const query = db.query.users.findMany({
    limit: size,
    offset: start,
    orderBy: (users, { desc, asc }) =>
      sortingQuery && sortingQuery.id in users
        ? sortingQuery.desc
          ? desc(users[sortingQuery.id as keyof typeof users])
          : asc(users[sortingQuery.id as keyof typeof users])
        : [],
    with: {
      userChallenges: true,
    },
  });

  const [usersData, totalCount] = await Promise.all([query, db.$count(users)]);

  // TODO: add these fields to users table for db level sorting?
  const preparedUsersData = usersData.map(({ userChallenges, ...restUser }) => ({
    ...restUser,
    challengesCompleted: userChallenges.filter(userChallenge => userChallenge.reviewAction === ReviewAction.ACCEPTED)
      .length,
    lastActivity: userChallenges
      .sort((a, b) => new Date(a.submittedAt as Date).getTime() - new Date(b.submittedAt as Date).getTime())
      .at(0)?.submittedAt,
  }));

  if (sortingQuery?.id === "challengesCompleted") {
    preparedUsersData.sort((a, b) =>
      sortingQuery.desc ? b.challengesCompleted - a.challengesCompleted : a.challengesCompleted - b.challengesCompleted,
    );
  }
  if (sortingQuery?.id === "lastActivity") {
    preparedUsersData.sort((a, b) => {
      const dateA = a.lastActivity || a.createdAt;
      const dateB = b.lastActivity || b.createdAt;
      return sortingQuery.desc
        ? new Date(dateB as Date).getTime() - new Date(dateA as Date).getTime()
        : new Date(dateA as Date).getTime() - new Date(dateB as Date).getTime();
    });
  }
  // end of TODO

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

  return await db
    .update(users)
    .set(socialsToUpdate)
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();
}
