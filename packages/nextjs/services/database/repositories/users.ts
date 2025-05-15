import { BatchUserStatus, ReviewAction, UserRole } from "../config/types";
import { ColumnSort, SortingState } from "@tanstack/react-table";
import { InferInsertModel, and, isNotNull } from "drizzle-orm";
import { eq, ilike, sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges, users } from "~~/services/database/config/schema";

type PickSocials<T> = {
  [K in keyof T as K extends `social${string}` ? K : never]?: T[K] extends string | null ? string : never;
};

export type UserInsert = InferInsertModel<typeof users>;
export type UserByAddress = Awaited<ReturnType<typeof getUserByAddress>>;
export type UserSocials = PickSocials<NonNullable<UserByAddress>>;
export type UserWithChallengesData = Awaited<ReturnType<typeof getSortedUsersWithChallengesInfo>>["data"][0];
export type BatchBuilder = Awaited<ReturnType<typeof getSortedBatchBuilders>>["data"][0];
export type UserLocation = NonNullable<UserByAddress>["location"];

export async function getUserByAddress(address: string) {
  return await db.query.users.findFirst({
    where: eq(lower(users.userAddress), address.toLowerCase()),
  });
}

export async function getSortedUsersWithChallengesInfo(start: number, size: number, sorting: SortingState) {
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

export async function getSortedBatchBuilders({
  start,
  size,
  sorting,
  filter,
  batchId,
}: {
  start: number;
  size: number;
  sorting: SortingState;
  filter?: string;
  batchId?: number;
}) {
  const sortingQuery = sorting[0] as ColumnSort;
  const query = db.query.users.findMany({
    limit: size,
    offset: start,
    with: {
      batch: true,
    },
    where: users =>
      and(
        isNotNull(users.batchId),
        filter ? ilike(users.userAddress, `%${filter}%`) : undefined,
        batchId ? eq(users.batchId, batchId) : undefined,
      ),
    orderBy: (users, { desc, asc }) => {
      if (!sortingQuery) return [];

      const sortOrder = sortingQuery.desc ? desc : asc;

      if (sortingQuery.id === "batch_start") {
        return sortOrder(sql`(SELECT "start_date" FROM "batches" WHERE "batches"."id" = "users"."batch_id")`);
      }

      if (sortingQuery.id in users) {
        return sortOrder(users[sortingQuery.id as keyof typeof users]);
      }

      return [];
    },
  });

  const [buildersData] = await Promise.all([query]);

  const totalRowCount = await db.$count(
    users,
    and(
      isNotNull(users.batchId),
      filter ? ilike(users.userAddress, `%${filter}%`) : undefined,
      batchId ? eq(users.batchId, batchId) : undefined,
    ),
  );

  return {
    data: buildersData,
    meta: {
      totalRowCount,
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

export async function isUserAdmin(userAddress: string): Promise<boolean> {
  const user = await getUserByAddress(userAddress);
  return user?.role === UserRole.ADMIN;
}

export async function updateUser(
  userAddress: string,
  data: {
    role?: UserRole;
    batchId?: number;
    batchStatus?: BatchUserStatus;
  },
) {
  const result = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(lower(users.userAddress), userAddress.toLowerCase()))
    .returning();

  return result[0];
}
