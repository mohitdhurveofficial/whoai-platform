// Validate the *shape* of a customer-supplied provider API key before we
// encrypt and store it. This is a cheap format gate — it catches obvious
// paste errors (wrong provider, truncated key, leftover whitespace) up front.
// It is NOT proof the key works; that is what the live "Test connection"
// action (POST /api/settings/providers/[provider]/test) is for.
//
// Never log the key itself anywhere in here.

export const SUPPORTED_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "grok",
  "deepseek",
] as const;

export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export function isSupportedProvider(p: string): p is SupportedProvider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(p);
}

// Per-provider prefix + minimum length. Prefixes match the documented formats:
//   OpenAI:    sk-...            (incl. project keys sk-proj-...)
//   Anthropic: sk-ant-...
//   Gemini:    AIza...           (Google API key)
//   Grok/xAI:  xai-...
//   DeepSeek:  sk-...
const RULES: Record<SupportedProvider, { prefixes: string[]; minLength: number }> = {
  openai: { prefixes: ["sk-"], minLength: 20 },
  anthropic: { prefixes: ["sk-ant-"], minLength: 20 },
  gemini: { prefixes: ["AIza"], minLength: 20 },
  grok: { prefixes: ["xai-"], minLength: 20 },
  deepseek: { prefixes: ["sk-"], minLength: 20 },
};

export type KeyFormatResult = { ok: true } | { ok: false; reason: string };

export function validateKeyFormat(provider: string, rawKey: string): KeyFormatResult {
  if (!isSupportedProvider(provider)) {
    return { ok: false, reason: `Unsupported provider "${provider}"` };
  }

  const key = (rawKey ?? "").trim();
  if (!key) {
    return { ok: false, reason: "API key is required" };
  }

  const rule = RULES[provider];

  if (key.length < rule.minLength) {
    return { ok: false, reason: "API key looks too short to be valid" };
  }

  if (/\s/.test(key)) {
    return { ok: false, reason: "API key must not contain whitespace" };
  }

  if (!rule.prefixes.some((p) => key.startsWith(p))) {
    const expected = rule.prefixes.map((p) => `"${p}…"`).join(" or ");
    return {
      ok: false,
      reason: `${provider} keys must start with ${expected}`,
    };
  }

  return { ok: true };
}
