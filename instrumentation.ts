import type { Instrumentation } from "next";

/**
 * Next.js instrumentation hook (root-level file convention, see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md).
 *
 * `onRequestError` is the framework's single catch-all for *every* server-side
 * error — Server Component renders, Route Handlers, Server Actions, and proxy.
 * Wiring it here means the 43 API routes get error reporting without each one
 * needing its own try/catch reporting call.
 */

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { reportError } = await import("@/lib/observability/report");

  await reportError(error, {
    source: `${context.routeType}:${context.routePath}`,
    request: {
      path: request.path,
      method: request.method,
      headers: request.headers,
    },
    extra: {
      routerKind: context.routerKind,
      renderSource: context.renderSource,
      // React may wrap the thrown error during RSC rendering; the digest is how
      // you tie the opaque client-side error back to this server-side report.
      digest: (error as { digest?: string }).digest,
    },
  });
};
