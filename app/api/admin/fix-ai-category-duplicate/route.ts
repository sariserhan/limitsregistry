import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { limits, auditLogs, user } from "../../../../src/db/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// One-off: "Artificial Intelligence" and "AI" are the same category, split by an inconsistent
// naming choice across different seed batches — not two real categories. Merges the former into
// the latter (the more heavily used spelling, 41 records vs 3).
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, "serhan.sari83@gmail.com")).limit(1);
  if (!owner) return NextResponse.json({ error: "Owner account not found." }, { status: 500 });

  const affected = await db.select({ id: limits.id, registryNumber: limits.registryNumber }).from(limits).where(eq(limits.category, "Artificial Intelligence"));
  if (affected.length === 0) return NextResponse.json({ updated: 0, message: "No 'Artificial Intelligence' rows found; already merged." });

  await db.update(limits).set({ category: "AI", updatedAt: new Date() }).where(eq(limits.category, "Artificial Intelligence"));
  await db.insert(auditLogs).values({
    action: "CATEGORY_MERGE", entityType: "LIMIT", entityId: affected[0].id, actorUserId: owner.id,
    before: { category: "Artificial Intelligence" }, after: { category: "AI" },
    reason: `Merged duplicate category "Artificial Intelligence" into "AI" across ${affected.length} records: ${affected.map((r) => r.registryNumber).join(", ")}.`,
  });

  return NextResponse.json({ updated: affected.length, registryNumbers: affected.map((r) => r.registryNumber) });
}
