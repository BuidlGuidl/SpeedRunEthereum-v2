import { userChallenges } from "../config/schema";
import { ChallengeId } from "../config/types";
import { ReviewAction } from "../config/types";
import { InferInsertModel, and, eq, sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { challenges } from "~~/services/database/config/schema";

export type ChallengeInsert = InferInsertModel<typeof challenges>;
export type Challenges = Awaited<ReturnType<typeof getAllChallenges>>;

export async function getChallengeById(id: ChallengeId) {
  const result = await db.query.challenges.findFirst({
    where: (challenges, { eq }) => eq(challenges.id, id),
  });
  return result;
}

export async function getCountOfCompletedChallenge(challengeId: ChallengeId) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(userChallenges)
    .where(and(eq(userChallenges.challengeId, challengeId), eq(userChallenges.reviewAction, ReviewAction.ACCEPTED)));
  return Number(result[0].count);
}

export async function getAllChallenges() {
  return await db.select().from(challenges);
}
