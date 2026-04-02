import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, streamText } from "ai";
import { fetchGithubChallengeReadme, fetchGithubConceptsYaml } from "~~/services/github";
import { getChatModel } from "~~/utils/ai/models";
import { buildChatSystemPrompt } from "~~/utils/ai/system-prompt";
import { isAdminSession } from "~~/utils/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, challengeId, github } = await req.json();

  if (!messages || !challengeId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
  });

  return result.toUIMessageStreamResponse();
}
