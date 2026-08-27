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

  // Optimistic cookie-only check. Each protected page also calls requireRole()
  // server-side (src/auth/session.ts) for the real, database-backed check.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/console/:path*", "/admin/:path*", "/api/:path*"] };
