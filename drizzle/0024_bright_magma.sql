-- acquisition_events was already created by migration 0023 (which had no schema snapshot).
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"organization_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"tier" text DEFAULT 'PILOT' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"note" text,
	"issued_by_user_id" text,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_hash_valid" CHECK ("api_keys"."key_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "api_keys_prefix_valid" CHECK ("api_keys"."key_prefix" ~ '^lr_live_[A-Za-z0-9_-]{8}$'),
	CONSTRAINT "api_keys_org_valid" CHECK (length(trim("api_keys"."organization_name")) between 1 and 200),
	CONSTRAINT "api_keys_email_valid" CHECK ("api_keys"."contact_email" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and length("api_keys"."contact_email") <= 254),
	CONSTRAINT "api_keys_tier_valid" CHECK ("api_keys"."tier" = 'PILOT'),
	CONSTRAINT "api_keys_status_valid" CHECK ("api_keys"."status" in ('ACTIVE', 'REVOKED')),
	CONSTRAINT "api_keys_revoked_paired" CHECK (("api_keys"."status" = 'REVOKED') = ("api_keys"."revoked_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "api_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema_version" integer NOT NULL,
	"generated_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by_user_id" text,
	"record_count" integer NOT NULL,
	"json_path" text NOT NULL,
	"ndjson_path" text NOT NULL,
	"json_hash" text NOT NULL,
	"ndjson_hash" text NOT NULL,
	"current" boolean DEFAULT false NOT NULL,
	CONSTRAINT "api_snapshots_counts_valid" CHECK ("api_snapshots"."schema_version" > 0 and "api_snapshots"."record_count" >= 0),
	CONSTRAINT "api_snapshots_hashes_valid" CHECK ("api_snapshots"."json_hash" ~ '^[0-9a-f]{64}$' and "api_snapshots"."ndjson_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "api_snapshots_paths_valid" CHECK ("api_snapshots"."json_path" like 'registry-snapshots/%' and "api_snapshots"."ndjson_path" like 'registry-snapshots/%')
);
--> statement-breakpoint
CREATE TABLE "api_usage_daily" (
	"key_id" uuid NOT NULL,
	"day" date NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"last_downloaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_usage_daily_key_id_day_pk" PRIMARY KEY("key_id","day"),
	CONSTRAINT "api_usage_downloads_valid" CHECK ("api_usage_daily"."downloads" >= 0)
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_issued_by_user_id_user_id_fk" FOREIGN KEY ("issued_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_snapshots" ADD CONSTRAINT "api_snapshots_published_by_user_id_user_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage_daily" ADD CONSTRAINT "api_usage_daily_key_id_api_keys_id_fk" FOREIGN KEY ("key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_hash_uidx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "api_snapshots_current_uidx" ON "api_snapshots" USING btree ("current") WHERE "api_snapshots"."current" = true;