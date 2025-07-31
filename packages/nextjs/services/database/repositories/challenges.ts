import { ChallengeId } from "../config/types";
import { InferInsertModel } from "drizzle-orm";
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

export async function getAllChallenges() {
  return await db.select().from(challenges);
}
