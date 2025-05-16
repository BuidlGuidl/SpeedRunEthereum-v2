import { BatchStatus } from "../config/types";
import { ColumnSort, SortingState } from "@tanstack/react-table";
import { InferInsertModel, ilike } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { batches, lower, users } from "~~/services/database/config/schema";

export type BatchInsert = InferInsertModel<typeof batches>;
export type Batch = Awaited<ReturnType<typeof getBatchById>>;
export type BatchWithCounts = Awaited<ReturnType<typeof getSortedBatches>>["data"][0];

export async function getBatchById(id: number) {
  return await db.query.batches.findFirst({
    where: eq(batches.id, id),
  });
}

export async function getBatchByBgSubdomain(bgSubdomain: string) {
  return await db.query.batches.findFirst({
    where: eq(lower(batches.bgSubdomain), bgSubdomain.toLowerCase()),
  });
}

export async function getSortedBatches(start: number, size: number, sorting: SortingState, filter?: string) {
  const sortingQuery = sorting[0] as ColumnSort;

  const query = db.query.batches.findMany({
    limit: size,
    offset: start,
    where: filter ? ilike(batches.name, `%${filter}%`) : undefined,
    orderBy: (batches, { desc, asc }) => {
      if (!sortingQuery) return [];

      const sortOrder = sortingQuery.desc ? desc : asc;

      if (sortingQuery.id in batches) {
        return sortOrder(batches[sortingQuery.id as keyof typeof batches]);
      }

      return [];
    },
  });

  const [batchesData, totalCount, userCounts] = await Promise.all([
    query,
    db.$count(batches, filter ? ilike(batches.name, `%${filter}%`) : undefined),
    db
      .select({
        batchId: users.batchId,
        candidateCount: sql<number>`count(*) filter (where ${users.batchStatus} = 'candidate')`,
        graduateCount: sql<number>`count(*) filter (where ${users.batchStatus} = 'graduate')`,
      })
      .from(users)
      .groupBy(users.batchId),
  ]);

  const batchesWithCounts = batchesData.map(batch => {
    const counts = userCounts.find(count => count.batchId === batch.id) || {
      candidateCount: 0,
      graduateCount: 0,
    };
    return {
      ...batch,
      candidateCount: Number(counts.candidateCount),
      graduateCount: Number(counts.graduateCount),
    };
  });

  if (sortingQuery?.id === "graduateCount") {
    batchesWithCounts.sort((a, b) => {
      const aCount = a.graduateCount || 0;
      const bCount = b.graduateCount || 0;
      return sortingQuery.desc ? bCount - aCount : aCount - bCount;
    });
  }

  return {
    data: batchesWithCounts,
    meta: {
      totalRowCount: totalCount,
    },
  };
}

export async function getBatchNameList() {
  return await db.query.batches.findMany({
    columns: {
      id: true,
      name: true,
    },
    orderBy: (batches, { desc }) => desc(batches.startDate),
  });
}

export async function getLatestOpenBatch() {
  return await db.query.batches.findFirst({
    where: eq(batches.status, BatchStatus.OPEN),
    orderBy: (batches, { desc }) => desc(batches.startDate),
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
