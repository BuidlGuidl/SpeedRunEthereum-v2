import { challenges } from "../config/schema";
import { db } from "~~/services/database/config/postgresClient";

export async function getAllChallenges() {
  return await db.select().from(challenges);
}
