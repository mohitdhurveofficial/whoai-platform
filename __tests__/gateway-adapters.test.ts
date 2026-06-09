import { describe, it, expect, vi, afterEach } from "vitest";
import {
  providerFetch,
  providerErrorToStatus,
  GatewayError,
} from "@/lib/gateway/http";
import { getAdapter } from "@/lib/gateway/adapters";
import { OpenAIAdapter } from "@/lib/gateway/adapters/openai";
import { AnthropicAdapter } from "@/lib/gateway/adapters/anthropic";
import { GeminiAdapter } from "@/lib/gateway/adapters/gemini";

const realFetch = global.fetch;

afterEach(() => {
  global.fetch = realFetch;
  vi.restoreAllMocks();
});

function jsonResponse(obj: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lastFetchCall(): [string, any] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calls = (global.fetch as any).mock.calls;
  return calls[calls.length - 1];
}

describe("providerErrorToStatus", () => {
  it("maps upstream statuses to gateway statuses", () => {
    expect(providerErrorToStatus(429)).toBe(429); // rate limit passes through
    expect(providerErrorToStatus(504)).toBe(504); // timeout
    expect(providerErrorToStatus(408)).toBe(504);
    expect(providerErrorToStatus(500)).toBe(502); // upstream broken -> bad gateway
    expect(providerErrorToStatus(503)).toBe(502);
    expect(providerErrorToStatus(401)).toBe(400); // bad provider key -> client-fixable
    expect(providerErrorToStatus(400)).toBe(400);
  });
});

describe("providerFetch", () => {
  it("returns parsed JSON on success", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true, n: 1 }));
    const data = await providerFetch<{ ok: boolean; n: number }>(
      "https://x",
      { method: "POST" },
      { provider: "test" },
    );
    expect(data).toEqual({ ok: true, n: 1 });
  });

  it("throws GatewayError carrying the upstream status on 4xx", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { message: "bad model" } }, { status: 400 }));
    await expect(
      providerFetch("https://x", { method: "POST" }, { provider: "openai", retries: 0 }),
    ).rejects.toMatchObject({ status: 400, provider: "openai" });
  });

  it("retries a 429 then succeeds", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 429, headers: { "retry-after": "0" } }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const data = await providerFetch<{ ok: boolean }>(
      "https://x",
      { method: "POST" },
      { provider: "test", retries: 2 },
    );
    expect(data).toEqual({ ok: true });
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });

  it("gives up after exhausting retries on persistent 500", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ error: { message: "boom" } }, { status: 500 }));
    await expect(
      providerFetch("https://x", { method: "POST" }, { provider: "test", retries: 1 }),
    ).rejects.toMatchObject({ status: 500 });
    expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2); // initial + 1 retry
  });

  it("converts a timeout (abort) into a 504 GatewayError", async () => {
    global.fetch = vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_url: string, init: any) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }),
    ) as typeof fetch;

    await expect(
      providerFetch("https://x", { method: "POST" }, { provider: "slow", timeoutMs: 20, retries: 0 }),
    ).rejects.toMatchObject({ status: 504, provider: "slow" });
  });

  it("converts a network failure into a 502 GatewayError", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(
      providerFetch("https://x", { method: "POST" }, { provider: "net", retries: 0 }),
    ).rejects.toMatchObject({ status: 502, provider: "net" });
  });
});

describe("getAdapter", () => {
  it("resolves known providers and rejects unknown ones", () => {
    expect(getAdapter("openai")).toBeInstanceOf(OpenAIAdapter);
    expect(getAdapter("ANTHROPIC")).toBeInstanceOf(AnthropicAdapter);
    expect(() => getAdapter("madeup")).toThrow(/Unsupported provider/);
  });
});

describe("OpenAIAdapter", () => {
  it("routes to OpenAI and normalizes the response", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        id: "cmpl_1",
        model: "gpt-4o",
        choices: [{ message: { role: "assistant", content: "hi" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    );

    const res = await new OpenAIAdapter().chat(
      { model: "gpt-4o", messages: [{ role: "user", content: "hello" }] },
      "sk-test",
    );

    const [url, init] = lastFetchCall();
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer sk-test");
    expect(JSON.parse(init.body).model).toBe("gpt-4o");

    expect(res.provider).toBe("openai");
    expect(res.choices[0].message.content).toBe("hi");
    expect(res.usage).toEqual({ prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 });
  });

  it("propagates a provider 401 as a GatewayError", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { message: "invalid key" } }, { status: 401 }));
    await expect(
      new OpenAIAdapter().chat({ model: "gpt-4o", messages: [] }, "bad"),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});

describe("AnthropicAdapter", () => {
  it("lifts the system prompt out of messages and maps usage", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        id: "msg_1",
        model: "claude-3-5-sonnet-20240620",
        content: [{ type: "text", text: "hey" }],
        stop_reason: "end_turn",
        usage: { input_tokens: 7, output_tokens: 3 },
      }),
    );

    const res = await new AnthropicAdapter().chat(
      {
        model: "claude-3-5-sonnet-20240620",
        messages: [
          { role: "system", content: "be terse" },
          { role: "user", content: "hello" },
        ],
      },
      "sk-ant",
    );

    const [url, init] = lastFetchCall();
    const body = JSON.parse(init.body);
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers["x-api-key"]).toBe("sk-ant");
    expect(body.system).toBe("be terse"); // system not in messages
    expect(body.messages.every((m: { role: string }) => m.role !== "system")).toBe(true);

    expect(res.choices[0].finish_reason).toBe("stop");
    expect(res.usage).toEqual({ prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 });
  });
});

describe("GeminiAdapter", () => {
  it("maps roles, sends the key as a header, and reads usageMetadata", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        candidates: [
          { content: { parts: [{ text: "yo" }] }, finishReason: "STOP" },
        ],
        usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 2, totalTokenCount: 6 },
      }),
    );

    const res = await new GeminiAdapter().chat(
      {
        model: "gemini-1.5-pro",
        messages: [
          { role: "system", content: "sys" },
          { role: "user", content: "hi" },
          { role: "assistant", content: "prev" },
        ],
      },
      "g-key",
    );

    const [url, init] = lastFetchCall();
    const body = JSON.parse(init.body);
    // Key must not leak into the URL.
    expect(url).not.toContain("g-key");
    expect(init.headers["x-goog-api-key"]).toBe("g-key");
    expect(body.systemInstruction.parts[0].text).toBe("sys");
    expect(body.contents.map((c: { role: string }) => c.role)).toEqual(["user", "model"]);

    expect(res.choices[0].message.content).toBe("yo");
    expect(res.usage).toEqual({ prompt_tokens: 4, completion_tokens: 2, total_tokens: 6 });
  });
});
