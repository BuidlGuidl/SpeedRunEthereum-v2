import { and, eq, sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { chatTokenUsage } from "~~/services/database/config/schema";

// Total tokens (input + output) a wallet has spent on the given UTC day.
export async function getDailyTokenTotal(userAddress: string, day: string): Promise<number> {
  const row = await db.query.chatTokenUsage.findFirst({
    where: and(eq(chatTokenUsage.userAddress, userAddress), eq(chatTokenUsage.day, day)),
  });

  if (!row) return 0;
  return row.inputTokens + row.outputTokens;
}

// Atomically add a request's token spend to the wallet's daily row. The increment
// is computed in SQL so concurrent requests can't race past the budget.
export async function addDailyTokenUsage(userAddress: string, day: string, inputTokens: number, outputTokens: number) {
  await db
    .insert(chatTokenUsage)
    .values({ userAddress, day, inputTokens, outputTokens, requestCount: 1 })
    .onConflictDoUpdate({
      target: [chatTokenUsage.userAddress, chatTokenUsage.day],
      set: {
        inputTokens: sql`${chatTokenUsage.inputTokens} + ${inputTokens}`,
        outputTokens: sql`${chatTokenUsage.outputTokens} + ${outputTokens}`,
        requestCount: sql`${chatTokenUsage.requestCount} + 1`,
        updatedAt: sql`now()`,
      },
    });
}
