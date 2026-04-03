import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Full list: https://openrouter.ai/models
// Model IDs follow the format "provider/model-name".
type OpenRouterModelId = "minimax/minimax-m2.7" | "minimax/minimax-m2.5" | "qwen/qwen3.5-27b";
type OpenAIModelId = Parameters<typeof openai>[0];
type GoogleModelId = Parameters<typeof google>[0];

const MODEL_CONFIGS = {
  openai: {
    provider: openai,
    modelId: "gpt-4.1-nano" satisfies OpenAIModelId as OpenAIModelId,
  },
  google: {
    provider: google,
    modelId: "gemini-2.5-flash" satisfies GoogleModelId as GoogleModelId,
  },
  openrouter: {
    provider: openrouter.chat,
    modelId: "qwen/qwen3.5-27b" as OpenRouterModelId,
  },
};

type ModelProvider = keyof typeof MODEL_CONFIGS;

function getActiveProvider(): ModelProvider {
  const envProvider = process.env.AI_PROVIDER;
  if (envProvider === "google" || envProvider === "openrouter") return envProvider;
  return "openai";
}

export function getChatModel() {
  const provider = getActiveProvider();
  const config = MODEL_CONFIGS[provider];
  return config.provider(config.modelId);
}

export function getModelInfo() {
  const provider = getActiveProvider();
  return { provider, modelId: MODEL_CONFIGS[provider].modelId };
}
