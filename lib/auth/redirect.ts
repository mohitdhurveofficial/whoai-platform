/** Where a user lands after signing in when nothing else is requested. */
export const DEFAULT_POST_LOGIN_PATH = "/dashboard";

/**
 * Sanitize a `?redirectTo=` value into a path we are willing to send a
 * freshly-authenticated user to.
 *
 * This value arrives from the URL, so an attacker controls it. Handing it to
 * `window.location` unchecked is a textbook open redirect: a link to our own
 * login page that deposits the user on an attacker's clone the instant their
 * session cookie is set, which is exactly when they are least suspicious.
 *
 * Only same-origin absolute paths are allowed through. Everything else falls
 * back to the dashboard rather than erroring — a bad redirect target should not
 * cost the user their login.
 *
 * Rejected, specifically:
 *   "https://evil.test"  — absolute URL, different origin
 *   "//evil.test"        — protocol-relative; the browser reads this as a host
 *   "/\\evil.test"       — backslash; some browsers normalise it to "//"
 *   "dashboard"          — no leading slash, resolves relative to the current path
 */
export function safeRedirectTarget(
  raw: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN_PATH,
): string {
  if (!raw) return fallback;

  let value = raw;
  // A caller may hand us an already-decoded value or a raw one; decoding a
  // second time is what turns "%2f%2fevil.test" into "//evil.test", so try it and
  // validate whatever we end up with.
  try {
    value = decodeURIComponent(raw);
  } catch {
    return fallback;
  }

  if (!value.startsWith("/")) return fallback;
  // The second character is what decides host-vs-path for the browser.
  if (value[1] === "/" || value[1] === "\\") return fallback;
  // Tab, newline and NUL are stripped by browsers before the URL is parsed, so
  // "/<TAB>/evil.test" passes the check above and then navigates to "//evil.test".
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return fallback;
  }

  return value;
}
