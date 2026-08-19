import { describe, it, expect } from "vitest";
import { safeRedirectTarget, DEFAULT_POST_LOGIN_PATH } from "@/lib/auth/redirect";

describe("safeRedirectTarget", () => {
  it("keeps a same-origin path and its query string", () => {
    // This is the whole point: the plan chosen before signing in has to survive.
    expect(safeRedirectTarget("/billing?plan=growth")).toBe("/billing?plan=growth");
    expect(safeRedirectTarget("/agents/abc-123")).toBe("/agents/abc-123");
  });

  it("falls back when nothing was requested", () => {
    expect(safeRedirectTarget(null)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(safeRedirectTarget(undefined)).toBe(DEFAULT_POST_LOGIN_PATH);
    expect(safeRedirectTarget("")).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it.each([
    ["absolute http URL", "https://evil.test/steal"],
    ["scheme-relative URL", "//evil.test"],
    ["backslash host", "/\\evil.test"],
    ["encoded scheme-relative", "%2f%2fevil.test"],
    ["javascript scheme", "javascript:alert(1)"],
    ["relative path with no leading slash", "dashboard"],
    ["tab-smuggled host", "/\t/evil.test"],
    ["newline-smuggled host", "/\n/evil.test"],
  ])("refuses to send a freshly-authenticated user to a %s", (_label, hostile) => {
    // An open redirect on the login page is a phishing primitive: the victim
    // lands on the attacker's page at the exact moment they expect to be signed in.
    expect(safeRedirectTarget(hostile)).toBe(DEFAULT_POST_LOGIN_PATH);
  });

  it("survives a malformed percent-encoding instead of throwing", () => {
    expect(safeRedirectTarget("/billing?x=%E0%A4%A")).toBe(DEFAULT_POST_LOGIN_PATH);
  });
});
