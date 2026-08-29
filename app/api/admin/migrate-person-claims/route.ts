import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import postgres from "postgres";

export const runtime = "nodejs";
export const maxDuration = 60;

// Applies drizzle/0022_easy_the_renegades.sql directly — same pattern as /api/admin/migrate,
// since production's migration history predates tracked migrations. Every statement is
// idempotent (IF NOT EXISTS / exception-guarded) so it's safe to invoke more than once.
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
    await client`DO $$ BEGIN CREATE TYPE "public"."person_claim_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`;
    await client`
      CREATE TABLE IF NOT EXISTS "person_claim_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "person_id" uuid NOT NULL,
        "requested_by_user_id" text NOT NULL,
        "verification_note" text NOT NULL,
        "status" "person_claim_status" DEFAULT 'PENDING' NOT NULL,
        "reviewed_by_user_id" text,
        "review_notes" text,
        "reviewed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `;
    await client`ALTER TABLE "people" ADD COLUMN IF NOT EXISTS "claimed_by_user_id" text`;
    await client`DO $$ BEGIN ALTER TABLE "person_claim_requests" ADD CONSTRAINT "person_claim_requests_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`;
    await client`DO $$ BEGIN ALTER TABLE "person_claim_requests" ADD CONSTRAINT "person_claim_requests_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`;
    await client`DO $$ BEGIN ALTER TABLE "person_claim_requests" ADD CONSTRAINT "person_claim_requests_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`;
    await client`CREATE INDEX IF NOT EXISTS "person_claim_requests_person_idx" ON "person_claim_requests" USING btree ("person_id","status")`;
    await client`CREATE UNIQUE INDEX IF NOT EXISTS "person_claim_requests_pending_unique" ON "person_claim_requests" USING btree ("person_id","requested_by_user_id") WHERE "person_claim_requests"."status" = 'PENDING'`;
    await client`DO $$ BEGIN ALTER TABLE "people" ADD CONSTRAINT "people_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    await client.end();
  }
}
