import { ColumnSort, SortingState } from "@tanstack/react-table";
import { InferInsertModel, like } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { batches, users } from "~~/services/database/config/schema";

export type BatchInsert = InferInsertModel<typeof batches>;
export type Batch = Awaited<ReturnType<typeof getBatchById>>;

export async function getBatchById(id: number) {
  return await db.query.batches.findFirst({
    where: eq(batches.id, id),
  });
}

export async function getSortedBatchesInfo(start: number, size: number, sorting: SortingState, filter?: string) {
  const sortingQuery = sorting[0] as ColumnSort;

  const query = db.query.batches.findMany({
    limit: size,
    offset: start,
    where: filter ? like(batches.name, `%${filter}%`) : undefined,
    orderBy: (batches, { desc, asc }) => {
      if (!sortingQuery) return [];

      const sortOrder = sortingQuery.desc ? desc : asc;

      if (sortingQuery.id in batches) {
        return sortOrder(batches[sortingQuery.id as keyof typeof batches]);
      }

      return [];
    },
  });

  const [batchesData, countResult] = await Promise.all([
    query,
    filter
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(batches)
          .where(like(batches.name, `%${filter}%`))
      : db.$count(batches),
  ]);

  const totalCount = filter ? Number((countResult as { count: number }[])[0].count) : (countResult as number);

  return {
    data: batchesData,
    meta: {
      totalRowCount: totalCount,
    },
  };
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
