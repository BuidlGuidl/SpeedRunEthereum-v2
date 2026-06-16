import { addDailyTokenUsage, getDailyTokenTotal } from "~~/services/database/repositories/chatTokenUsage";

// Token-abuse limits for the AI chat assistant
export const DAILY_TOKEN_BUDGET = Number(process.env.CHAT_DAILY_TOKEN_BUDGET) || 1_000_000;
export const MAX_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_OUTPUT_TOKENS) || 5_000;

// UTC day bucket (YYYY-MM-DD) — the fixed-window key for the daily budget.
function getUtcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

// Check-then-charge, step 1: is the wallet already over today's budget?
// We can only know a request's true cost after it runs, so the gate is a
// pre-check against accumulated spend rather than a per-request estimate.
export async function isOverDailyBudget(userAddress: string): Promise<boolean> {
  const used = await getDailyTokenTotal(userAddress, getUtcDay());
  return used >= DAILY_TOKEN_BUDGET;
}

// Check-then-charge, step 2: add the actual usage once the stream finishes.
export async function chargeTokenUsage(userAddress: string, inputTokens: number, outputTokens: number) {
  await addDailyTokenUsage(userAddress, getUtcDay(), inputTokens, outputTokens);
}
