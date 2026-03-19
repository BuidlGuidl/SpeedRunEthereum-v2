import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

// Extract the model ID types from each provider's function signature.
// This gives us full autocomplete on model IDs (e.g. "gpt-4o-mini", "gemini-2.5-flash")
// without needing to import unexported types.
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
};

type ModelProvider = keyof typeof MODEL_CONFIGS;

function getActiveProvider(): ModelProvider {
  const envProvider = process.env.AI_PROVIDER;
  if (envProvider === "google") return envProvider;

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
