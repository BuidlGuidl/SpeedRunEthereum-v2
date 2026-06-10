import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, createIdGenerator, streamText } from "ai";
import { upsertChatConversation } from "~~/services/database/repositories/chatConversations";
import { getUserByAddress } from "~~/services/database/repositories/users";
import { fetchGithubChallengeReadme, fetchGithubConceptsYaml } from "~~/services/github";
import { getChatModel } from "~~/utils/ai/models";
import { MAX_OUTPUT_TOKENS, chargeTokenUsage, isOverDailyBudget } from "~~/utils/ai/rate-limit";
import { buildChatSystemPrompt } from "~~/utils/ai/system-prompt";

export const maxDuration = 60;

// Server-side id for each new assistant message. The SDK's generator (prefixed, collision-resistant)
// is the canonical persistence choice; the id is streamed to the client so its copy and the stored
// copy match. Distinct from conversationId (the row PK / opik session id), which stays a uuid.
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

  // conversationId is the client-minted session id; it keys the persisted transcript row (ADR 0004).
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

  // Drain the stream server-side (no await) so onFinish still fires — and the row still saves —
  // if the builder closes the tab mid-answer.
  void result.consumeStream();

  return result.toUIMessageStreamResponse({
    // streamText only ever sees model messages, so without originalMessages the response's onFinish
    // would hand back just the new assistant turn. Passing the incoming UIMessage[] puts the SDK in
    // "persistence mode": onFinish.messages becomes originalMessages + the response, i.e. the whole
    // conversation, and the response message gets a real id (not "").
    originalMessages: messages,
    // The last original message is the user's, so a fresh assistant message is created; without this
    // it would be stored with an empty id. Give every persisted message a real id.
    generateMessageId: newMessageId,
    // Persist the whole assembled conversation once the turn completes. This is the *second*
    // onFinish: streamText's onFinish (above) charges tokens; this one logs the transcript.
    // The full UIMessage[] is stored whole (ADR 0004).
    onFinish: ({ messages: updatedMessages }) => {
      void upsertChatConversation(conversationId, userAddress, challengeId, updatedMessages);
    },
  });
}
