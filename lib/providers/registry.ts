// The supported-provider registry, read straight from providers.json at the
// project root — the same file the Python gateway reads
// (runtime/providers/provider_factory.py). Supporting a new vendor is one entry
// there; nothing in this directory, the adapters, or the settings UI is a list
// that has to be kept in step by hand.

import registry from "@/providers.json";

export type ProviderId = keyof typeof registry.providers;

export type ProviderEntry = {
  label: string;
  /** Wire protocol: "openai" (the shared adapter), "anthropic" or "gemini". */
  api: string;
  /** Endpoint for OpenAI-compatible vendors. Null for native adapters, which own their URLs. */
  baseUrl: string | null;
  /** Optional env var that overrides baseUrl, for self-hosted or private endpoints. */
  baseUrlEnv?: string;
  keyEnv: string;
  /** Documented key prefixes. Empty when the vendor publishes none. */
  keyPrefixes: string[];
  keyRequired: boolean;
  docsUrl: string | null;
};

export const PROVIDERS: Record<ProviderId, ProviderEntry> = registry.providers;

/** Every provider the gateway can route to. */
export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

/**
 * Providers a customer connects by pasting their own key. Excludes self-hosted
 * endpoints (Ollama, a private OpenAI-compatible deployment), which the operator
 * points at a URL via environment variables rather than through the BYOK UI.
 */
export const BYOK_PROVIDER_IDS = PROVIDER_IDS.filter((id) => PROVIDERS[id].keyRequired);

export function isProviderId(id: string): id is ProviderId {
  return Object.prototype.hasOwnProperty.call(PROVIDERS, id);
}

/**
 * Endpoint for an OpenAI-compatible provider, with the environment override
 * applied. Throws for a self-hosted entry nobody has configured — better a clear
 * error than a request to a placeholder localhost URL.
 */
export function resolveBaseUrl(id: ProviderId): string {
  const entry = PROVIDERS[id];
  const url = (entry.baseUrlEnv ? process.env[entry.baseUrlEnv] : undefined) ?? entry.baseUrl;
  if (!url) {
    throw new Error(
      `Provider "${id}" has no endpoint configured. Set ${entry.baseUrlEnv ?? "its baseUrl"}.`,
    );
  }
  return url;
}
