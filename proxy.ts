import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Mock authentication check - in production this would verify a JWT or Session Cookie
  const authCookie = request.cookies.get('whoai_auth');
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/signup') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/roi-calculator') || request.nextUrl.pathname.startsWith('/pricing');

  if (!authCookie && !isAuthPage && !isPublicPage) {
    // Redirect unauthenticated users trying to access the app to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (authCookie && isAuthPage) {
    // Redirect authenticated users away from auth pages to the app
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
