import { ChallengeId } from "../config/types";
import { InferInsertModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { challenges } from "~~/services/database/config/schema";

export type ChallengeInsert = InferInsertModel<typeof challenges>;
export type Challenges = Awaited<ReturnType<typeof getAllChallenges>>;

export async function getChallengeById(id: ChallengeId) {
  const result = await db.select().from(challenges).where(eq(challenges.id, id));
  if (!result?.[0]) {
    throw new Error("Challenge is not found");
  }
  return result[0];
}

export async function getAllChallenges() {
  return await db.select().from(challenges);
}
