/**
 * Server-side error reporting for the control plane.
 *
 * The platform previously had no error tracking of any kind: when a route threw
 * in production, the only trace was an unstructured stack in the platform log,
 * and nobody was notified. For a cost-observability product, being blind to your
 * own failures is the worst possible look.
 *
 * Two sinks, both optional-by-configuration and neither able to break a request:
 *
 *  1. A single-line structured JSON record on stderr. Always emitted. Vercel,
 *     Render, and every log drain parse this into queryable fields for free.
 *  2. Sentry, if SENTRY_DSN is set. Posted over Sentry's documented envelope
 *     HTTP endpoint rather than through @sentry/nextjs, so there is no build
 *     plugin, no bundled agent, and nothing to keep in step with Next's
 *     internals — setting the env var is the entire integration.
 *
 * reportError never throws and never rejects. An observability failure must not
 * become an outage.
 */

/** Header and field names that must never leave the process. */
const REDACTED_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-whoai-key",
  "proxy-authorization",
  "api-key",
  "apikey",
  "password",
  "secret",
  "token",
]);

const REDACTED = "[redacted]";

export type ErrorContext = {
  /** Where this came from, e.g. "route:/api/agents" or "cron:reset-budgets". */
  source?: string;
  /**
   * Request path, method, and headers, if the error happened serving one.
   * Header values are optional because Next's `onRequestError` hands over a
   * `Dict<string | string[]>`, whose index signature admits undefined.
   */
  request?: {
    path?: string;
    method?: string;
    headers?: Record<string, string | string[] | undefined>;
  };
  /** Anything else worth seeing next to the stack. Values are redacted by key. */
  extra?: Record<string, unknown>;
  /** Owner of the affected data, when known. Never include the user's email. */
  organizationId?: string;
};

function redactRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = REDACTED_KEYS.has(key.toLowerCase()) ? REDACTED : value;
  }
  return out;
}

function normalizeError(error: unknown): { type: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return { type: error.name || "Error", message: error.message, stack: error.stack };
  }
  return { type: "NonError", message: typeof error === "string" ? error : JSON.stringify(error) };
}

/**
 * Parse a Sentry DSN of the form https://<publicKey>@<host>/<projectId>.
 * Returns null for a missing or malformed DSN so a typo degrades to
 * log-only reporting rather than throwing on every error.
 */
function parseDsn(dsn: string): { url: string; publicKey: string } | null {
  try {
    const parsed = new URL(dsn);
    const projectId = parsed.pathname.replace(/^\//, "");
    if (!parsed.username || !projectId) return null;
    return {
      url: `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/`,
      publicKey: parsed.username,
    };
  } catch {
    return null;
  }
}

/** Sentry event IDs are 32 hex characters — a UUID with the dashes removed. */
function eventId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

async function sendToSentry(
  dsn: string,
  error: { type: string; message: string; stack?: string },
  context: ErrorContext,
): Promise<void> {
  const target = parseDsn(dsn);
  if (!target) return;

  const id = eventId();
  const now = new Date().toISOString();

  const payload = {
    event_id: id,
    timestamp: now,
    platform: "node",
    level: "error",
    logger: context.source ?? "control-plane",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
    server_name: process.env.VERCEL_REGION ?? undefined,
    exception: {
      values: [{ type: error.type, value: error.message, stacktrace: undefined }],
    },
    tags: {
      source: context.source ?? "unknown",
      route: context.request?.path ?? "unknown",
      method: context.request?.method ?? "unknown",
    },
    extra: {
      ...(context.extra ? redactRecord(context.extra) : {}),
      // Sent as plain text: reconstructing Sentry's structured stacktrace frames
      // by hand would be guesswork, and the raw stack is what you actually read.
      stack: error.stack,
      organizationId: context.organizationId,
      headers: context.request?.headers ? redactRecord(context.request.headers) : undefined,
    },
  };

  const envelope = [
    JSON.stringify({ event_id: id, sent_at: now }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(payload),
  ].join("\n");

  // Short timeout: a slow Sentry must not hold a serverless invocation open.
  await fetch(`${target.url}?sentry_key=${target.publicKey}&sentry_version=7`, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
    signal: AbortSignal.timeout(3000),
  });
}

/**
 * Record a server-side error. Safe to call from anywhere, including inside a
 * catch block whose only job is to keep the request alive.
 */
export async function reportError(error: unknown, context: ErrorContext = {}): Promise<void> {
  const normalized = normalizeError(error);

  // Always emit the structured line first, so a Sentry outage still leaves a
  // record in the platform log.
  try {
    console.error(
      JSON.stringify({
        level: "error",
        service: "control-plane",
        source: context.source,
        error: normalized.type,
        message: normalized.message,
        stack: normalized.stack,
        path: context.request?.path,
        method: context.request?.method,
        organizationId: context.organizationId,
        extra: context.extra ? redactRecord(context.extra) : undefined,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch {
    // JSON.stringify can throw on a circular `extra`. Fall back to the message.
    console.error(`[report] ${normalized.type}: ${normalized.message}`);
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    await sendToSentry(dsn, normalized, context);
  } catch {
    // Deliberately swallowed — see the module docblock.
  }
}
