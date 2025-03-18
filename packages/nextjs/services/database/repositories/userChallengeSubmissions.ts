import { InferInsertModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallengeSubmissions } from "~~/services/database/config/schema";

export type UserChallengeSubmissionInsert = InferInsertModel<typeof userChallengeSubmissions>;
export type UserChallengeSubmissions = Awaited<ReturnType<typeof findLatestSubmissionsPerChallengeByUser>>;

export async function findLatestSubmissionsPerChallengeByUser(userAddress: string) {
  const allSubmissions = await db.query.userChallengeSubmissions.findMany({
    where: eq(lower(userChallengeSubmissions.userAddress), userAddress.toLowerCase()),
    with: {
      challenge: true,
    },
    orderBy: (userChallengeSubmissions, { desc }) => [desc(userChallengeSubmissions.id)],
  });

  const latestSubmissions = new Map();

  for (const submission of allSubmissions) {
    if (!latestSubmissions.has(submission.challengeId)) {
      latestSubmissions.set(submission.challengeId, submission);
    }
  }

  return Array.from(latestSubmissions.values());
}

export async function createUserChallengeSubmission(submission: UserChallengeSubmissionInsert) {
  return await db.insert(userChallengeSubmissions).values(submission).returning();
}

export async function updateUserChallengeSubmissionById(id: number, updates: Partial<UserChallengeSubmissionInsert>) {
  return await db
    .update(userChallengeSubmissions)
    .set({
      ...updates,
      ...(updates.submittedAt ? {} : { submittedAt: new Date() }),
    })
    .where(eq(userChallengeSubmissions.id, id))
    .returning();
}
