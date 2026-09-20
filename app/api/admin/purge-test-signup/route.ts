import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { like } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { user } from "../../../../src/db/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// One-off: removes the throwaway account(s) created to verify the signup-notification-email hook.
// Safe as a hard delete — session/account rows cascade off user.id and these test rows never
// accumulated any real content (submissions, claims, etc).
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await db.delete(user).where(like(user.email, "%@limitsregistry-test.internal")).returning({ id: user.id, email: user.email });
  return NextResponse.json({ status: "ok", deleted });
}
