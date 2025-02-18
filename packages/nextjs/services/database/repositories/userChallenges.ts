import { InferInsertModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { lower, userChallenges } from "~~/services/database/config/schema";

export type UserChallengeInsert = InferInsertModel<typeof userChallenges>;
export type UserChallenges = Awaited<ReturnType<typeof findUserChallengesByAddress>>;

export async function findUserChallengesByAddress(userAddress: string) {
  return await db
    .select()
    .from(userChallenges)
    .where(eq(lower(userChallenges.userAddress), userAddress.toLowerCase()));
}

export async function upsertUserChallenge(challenge: UserChallengeInsert) {
  return await db
    .insert(userChallenges)
    .values(challenge)
    .onConflictDoUpdate({
      target: [userChallenges.userAddress, userChallenges.challengeCode],
      set: {
        frontendUrl: challenge.frontendUrl,
        contractUrl: challenge.contractUrl,
        reviewAction: challenge.reviewAction,
        reviewComment: challenge.reviewComment,
        submittedTimestamp: challenge.submittedTimestamp,
      },
    });
}
