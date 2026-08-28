import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import postgres from "postgres";

export const runtime = "nodejs";
export const maxDuration = 60;

// DATABASE_URL is a Vercel Sensitive env var — it cannot be pulled by any CLI/API, only read at
// runtime inside a deployed function. Production's drizzle migration history is out of sync with
// its actual schema (it predates tracked migrations), so replaying the full migrator conflicts on
// objects that already exist. This applies just the one pending, idempotent change directly instead.
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
    await client`ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "limit_id" uuid`;
    await client`
      DO $$ BEGIN
        ALTER TABLE "evidence" ADD CONSTRAINT "evidence_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    await client.end();
  }
}
