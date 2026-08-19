/**
 * Where the FastAPI runtime lives.
 *
 * This used to be a literal `https://whoai-api.onrender.com/...` copied into
 * three files and two markdown docs. Moving hosts meant finding every copy, and
 * a missed one silently pointed customers at a dead box. One derived value with
 * one environment variable is the fix.
 *
 * Only `NEXT_PUBLIC_*` names work here: these values are baked into pages the
 * browser renders and into copy-pasteable code samples, so they must be
 * inlined at build time.
 */

/** Last-resort default: the current production runtime. */
const DEFAULT_RUNTIME_URL = "https://whoai-api.onrender.com";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

/**
 * Accepts either a bare origin or a full endpoint URL and returns the origin.
 *
 * The older NEXT_PUBLIC_GATEWAY_URL held a complete `/api/v1/chat/completions`
 * URL, and existing deployments still set it that way. Trimming a known
 * endpoint suffix lets those keep working untouched.
 */
function toBaseUrl(value: string): string {
  const trimmed = stripTrailingSlash(value.trim());
  return stripTrailingSlash(trimmed.replace(/\/api\/v1\/(chat\/completions|gateway\/completions)$/, ""));
}

/** Origin of the runtime, with no trailing slash. */
export const RUNTIME_BASE_URL: string = toBaseUrl(
  process.env.NEXT_PUBLIC_WHOAI_RUNTIME_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    DEFAULT_RUNTIME_URL,
);

/** OpenAI-compatible chat completions endpoint. */
export const GATEWAY_COMPLETIONS_URL = `${RUNTIME_BASE_URL}/api/v1/chat/completions`;

/**
 * Exchanges an agent API key for a short-lived gateway JWT. The runtime mounts
 * every router under `/api/v1`, and the auth router adds its own `/auth`, so
 * the full path is `/api/v1/auth/token` — not `/auth/token`.
 */
export const GATEWAY_TOKEN_URL = `${RUNTIME_BASE_URL}/api/v1/auth/token`;

/** Liveness probe: is the process up? Says nothing about its dependencies. */
export const RUNTIME_HEALTH_URL = `${RUNTIME_BASE_URL}/health`;

/**
 * Readiness probe: can it actually serve a request? This is what a status page
 * or uptime monitor wants — a runtime whose database is unreachable is alive
 * but useless, and only this endpoint tells them apart.
 */
export const RUNTIME_READY_URL = `${RUNTIME_BASE_URL}/health/ready`;

/**
 * Base URL to hand to an OpenAI-compatible client library. Those append
 * `/chat/completions` themselves, so they want the `/api/v1` prefix only.
 */
export const OPENAI_COMPATIBLE_BASE_URL = `${RUNTIME_BASE_URL}/api/v1`;

/** Exported for tests; the parsing rule is the part worth pinning down. */
export const __toBaseUrl = toBaseUrl;
