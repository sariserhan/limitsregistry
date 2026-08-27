import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// This fork of Next.js renamed the middleware.js convention to proxy.js —
// request-id stamping (formerly middleware.ts) lives here too since that
// file is otherwise silently unused.
export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("x-request-id", request.headers.get("x-request-id") ?? crypto.randomUUID());
    return response;
  }

  // Optimistic cookie-only check, scoped to the same two path prefixes as before broadening the
  // matcher below — everything else (public pages) must NOT be gated behind a login redirect.
  // Each protected page also calls requireRole() server-side (src/auth/session.ts) for the real,
  // database-backed check.
  if (request.nextUrl.pathname.startsWith("/console") || request.nextUrl.pathname.startsWith("/admin")) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Server Components can't read the current pathname directly — forward it as a request header
  // so the root layout can exempt /admin and /login from maintenance mode without needing a DB
  // read here. Proxy runs on every request (including prefetches), so per this fork's own docs
  // (node_modules/next/dist/docs/.../authentication.md) it must stay to optimistic, DB-free checks
  // — the maintenance flag itself is read from a cached settings function in app/layout.tsx instead.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
