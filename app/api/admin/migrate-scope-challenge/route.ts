import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import postgres from "postgres";

export const runtime = "nodejs";
export const maxDuration = 60;

// Applies drizzle/0021_add-scope-challenge-type.sql directly, same pattern as
// /api/admin/migrate — production's migration history predates tracked migrations, so this
// applies just the one pending change rather than replaying the full migrator. ADD VALUE IF NOT
// EXISTS (PG 12+) makes it safe to invoke more than once.
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return NextResponse.json({ error: "DATABASE_URL is required." }, { status: 500 });
  const client = postgres(connectionString, { prepare: false, max: 1 });
  try {
    await client`ALTER TYPE "public"."submission_type" ADD VALUE IF NOT EXISTS 'SCOPE_CHALLENGE'`;
    const values = await client`select enumlabel from pg_enum where enumtypid = 'public.submission_type'::regtype order by enumsortorder`;
    return NextResponse.json({ status: "ok", submissionTypeValues: values.map((v) => v.enumlabel) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    await client.end();
  }
}
