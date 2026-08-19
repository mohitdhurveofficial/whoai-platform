// Validate the *shape* of a customer-supplied provider API key before we
// encrypt and store it. This is a cheap format gate — it catches obvious
// paste errors (wrong provider, truncated key, leftover whitespace) up front.
// It is NOT proof the key works; that is what the live "Test connection"
// action (POST /api/settings/providers/[provider]/test) is for.
//
// Never log the key itself anywhere in here.

import { BYOK_PROVIDER_IDS, PROVIDERS, type ProviderId } from "./registry";

export const SUPPORTED_PROVIDERS = BYOK_PROVIDER_IDS;

export type SupportedProvider = ProviderId;

export function isSupportedProvider(p: string): p is SupportedProvider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(p);
}

// Shortest plausible key across every vendor we support. Deliberately generous:
// this only has to catch a truncated paste, and rejecting a real key would be
// far worse than letting the live connection test do the real work.
const MIN_KEY_LENGTH = 20;

export type KeyFormatResult = { ok: true } | { ok: false; reason: string };

export function validateKeyFormat(provider: string, rawKey: string): KeyFormatResult {
  if (!isSupportedProvider(provider)) {
    return { ok: false, reason: `Unsupported provider "${provider}"` };
  }

  const key = (rawKey ?? "").trim();
  if (!key) {
    return { ok: false, reason: "API key is required" };
  }

  if (key.length < MIN_KEY_LENGTH) {
    return { ok: false, reason: "API key looks too short to be valid" };
  }

  if (/\s/.test(key)) {
    return { ok: false, reason: "API key must not contain whitespace" };
  }

  // Prefixes come from providers.json and are only set where the vendor
  // documents a stable one. An empty list means length and whitespace are the
  // only checks — an invented prefix rule would reject valid keys.
  const { keyPrefixes } = PROVIDERS[provider];
  if (keyPrefixes.length > 0 && !keyPrefixes.some((p) => key.startsWith(p))) {
    const expected = keyPrefixes.map((p) => `"${p}…"`).join(" or ");
    return { ok: false, reason: `${provider} keys must start with ${expected}` };
  }

  return { ok: true };
}
