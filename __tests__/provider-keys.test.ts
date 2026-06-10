import { describe, it, expect } from "vitest";
import { validateKeyFormat, isSupportedProvider } from "@/lib/providers/key-format";

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
  it("recognizes the five supported providers", () => {
    for (const p of ["openai", "anthropic", "gemini", "grok", "deepseek"]) {
      expect(isSupportedProvider(p)).toBe(true);
    }
    expect(isSupportedProvider("cohere")).toBe(false);
  });
});
