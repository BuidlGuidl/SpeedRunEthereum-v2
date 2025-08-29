import { ReviewAction, UserRole } from "../config/types";
import { getLatestSubmissionPerChallengeByUser } from "./userChallenges";
import { ColumnSort, SortingState } from "@tanstack/react-table";
import { InferInsertModel, and, eq, ilike, inArray, isNotNull, or, sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { challenges, lower, userChallenges, users } from "~~/services/database/config/schema";
import { BatchUserStatus } from "~~/services/database/config/types";
import { BATCH_XP, BUILD_XP, CHALLENGE_XP, SIDE_QUEST_XP } from "~~/utils/xp";

type PickSocials<T> = {
  [K in keyof T as K extends `social${string}` ? K : never]?: T[K] extends string | null ? string : never;
};

export type UserInsert = InferInsertModel<typeof users>;
export type UserUpdate = Partial<Omit<UserInsert, "userAddress">>;
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

export async function getUserByEns(ensName: string) {
  return await db.query.users.findFirst({
    where: eq(lower(users.ens), ensName.toLowerCase()),
  });
}

export async function getSortedUsersWithChallengesInfo(
  start: number,
  size: number,
  sorting: SortingState,
  filter?: string,
) {
  const sortingQuery = sorting[0] as ColumnSort;

  const challengesCompletedExpr = sql`(SELECT COUNT(DISTINCT uc.challenge_id) FROM ${userChallenges} uc INNER JOIN ${challenges} c ON uc.challenge_id = c.id WHERE uc.user_address = ${users.userAddress} AND uc.review_action = ${ReviewAction.ACCEPTED} AND c.disabled = false)`;
  const lastActivityIsoExpr = sql`to_char(
    COALESCE(
      (SELECT MAX(uc.submitted_at) FROM ${userChallenges} uc WHERE uc.user_address = ${users.userAddress}),
      ${users.createdAt}
    ),
    'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
  )`;

  const filterConditions = filter
    ? or(
        ilike(users.userAddress, `%${filter}%`),
        ilike(users.ens, `%${filter}%`),
        ilike(users.socialTelegram, `%${filter}%`),
        ilike(users.socialX, `%${filter}%`),
        ilike(users.socialGithub, `%${filter}%`),
        ilike(users.socialInstagram, `%${filter}%`),
        ilike(users.socialDiscord, `%${filter}%`),
        ilike(users.socialEmail, `%${filter}%`),
      )
    : undefined;

  const query = db.query.users.findMany({
    limit: size,
    offset: start,
    where: filterConditions,
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

  const [usersData, totalCount] = await Promise.all([query, db.$count(users, filterConditions)]);

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
  const buildersData = await db.query.users.findMany({
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

export async function updateUser(userAddress: string, data: UserUpdate) {
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

export async function filterValidUserAddresses(addresses: string[]): Promise<string[]> {
  if (!addresses.length) return [];
  const rows = await db
    .select({ userAddress: users.userAddress })
    .from(users)
    .where(inArray(users.userAddress, addresses));
  return rows.map(row => row.userAddress);
}

export async function getUserXP(userAddress: string) {
  const lowercaseAddress = userAddress.toLowerCase();

  const user = await db.query.users.findFirst({
    where: eq(lower(users.userAddress), lowercaseAddress),
    with: {
      buildBuilders: true,
    },
  });

  const userLatestSubmissions = await getLatestSubmissionPerChallengeByUser(lowercaseAddress);

  const acceptedNonDisabledChallengesCount =
    userLatestSubmissions.filter(
      userSubmission => userSubmission.reviewAction === ReviewAction.ACCEPTED && !userSubmission.challenge.disabled,
    ).length || 0;
  const hasBatch = user?.batchStatus === BatchUserStatus.GRADUATE;
  const hasBuilds = user?.buildBuilders && user?.buildBuilders.length > 0;

  const challengePoints = acceptedNonDisabledChallengesCount * CHALLENGE_XP;
  const sideQuestPoints = Object.keys(user?.sideQuestsSnapshot || {}).length * SIDE_QUEST_XP;
  const batchPoints = hasBatch ? BATCH_XP : 0;
  const buildPoints = hasBuilds ? BUILD_XP : 0;

  return challengePoints + sideQuestPoints + batchPoints + buildPoints;
}
