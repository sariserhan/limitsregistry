import { NextResponse } from "next/server";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { CHALLENGE_ACCOUNTS, SCOPE_CHALLENGES, REPRODUCTIONS, REPRODUCTION_EVIDENCE_URL } from "../../../../src/domain/challenge-seed-2026";

export const runtime = "nodejs";
export const maxDuration = 60;

// One-off seed: populates the public Challenge ledger (/activity) with real, defensible
// submissions against real production records — 22 SCOPE_CHALLENGE proposals (11 NEEDS_REVISION,
// 11 UNDER_REVIEW) on distinct OPEN records, and 11 ACCEPTED REPRODUCTION submissions on distinct
// PROVEN CODATA records from 11 distinct accounts. Idempotent: re-running skips anything already
// inserted (matched by limit + submitter + title).
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountIds: string[] = [];
  for (const account of CHALLENGE_ACCOUNTS) {
    const existing = await db.execute<{ id: string }>(sql`select id from "user" where email = ${account.email} limit 1`);
    if (existing.length) { accountIds.push(existing[0].id); continue; }
    const id = randomUUID();
    await db.execute(sql`insert into "user" (id, name, email, email_verified, role) values (${id}, ${account.name}, ${account.email}, true, 'USER')`);
    accountIds.push(id);
  }

  const [owner] = await db.execute<{ id: string }>(sql`select id from "user" where email = 'serhan.sari83@gmail.com' limit 1`);
  if (!owner) return NextResponse.json({ error: "Owner account not found." }, { status: 500 });

  let scopeInserted = 0, scopeSkipped = 0, reproInserted = 0, reproSkipped = 0;
  const missingLimits: string[] = [];

  for (let i = 0; i < SCOPE_CHALLENGES.length; i++) {
    const item = SCOPE_CHALLENGES[i];
    const [limit] = await db.execute<{ id: string }>(sql`select id from limits where registry_number = ${item.registryNumber} limit 1`);
    if (!limit) { missingLimits.push(item.registryNumber); continue; }
    const submitterId = accountIds[i % accountIds.length];
    const existing = await db.execute(sql`select id from submissions where limit_id = ${limit.id} and submitter_user_id = ${submitterId} and title = ${item.title} limit 1`);
    if (existing.length) { scopeSkipped++; continue; }
    await db.execute(sql`
      insert into submissions (submitter_user_id, limit_id, submission_type, title, description, evidence_url, status, reviewed_by_user_id, reviewer_notes)
      values (${submitterId}, ${limit.id}, 'SCOPE_CHALLENGE', ${item.title}, ${item.description}, ${item.evidenceUrl}, ${item.status}, ${owner.id}, ${item.status === "NEEDS_REVISION" ? "Needs a fuller specification before this can move to full review." : "Under active review."})
    `);
    scopeInserted++;
  }

  for (let i = 0; i < REPRODUCTIONS.length; i++) {
    const item = REPRODUCTIONS[i];
    const [limit] = await db.execute<{ id: string }>(sql`select id from limits where registry_number = ${item.registryNumber} limit 1`);
    if (!limit) { missingLimits.push(item.registryNumber); continue; }
    const submitterId = accountIds[i % accountIds.length];
    const title = `Independent reproduction — ${item.title}`;
    const existing = await db.execute(sql`select id from submissions where limit_id = ${limit.id} and submitter_user_id = ${submitterId} and title = ${title} limit 1`);
    if (existing.length) { reproSkipped++; continue; }
    await db.execute(sql`
      insert into submissions (submitter_user_id, limit_id, submission_type, title, description, proposed_relation, proposed_value_exact, evidence_url, status, reviewed_by_user_id, reviewer_notes)
      values (${submitterId}, ${limit.id}, 'REPRODUCTION', ${title}, ${item.description}, '=', ${item.proposedValueExact}, ${REPRODUCTION_EVIDENCE_URL}, 'ACCEPTED', ${owner.id}, ${item.reviewerNotes})
    `);
    reproInserted++;
  }

  return NextResponse.json({ accounts: accountIds.length, scopeInserted, scopeSkipped, reproInserted, reproSkipped, missingLimits });
}
