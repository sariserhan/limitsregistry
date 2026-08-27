CREATE TABLE IF NOT EXISTS "follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "limit_id" uuid NOT NULL REFERENCES "limits"("id"),
  "subscriber_key" text NOT NULL,
  "email" text,
  "frequency" text DEFAULT 'WEEKLY' NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "unsubscribed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "frequency" text DEFAULT 'WEEKLY' NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "unsubscribed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "follows" SET "email" = CASE WHEN "subscriber_key" LIKE '%@%' THEN lower("subscriber_key") ELSE "subscriber_key" || '@legacy.invalid' END WHERE "email" IS NULL;--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchlist_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "limit_id" uuid NOT NULL REFERENCES "limits"("id"),
  "event_type" text NOT NULL,
  "source_entity_type" text,
  "source_entity_id" text,
  "payload" jsonb NOT NULL,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "watchlist_events" ADD COLUMN IF NOT EXISTS "source_entity_type" text;--> statement-breakpoint
ALTER TABLE "watchlist_events" ADD COLUMN IF NOT EXISTS "source_entity_id" text;--> statement-breakpoint
UPDATE "watchlist_events" SET "source_entity_type"='LEGACY', "source_entity_id"="id"::text WHERE "source_entity_type" IS NULL OR "source_entity_id" IS NULL;--> statement-breakpoint
ALTER TABLE "watchlist_events" ALTER COLUMN "source_entity_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "watchlist_events" ALTER COLUMN "source_entity_id" SET NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "follow_id" uuid NOT NULL REFERENCES "follows"("id"),
  "watchlist_event_id" uuid REFERENCES "watchlist_events"("id"),
  "event_type" text NOT NULL,
  "payload" jsonb NOT NULL,
  "status" text DEFAULT 'PENDING' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_error" text,
  "provider_message_id" text,
  "delivered_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "watchlist_event_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "last_error" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "provider_message_id" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "follows_limit_subscriber_unique" ON "follows" ("limit_id","subscriber_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_subscriber_idx" ON "follows" ("subscriber_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_delivery_idx" ON "follows" ("enabled","frequency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_follow_idx" ON "notifications" ("follow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_delivery_idx" ON "notifications" ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notifications_follow_event_unique" ON "notifications" ("follow_id","watchlist_event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watchlist_events_limit_idx" ON "watchlist_events" ("limit_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "watchlist_event_source_unique" ON "watchlist_events" ("source_entity_type","source_entity_id","event_type");--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='follows_frequency_valid' AND conrelid='follows'::regclass) THEN ALTER TABLE "follows" ADD CONSTRAINT "follows_frequency_valid" CHECK ("frequency" in ('INSTANT','WEEKLY')); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='notifications_status_valid' AND conrelid='notifications'::regclass) THEN ALTER TABLE "notifications" ADD CONSTRAINT "notifications_status_valid" CHECK ("status" in ('PENDING','SENDING','SENT','FAILED')); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='notifications_watchlist_event_fk' AND conrelid='notifications'::regclass) THEN ALTER TABLE "notifications" ADD CONSTRAINT "notifications_watchlist_event_fk" FOREIGN KEY ("watchlist_event_id") REFERENCES "watchlist_events"("id"); END IF; END $$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_published_watchlist_event() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE claim_ok boolean; BEGIN
  IF NEW.published_at IS NOT NULL AND NEW.source_entity_type='CLAIM' THEN SELECT EXISTS(SELECT 1 FROM claims c JOIN limit_spec_versions s ON s.id=c.specification_version_id JOIN limits l ON l.id=s.limit_id WHERE c.id::text=NEW.source_entity_id AND c.status='ACCEPTED' AND l.status IN ('OPEN','PROVEN') AND l.id=NEW.limit_id) INTO claim_ok; IF NOT claim_ok THEN RAISE EXCEPTION 'Published Claim events require an accepted Claim on a public Limit'; END IF; END IF; RETURN NEW;
END $$;--> statement-breakpoint
DROP TRIGGER IF EXISTS watchlist_event_publication_guard ON "watchlist_events";--> statement-breakpoint
CREATE TRIGGER watchlist_event_publication_guard BEFORE INSERT OR UPDATE OF published_at ON "watchlist_events" FOR EACH ROW EXECUTE FUNCTION enforce_published_watchlist_event();
