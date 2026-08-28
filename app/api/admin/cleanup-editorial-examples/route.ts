import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import postgres from "postgres";

export const runtime = "nodejs";
export const maxDuration = 60;

// Removes the synthetic "Editorial example: ..." demo submissions (and their fake "Limits
// Registry editorial desk" submitter account) seeded onto production — they were the only
// entries on the public /activity ledger, presenting made-up example activity as if it were
// real public engagement. GET inspects what matches before POST deletes it.
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 500 });
  const client = postgres(connectionString, { prepare: false, max: 1 });
  try {
    const submissions = await client`select s.id, s.title, s.status, s.submitter_user_id, u.name, u.email from submissions s join "user" u on u.id = s.submitter_user_id where s.title ilike '%editorial%' or u.name ilike '%editorial%'`;
    return NextResponse.json({ submissions });
  } finally {
    await client.end();
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 500 });
  const client = postgres(connectionString, { prepare: false, max: 1 });
  try {
    // Deliberately only removes the submissions, not the fake submitter account — the account
    // may be referenced elsewhere (sessions, audit logs) and isn't itself visible on any public
    // page, so it's not worth the FK-constraint risk to also delete it here.
    const deleted = await client`delete from submissions where id in (select s.id from submissions s join "user" u on u.id = s.submitter_user_id where s.title ilike '%editorial%' or u.name ilike '%editorial%') returning id`;
    return NextResponse.json({ status: "ok", submissionsDeleted: deleted.length });
  } finally {
    await client.end();
  }
}
