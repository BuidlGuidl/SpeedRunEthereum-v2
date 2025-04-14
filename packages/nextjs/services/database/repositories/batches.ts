import { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { batches, users } from "~~/services/database/config/schema";

export type BatchInsert = InferInsertModel<typeof batches>;
export type Batch = Awaited<ReturnType<typeof getBatchById>>;

export async function getBatchById(id: number) {
  return await db.query.batches.findFirst({
    where: eq(batches.id, id),
  });
}

export async function createBatch(batch: BatchInsert) {
  const result = await db.insert(batches).values(batch).returning();
  return result[0];
}

export async function updateBatch(id: number, data: Partial<BatchInsert>) {
  const result = await db.update(batches).set(data).where(eq(batches.id, id)).returning();
  return result[0];
}

export async function getUsersFromBatch(batchId: number) {
  return await db.query.users.findMany({
    where: eq(users.batchId, batchId),
  });
}
