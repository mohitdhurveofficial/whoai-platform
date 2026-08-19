import { ProviderAdapter } from "./types";
import { OpenAICompatibleAdapter } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GeminiAdapter } from "./gemini";
import { PROVIDERS, isProviderId, resolveBaseUrl } from "@/lib/providers/registry";

// Which adapter serves a provider is decided by its `api` field in
// providers.json, not by a case per vendor. Anthropic and Gemini have genuinely
// different request shapes; everyone else is OpenAI-compatible and differs only
// by base URL.
export function getAdapter(provider: string): ProviderAdapter {
  const id = provider.toLowerCase();
  if (!isProviderId(id)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  switch (PROVIDERS[id].api) {
    case "anthropic":
      return new AnthropicAdapter();
    case "gemini":
      return new GeminiAdapter();
    case "openai":
      return new OpenAICompatibleAdapter(id, resolveBaseUrl(id));
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export * from "./types";
