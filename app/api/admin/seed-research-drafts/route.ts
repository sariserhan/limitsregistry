import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import * as schema from "../../../../src/db/schema";
import { researchedDraftPackets, aiScalingResearchPackets } from "../../../../src/domain/research-packets";

export const runtime = "nodejs";
export const maxDuration = 60;

// Mirrors scripts/seed-research-drafts.ts's update branch, run at request time so it reaches
// production's DATABASE_URL (a Vercel Sensitive var, unreachable from the local script). Only
// updates existing rows' summary/formalStatement — does not insert, since these records are
// already published in prod and inserting would need the fuller claim/evidence pipeline.
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let updated = 0;
  const missing: string[] = [];
  for (const packet of [...researchedDraftPackets, ...aiScalingResearchPackets]) {
    const existing = await db.select({ id: schema.limits.id }).from(schema.limits).where(eq(schema.limits.registryNumber, packet.limit.id)).limit(1);
    if (!existing[0]) { missing.push(packet.limit.id); continue; }
    await db.update(schema.limits).set({ summary: packet.limit.summary, updatedAt: new Date() }).where(eq(schema.limits.id, existing[0].id));
    await db.update(schema.specificationVersions).set({ formalStatement: packet.specification.formalStatement, updatedAt: new Date() }).where(eq(schema.specificationVersions.limitId, existing[0].id));
    updated++;
  }
  return NextResponse.json({ status: "ok", updated, missing });
}
