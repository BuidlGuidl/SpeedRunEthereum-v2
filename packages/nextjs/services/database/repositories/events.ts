import { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { events } from "~~/services/database/config/schema";

export type EventInsert = InferInsertModel<typeof events>;

export async function createEvent(event: EventInsert) {
  return await db.insert(events).values(event).returning();
}
