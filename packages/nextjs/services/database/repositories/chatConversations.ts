import type { UIMessage } from "ai";
import { sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { chatConversations } from "~~/services/database/config/schema";

// Persist a chat session as one row, the whole conversation in a single jsonb document.
// Called from /api/chat's onFinish after each turn: the id is the client-minted conversationId,
// so the first turn inserts and every later turn rewrites the same row with the grown transcript.
// The whole blob is rewritten each time (no per-message diffing) — a few KB per session, so it's free.
export async function upsertChatConversation(
  id: string,
  userAddress: string,
  challengeId: string,
  messages: UIMessage[],
) {
  await db
    .insert(chatConversations)
    .values({ id, userAddress, challengeId, messages, messageCount: messages.length })
    .onConflictDoUpdate({
      target: chatConversations.id,
      set: {
        messages,
        messageCount: messages.length,
        updatedAt: sql`now()`,
      },
    });
}
