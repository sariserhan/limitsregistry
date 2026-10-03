import { NextResponse, type NextRequest } from "next/server";

/**
 * The production deployment answers on limitsregistry.vercel.app as well as
 * on www.limitsregistry.com, and crawlers treat the two as separate websites.
 * In early October 96% of AI crawler traffic to this site arrived on the
 * .vercel.app host — a full duplicate of the registry, indexed and re-read as
 * if it were another site, competing with the real domain in search and
 * running up VisitorPing's telemetry for no one's benefit.
 *
 * Production only: preview deployments live on .vercel.app by design and must
 * keep working there. /api/ is left alone because Vercel cron jobs and
 * webhooks can arrive on the deployment's own URL, and redirecting those would
 * break them rather than tidy anything up.
 */
const CANONICAL_ORIGIN = "https://www.limitsregistry.com";

export function canonicalRedirect(
  request: Pick<NextRequest, "nextUrl">,
  env: Partial<Record<string, string>> = process.env,
): NextResponse | null {
  if (env.VERCEL_ENV !== "production") return null;
  const { hostname, pathname, search } = request.nextUrl;
  if (!hostname.endsWith(".vercel.app")) return null;
  if (pathname.startsWith("/api/") || pathname.startsWith("/.well-known/")) return null;
  // 308 keeps the method, and tells crawlers the move is permanent.
  return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308);
}
