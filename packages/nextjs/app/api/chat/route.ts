import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, streamText } from "ai";
import { fetchGithubAgentsMd, fetchGithubChallengeReadme } from "~~/services/github";
import { getChatModel } from "~~/utils/ai/models";
import { buildChatSystemPrompt } from "~~/utils/ai/system-prompt";
import { isAdminSession } from "~~/utils/auth";

export const maxDuration = 60;

// TODO: For now I went with simple cache but probably in future we need to find a better way to store this files. Because we might hit the github API limit
// Cache challenge context so we don't hit GitHub API on every message.
// Keyed by github string (e.g. "scaffold-eth/se-2-challenges:challenge-tokenization").
// Lives in the Node.js process — works for both Vercel warm containers and local dev.
const contextCache = new Map<string, { agentsMd: string | null; readme: string | null }>();

async function getChallengeContext(github: string) {
  const cached = contextCache.get(github);
  if (cached) return cached;

  const [agentsResult, readmeResult] = await Promise.allSettled([
    fetchGithubAgentsMd(github),
    fetchGithubChallengeReadme(github),
  ]);

  const context = {
    agentsMd: agentsResult.status === "fulfilled" ? agentsResult.value : null,
    readme: readmeResult.status === "fulfilled" ? readmeResult.value : null,
  };

  contextCache.set(github, context);
  return context;
}

export async function POST(req: NextRequest) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, challengeId, github } = await req.json();

  if (!messages || !challengeId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { agentsMd, readme } = github ? await getChallengeContext(github) : { agentsMd: null, readme: null };

  const systemPrompt = buildChatSystemPrompt(agentsMd, readme, challengeId);

  // Convert UIMessages (from client's useChat) to ModelMessages (for streamText)
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: getChatModel(),
    system: systemPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
