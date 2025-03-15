import { InferInsertModel, and, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges } from "~~/services/database/config/schema";

export type UserChallengeInsert = InferInsertModel<typeof userChallenges>;
export type UserChallenges = Awaited<ReturnType<typeof findLatestSubmissionPerChallengeByUser>>;

/**
 * Finds the latest submission for each challenge a user has attempted
 * @param userAddress The Ethereum address of the user
 * @returns An array of the latest submission for each challenge
 */
export async function findLatestSubmissionPerChallengeByUser(userAddress: string) {
  // First, get all user challenges
  const allChallenges = await db.query.userChallenges.findMany({
    where: eq(lower(userChallenges.userAddress), userAddress.toLowerCase()),
    with: {
      challenge: true,
    },
    orderBy: (userChallenges, { desc }) => [desc(userChallenges.id)],
  });

  // Create a map to store the latest submission for each challenge
  const latestChallenges = new Map();

  // Iterate through all challenges and keep only the latest submission for each challenge ID
  for (const challenge of allChallenges) {
    if (!latestChallenges.has(challenge.challengeId)) {
      latestChallenges.set(challenge.challengeId, challenge);
    }
  }

  // Convert the map values back to an array
  return Array.from(latestChallenges.values());
}

/**
 * Creates a new challenge submission record
 * @param challenge The challenge submission data
 * @returns The newly created challenge submission
 */
export async function createUserChallenge(challenge: UserChallengeInsert) {
  return await db
    .insert(userChallenges)
    .values(challenge)
    .returning();
}

/**
 * Updates an existing challenge submission by ID
 * @param id The ID of the challenge submission to update
 * @param updates The fields to update
 * @returns The updated challenge submission
 */
export async function updateUserChallengeById(id: number, updates: Partial<UserChallengeInsert>) {
  return await db
    .update(userChallenges)
    .set({
      ...updates,
      // Update the submittedAt timestamp if not explicitly provided
      ...(updates.submittedAt ? {} : { submittedAt: new Date() }),
    })
    .where(eq(userChallenges.id, id))
    .returning();
}
