import type { UIMessage } from "ai";
import { sql } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { chatConversations } from "~~/services/database/config/schema";

// Upsert a chat session: first turn inserts, later turns rewrite the same row with the grown transcript.
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
