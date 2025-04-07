import { InferInsertModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges } from "~~/services/database/config/schema";

export type UserChallengeInsert = InferInsertModel<typeof userChallenges>;
export type UserChallenges = Awaited<ReturnType<typeof getLatestSubmissionPerChallengeByUser>>;

export async function getLatestSubmissionPerChallengeByUser(userAddress: string) {
  const allChallenges = await db.query.userChallenges.findMany({
    where: eq(lower(userChallenges.userAddress), userAddress.toLowerCase()),
    with: {
      challenge: true,
    },
    orderBy: (userChallenges, { desc }) => [desc(userChallenges.id)],
  });

  const latestChallenges = new Map<string, (typeof allChallenges)[number]>();

  for (const challenge of allChallenges) {
    if (!latestChallenges.has(challenge.challengeId)) {
      latestChallenges.set(challenge.challengeId, challenge);
    }
  }

  return Array.from(latestChallenges.values());
}

export async function createUserChallenge(challenge: UserChallengeInsert) {
  const result = await db.insert(userChallenges).values(challenge).returning();
  if (!result?.[0]) {
    throw new Error("Failed to create submission. Try again later.");
  }
  return result[0];
}

export async function updateUserChallengeById(id: number, updates: Partial<UserChallengeInsert>) {
  const result = await db.update(userChallenges).set(updates).where(eq(userChallenges.id, id)).returning();
  if (!result?.[0]) {
    throw new Error("Failed to update submission with grading result. Try again later.");
  }
  return result[0];
}
