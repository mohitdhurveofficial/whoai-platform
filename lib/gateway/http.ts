/**
 * Shared HTTP layer for provider adapters.
 *
 * Every upstream LLM call goes through `providerFetch`, which adds the three
 * things a gateway must never skip: a hard timeout, bounded retries on
 * transient failures, and structured error propagation that preserves the
 * upstream status code.
 */

export class GatewayError extends Error {
  /** Upstream HTTP status (or a synthesized one: 504 timeout, 502 network). */
  status: number;
  provider?: string;

  constructor(message: string, status: number, provider?: string) {
    super(message);
    this.name = "GatewayError";
    this.status = status;
    this.provider = provider;
  }
}

// Transient statuses worth retrying. 429 = rate limit, 5xx = upstream wobble.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export interface ProviderFetchOptions {
  provider: string;
  timeoutMs?: number;
  retries?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number) {
  // Exponential (0.3s, 0.6s, 1.2s…) capped at 4s, plus jitter to avoid stampedes.
  return Math.min(300 * 2 ** attempt, 4000) + Math.floor(Math.random() * 100);
}

function retryAfterMs(res: Response): number | null {
  const header = res.headers.get("retry-after");
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 10_000);
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) return Math.max(0, Math.min(dateMs - Date.now(), 10_000));
  return null;
}

/**
 * Fetch JSON from a provider with timeout + retry. Throws GatewayError on any
 * non-2xx response (after retries), on timeout (status 504), or on a network
 * error (status 502). The returned value is the parsed JSON body.
 */
// Provider payloads are loosely-typed third-party JSON; callers narrow as needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function providerFetch<T = any>(
  url: string,
  init: RequestInit,
  { provider, timeoutMs = 60_000, retries = 2 }: ProviderFetchOptions,
): Promise<T> {
  let lastError: GatewayError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      // Retry transient statuses while we still have attempts left.
      if (RETRYABLE_STATUS.has(res.status) && attempt < retries) {
        await sleep(retryAfterMs(res) ?? backoffMs(attempt));
        continue;
      }

      const raw = await res.text();
      let data: unknown = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        // Provider returned non-JSON (e.g. an HTML 502 page).
        data = { rawBody: raw.slice(0, 500) };
      }

      if (!res.ok) {
        throw new GatewayError(`${provider} error: ${extractMessage(data, res.statusText)}`, res.status, provider);
      }

      return data as T;
    } catch (err) {
      clearTimeout(timer);

      // A classified upstream HTTP error is final — don't retry a 400/401.
      if (err instanceof GatewayError) throw err;

      const isAbort = err instanceof Error && err.name === "AbortError";
      lastError = isAbort
        ? new GatewayError(`${provider} request timed out after ${timeoutMs}ms`, 504, provider)
        : new GatewayError(
            `${provider} network error: ${err instanceof Error ? err.message : "unknown"}`,
            502,
            provider,
          );

      if (attempt < retries) {
        await sleep(backoffMs(attempt));
        continue;
      }
      throw lastError;
    }
  }

  // Safety net: the loop returns, continues, or throws on the final attempt,
  // so this is effectively unreachable.
  throw lastError ?? new GatewayError(`${provider} request failed`, 502, provider);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessage(data: any, fallback: string): string {
  return (
    data?.error?.message ||
    (typeof data?.error === "string" ? data.error : undefined) ||
    data?.message ||
    fallback ||
    "request failed"
  );
}

/**
 * Map an upstream/provider status to the status the gateway should return.
 * - 429 rate limit and 504 timeout are passed through.
 * - 5xx upstream failures become 502 Bad Gateway.
 * - 4xx (bad model, rejected provider key) become 400 so the caller can fix it.
 */
export function providerErrorToStatus(status: number): number {
  if (status === 429) return 429;
  if (status === 504 || status === 408) return 504;
  if (status >= 500) return 502;
  if (status >= 400) return 400;
  return 500;
}
