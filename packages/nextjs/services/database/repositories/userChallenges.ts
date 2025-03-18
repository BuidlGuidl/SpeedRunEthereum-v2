import { InferInsertModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges } from "~~/services/database/config/schema";

export type UserChallengeInsert = InferInsertModel<typeof userChallenges>;
export type UserChallenges = Awaited<ReturnType<typeof findLatestSubmissionPerChallengeByUser>>;

export async function findLatestSubmissionPerChallengeByUser(userAddress: string) {
  const allChallenges = await db.query.userChallenges.findMany({
    where: eq(lower(userChallenges.userAddress), userAddress.toLowerCase()),
    with: {
      challenge: true,
    },
    orderBy: (userChallenges, { desc }) => [desc(userChallenges.id)],
  });

  const latestChallenges = new Map();

  for (const challenge of allChallenges) {
    if (!latestChallenges.has(challenge.challengeId)) {
      latestChallenges.set(challenge.challengeId, challenge);
    }
  }

  return Array.from(latestChallenges.values());
}

export async function createUserChallenge(challenge: UserChallengeInsert) {
  return await db.insert(userChallenges).values(challenge).returning();
}

export async function updateUserChallengeById(id: number, updates: Partial<UserChallengeInsert>) {
  return await db
    .update(userChallenges)
    .set({
      ...updates,
      ...(updates.submittedAt ? {} : { submittedAt: new Date() }),
    })
    .where(eq(userChallenges.id, id))
    .returning();
}
