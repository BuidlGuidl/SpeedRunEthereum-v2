import { InferInsertModel, eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { challenges } from "~~/services/database/config/schema";

export type ChallengeInsert = InferInsertModel<typeof challenges>;
export type Challenges = Awaited<ReturnType<typeof getAllChallenges>>;

export async function getChallengeById(id: string) {
  const result = await db.select().from(challenges).where(eq(challenges.id, id));
  return result[0];
}

export async function getAllChallenges() {
  return await db.select().from(challenges);
}
