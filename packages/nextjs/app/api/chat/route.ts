import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, createIdGenerator, streamText } from "ai";
import { upsertChatConversation } from "~~/services/database/repositories/chatConversations";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { fetchGithubChallengeReadme, fetchGithubConceptsYaml } from "~~/services/github";
import { getChatModel } from "~~/utils/ai/models";
import { MAX_OUTPUT_TOKENS, chargeTokenUsage, isOverDailyBudget } from "~~/utils/ai/rate-limit";
import { buildChatSystemPrompt } from "~~/utils/ai/system-prompt";

export const maxDuration = 60;

// Stable ids for persisted assistant messages (streamed to the client so both copies match).
const newMessageId = createIdGenerator({ prefix: "msg", size: 16 });

export async function POST(req: NextRequest) {
  const { messages, challengeId, github, address, conversationId } = await req.json();

  // TODO: this is not proof of ownership:
  // a client could send any registered address (impersonation is accepted for now; future EIP-712 or SIWE?).
  const userAddress = typeof address === "string" ? address.toLowerCase() : null;
  if (!userAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only registered builders can use the assistant.
  const user = await getUserByAddress(userAddress);
  if (!user) {
    return NextResponse.json({ error: "Register as a builder to use the assistant." }, { status: 403 });
  }

  // conversationId keys the persisted transcript row.
  if (!messages || !challengeId || typeof conversationId !== "string") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Token-abuse gate: reject before generating if the wallet is over its daily budget.
  if (await isOverDailyBudget(userAddress)) {
    return NextResponse.json({ error: "Daily message limit reached. It resets at midnight UTC." }, { status: 429 });
  }

  let readme: string | null = null;
  let conceptsYaml: string | null = null;

  if (github) {
    const [readmeResult, conceptsResult] = await Promise.allSettled([
      fetchGithubChallengeReadme(github),
      fetchGithubConceptsYaml(github),
    ]);
    readme = readmeResult.status === "fulfilled" ? readmeResult.value : null;
    conceptsYaml = conceptsResult.status === "fulfilled" ? conceptsResult.value : null;
  }

  const systemPrompt = buildChatSystemPrompt(readme, challengeId, conceptsYaml);

  // Convert UIMessages (from client's useChat) to ModelMessages (for streamText)
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: getChatModel(),
    system: systemPrompt,
    messages: modelMessages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    // Charge actual spend after the stream ends, the only point token counts exist.
    onFinish: ({ totalUsage }) => {
      void chargeTokenUsage(userAddress, totalUsage.inputTokens ?? 0, totalUsage.outputTokens ?? 0);
    },
    onError: error => {
      console.error("Chat stream error:", error);
    },
  });

  // Drain server-side so the transcript still saves if the builder closes the tab mid-answer.
  void result.consumeStream();

  return result.toUIMessageStreamResponse({
    // Persistence mode: onFinish gets the whole conversation (with ids), not just the new turn.
    originalMessages: messages,
    generateMessageId: newMessageId,
    // Log the full transcript once the turn completes (the token charge happens above in streamText).
    onFinish: ({ messages: updatedMessages }) => {
      void upsertChatConversation(conversationId, userAddress, challengeId, updatedMessages);
    },
  });
}
