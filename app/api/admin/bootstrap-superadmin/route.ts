import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { user, auditLogs } from "../../../../src/db/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// One-off: the app's own rule ("only a superadmin can touch an admin-tier role") means if zero
// superadmins exist, nobody can ever create the first one through the UI — a genuine bootstrap
// deadlock, not a bug to work around inside the app itself.
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = "serhan.sari@yahoo.com";
  const [target] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!target) return NextResponse.json({ error: `No user found for ${email}` }, { status: 404 });
  if (target.role === "SUPERADMIN") return NextResponse.json({ status: "already-superadmin", userId: target.id });
  await db.update(user).set({ role: "SUPERADMIN", updatedAt: new Date() }).where(eq(user.id, target.id));
  await db.insert(auditLogs).values({ actorUserId: target.id, action: "SET_ROLE", entityType: "user", entityId: target.id, before: { role: target.role }, after: { role: "SUPERADMIN" }, reason: "One-off bootstrap — first superadmin, requested directly by the site owner." });
  return NextResponse.json({ status: "ok", userId: target.id, email });
}
