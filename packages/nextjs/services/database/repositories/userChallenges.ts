import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { userChallenges } from "~~/services/database/config/schema";

export type UserChallengeInsert = InferInsertModel<typeof userChallenges>;

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
