import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import postgres from "postgres";

export const runtime = "nodejs";
export const maxDuration = 60;

// Applies drizzle/0023_acquisition_events.sql directly — same pattern as /api/admin/migrate,
// since production's migration history predates tracked migrations. Every statement is
// IF NOT EXISTS, so it's safe to invoke more than once.
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
    await client`
      CREATE TABLE IF NOT EXISTS "acquisition_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "event_name" text NOT NULL,
        "path" text NOT NULL,
        "referrer" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `;
    await client`CREATE INDEX IF NOT EXISTS "acquisition_events_created_idx" ON "acquisition_events" USING btree ("created_at")`;
    await client`CREATE INDEX IF NOT EXISTS "acquisition_events_name_idx" ON "acquisition_events" USING btree ("event_name", "created_at")`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    await client.end();
  }
}
