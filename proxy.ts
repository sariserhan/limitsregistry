import type { NextFetchEvent } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { createAiTrafficMiddleware } from "@visitorping/vercel";
import { allowRequest } from "./src/ops/rate-limit";
import { clientIp } from "./src/ops/client-ip";

/**
 * AI crawler watching, reported to VisitorPing.
 *
 * Most AI crawlers never run JavaScript, so the tracking script in the root
 * layout cannot see them at all. This runs on the request itself, which is the
 * only place they are visible — and the only place a policy could refuse one.
 *
 * Built once at module scope and only when both credentials are present, so a
 * local run or a preview deployment watches nothing rather than reporting into
 * production.
 */
const watchAiTraffic =
  process.env.VISITORPING_INSTALLATION_ID && process.env.VISITORPING_SIGNING_KEY
    ? createAiTrafficMiddleware({
        installationId: process.env.VISITORPING_INSTALLATION_ID,
        signingKey: process.env.VISITORPING_SIGNING_KEY,
        // Only set when pointing at something other than production, which is
        // what makes this testable locally without reporting into the real
        // account.
        ingestUrl: process.env.VISITORPING_INGEST_URL,
      })
    : null;

// This fork of Next.js renamed the middleware.js convention to proxy.js —
// request-id stamping (formerly middleware.ts) lives here too since that
// file is otherwise silently unused.
export default async function proxy(request: NextRequest, event?: NextFetchEvent) {
  // First, and before the /api/ branch returns early, so a crawler hitting an
  // API path is still counted and /robots.txt and /license.xml are answered
  // before anything else considers them.
  //
  // Wrapped because anything thrown in here fails every request to the site.
  // Watching AI crawlers is never worth that: a failure means we see no
  // crawler, not that nobody sees the site.
  if (watchAiTraffic) {
    try {
      const refused = await watchAiTraffic(request, event);
      if (refused) return refused;
    } catch (error) {
      console.error("[visitorping] AI Traffic middleware failed", error);
    }
  }

  // Credential-stuffing/bot swarms specifically hit two paths: the actual sign-in attempt
  // (POSTed to better-auth's catch-all at /api/auth/sign-in/*, not the /login page itself, which
  // only renders the form) and /submit (an auth-gated page whose form also POSTs back to the same
  // path via a Server Action). Scoped to exactly these two so every other route — including every
  // other /api/auth/* path like sign-up or session checks — stays untouched. IP-keyed via Upstash
  // (see src/ops/rate-limit.ts) rather than a DB read, matching this proxy's "optimistic, DB-free"
  // rule below; wrapped in try/catch so a slow/down rate-limit service fails open, same as the
  // AI-traffic watcher above, rather than blocking real logins and submissions.
  if (request.nextUrl.pathname.startsWith("/api/auth/sign-in")) {
    try {
      const allowed = await allowRequest(`proxy-login:${clientIp(request)}`, 10, 5 * 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many sign-in attempts. Try again in a few minutes." }, { status: 429 });
    } catch (error) {
      console.error("[proxy] Login rate limit check failed", error);
    }
  }
  if (request.nextUrl.pathname === "/submit") {
    try {
      const allowed = await allowRequest(`proxy-submit:${clientIp(request)}`, 30, 5 * 60_000);
      if (!allowed) return new NextResponse("Too many requests. Try again in a few minutes.", { status: 429 });
    } catch (error) {
      console.error("[proxy] Submit rate limit check failed", error);
    }
  }

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
