import { describe, it, expect } from "vitest";
import {
  validateKeyFormat,
  isSupportedProvider,
  SUPPORTED_PROVIDERS,
} from "@/lib/providers/key-format";
import { PROVIDERS, PROVIDER_IDS } from "@/lib/providers/registry";

describe("validateKeyFormat", () => {
  it("accepts well-formed keys per provider", () => {
    expect(validateKeyFormat("openai", "sk-" + "a".repeat(40)).ok).toBe(true);
    expect(validateKeyFormat("openai", "sk-proj-" + "a".repeat(40)).ok).toBe(true);
    expect(validateKeyFormat("anthropic", "sk-ant-" + "a".repeat(40)).ok).toBe(true);
    expect(validateKeyFormat("gemini", "AIza" + "a".repeat(35)).ok).toBe(true);
    expect(validateKeyFormat("grok", "xai-" + "a".repeat(40)).ok).toBe(true);
    expect(validateKeyFormat("deepseek", "sk-" + "a".repeat(40)).ok).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(validateKeyFormat("openai", "  sk-" + "a".repeat(40) + "  ").ok).toBe(true);
  });

  it("rejects the wrong provider prefix", () => {
    const r = validateKeyFormat("anthropic", "sk-" + "a".repeat(40)); // missing sk-ant-
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/sk-ant-/);
  });

  it("rejects keys that are too short", () => {
    expect(validateKeyFormat("openai", "sk-abc").ok).toBe(false);
  });

  it("rejects keys with internal whitespace", () => {
    expect(validateKeyFormat("openai", "sk-aaaa aaaa" + "a".repeat(30)).ok).toBe(false);
  });

  it("rejects empty/missing keys", () => {
    expect(validateKeyFormat("openai", "").ok).toBe(false);
    expect(validateKeyFormat("openai", "   ").ok).toBe(false);
  });

  it("rejects unsupported providers", () => {
    expect(validateKeyFormat("cohere", "sk-" + "a".repeat(40)).ok).toBe(false);
  });
});

describe("isSupportedProvider", () => {
  it("recognizes every provider a customer can bring a key for", () => {
    for (const p of ["openai", "anthropic", "gemini", "grok", "deepseek", "groq", "mistral"]) {
      expect(isSupportedProvider(p)).toBe(true);
    }
    expect(isSupportedProvider("cohere")).toBe(false);
  });

  it("excludes self-hosted endpoints, which are configured by env not by key", () => {
    for (const id of PROVIDER_IDS) {
      expect(isSupportedProvider(id)).toBe(PROVIDERS[id].keyRequired);
    }
  });
});

describe("the registry itself", () => {
  it("accepts a plausible key for every BYOK provider", () => {
    // A prefix rule invented for a vendor that publishes none would reject real
    // keys, so a documented prefix must actually validate.
    for (const id of SUPPORTED_PROVIDERS) {
      const prefix = PROVIDERS[id].keyPrefixes[0] ?? "";
      expect(validateKeyFormat(id, prefix + "a".repeat(40)).ok).toBe(true);
    }
  });

  it("gives every OpenAI-compatible provider an endpoint to reach", () => {
    for (const id of PROVIDER_IDS) {
      const entry = PROVIDERS[id];
      if (entry.api === "openai" && entry.keyRequired) {
        expect(entry.baseUrl).toMatch(/^https:\/\//);
      }
    }
  });
});
