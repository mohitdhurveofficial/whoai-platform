import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dashboard route groups that require an authenticated session. These map to
// the URLs served by app/(dashboard)/*. Authorization is still enforced
// server-side in each route via getServerAuthContext(); this is an optimistic
// cookie check to keep unauthenticated users out of the dashboard shell.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/agents",
  "/agent-details",
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
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not signed in: block access to protected dashboard routes.
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!authCookie && isProtected) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
