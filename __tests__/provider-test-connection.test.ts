import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the shared HTTP layer so adapter.validateKey never makes a real network
// call. We keep the real GatewayError class so runAuthCheck's instanceof checks
// behave correctly.
vi.mock("@/lib/gateway/http", async () => {
  const actual = await vi.importActual<typeof import("@/lib/gateway/http")>(
    "@/lib/gateway/http",
  );
  return { ...actual, providerFetch: vi.fn() };
});

import { providerFetch, GatewayError } from "@/lib/gateway/http";
import { OpenAIAdapter } from "@/lib/gateway/adapters/openai";
import { AnthropicAdapter } from "@/lib/gateway/adapters/anthropic";

const mockFetch = vi.mocked(providerFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("adapter.validateKey", () => {
  it("returns ok:true when the auth check succeeds (2xx)", async () => {
    mockFetch.mockResolvedValueOnce({ data: [] });
    const res = await new OpenAIAdapter().validateKey("sk-test");
    expect(res.ok).toBe(true);
    // Hits the zero-cost /models endpoint, not chat/completions.
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/models",
      expect.objectContaining({ method: "GET" }),
      expect.objectContaining({ provider: "openai" }),
    );
  });

  it("returns ok:false on a 401 (rejected key)", async () => {
    mockFetch.mockRejectedValueOnce(new GatewayError("unauthorized", 401, "openai"));
    const res = await new OpenAIAdapter().validateKey("sk-bad");
    expect(res.ok).toBe(false);
    expect(res.detail).toMatch(/Authentication failed/i);
  });

  it("returns ok:false with detail on a transient/5xx error", async () => {
    mockFetch.mockRejectedValueOnce(new GatewayError("anthropic error: 503", 503, "anthropic"));
    const res = await new AnthropicAdapter().validateKey("sk-ant-test");
    expect(res.ok).toBe(false);
    expect(res.detail).toBeTruthy();
  });

  it("does not throw on a non-GatewayError failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom"));
    const res = await new OpenAIAdapter().validateKey("sk-test");
    expect(res.ok).toBe(false);
  });
});
