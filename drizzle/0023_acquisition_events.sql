CREATE TABLE IF NOT EXISTS "acquisition_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_name" text NOT NULL,
  "path" text NOT NULL,
  "referrer" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "acquisition_events_created_idx" ON "acquisition_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "acquisition_events_name_idx" ON "acquisition_events" USING btree ("event_name", "created_at");
