import { ProviderAdapter } from "./types";
import { OpenAIAdapter } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GeminiAdapter } from "./gemini";
import { GrokAdapter } from "./grok";
import { DeepSeekAdapter } from "./deepseek";

export function getAdapter(provider: string): ProviderAdapter {
  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIAdapter();
    case "anthropic":
      return new AnthropicAdapter();
    case "gemini":
      return new GeminiAdapter();
    case "grok":
      return new GrokAdapter();
    case "deepseek":
      return new DeepSeekAdapter();
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export * from "./types";
