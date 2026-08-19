import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPurchasableTier } from "@/lib/subscription";

// Dashboard route groups that require an authenticated session. These map to
// the URLs served by app/(dashboard)/*. Authorization is still enforced
// server-side in each route via getServerAuthContext(); this is an optimistic
// cookie check to keep unauthenticated users out of the dashboard shell.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/agents",
  "/usage",
  "/alerts",
  "/analytics",
  "/billing",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("whoai_auth");

  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  // Already signed in: keep users away from the auth pages.
  if (authCookie && isAuthPage) {
    // The pricing page points every plan CTA at /auth/signup?plan=<tier>, which
    // is right for a new visitor and wrong for an existing customer — they were
    // being dumped on the dashboard with their chosen plan discarded, so the
    // upgrade link did nothing for exactly the people most likely to click it.
    const plan = request.nextUrl.searchParams.get("plan");
    const target = isPurchasableTier(plan)
      ? `/billing?plan=${encodeURIComponent(plan!)}`
      : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Not signed in: block access to protected dashboard routes.
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!authCookie && isProtected) {
    const loginUrl = new URL("/auth/login", request.url);
    // Carry the query string, not just the path. "/billing?plan=growth" is the
    // whole point of the redirect — dropping the search meant a customer who
    // picked a plan while signed out arrived at billing with nothing selected.
    loginUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
