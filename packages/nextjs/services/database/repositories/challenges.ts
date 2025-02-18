import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { challenges } from "~~/services/database/config/schema";

export async function findChallengeById(id: string) {
  const result = await db.select().from(challenges).where(eq(challenges.id, id));
  return result[0];
}

export async function getAllChallenges() {
  return await db.select().from(challenges);
}
