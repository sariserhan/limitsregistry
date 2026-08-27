CREATE TABLE IF NOT EXISTS "source_ingestion_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paper_id" uuid NOT NULL,
	"limit_id" uuid,
	"requested_by_user_id" text NOT NULL,
	"source_type" text NOT NULL,
	"source_url" text NOT NULL,
	"final_source_url" text,
	"status" text DEFAULT 'QUEUED' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"page_count" integer,
	"byte_size" integer,
	"extracted_character_count" integer,
	"error_code" text,
	"error_message" text,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_jobs_type_valid" CHECK ("source_ingestion_jobs"."source_type" in ('ARXIV', 'DOI_PUBLISHER')),
	CONSTRAINT "source_jobs_status_valid" CHECK ("source_ingestion_jobs"."status" in ('QUEUED', 'PROCESSING', 'RETRY_WAIT', 'SUCCEEDED', 'FAILED')),
	CONSTRAINT "source_jobs_attempts_valid" CHECK ("source_ingestion_jobs"."attempts" >= 0 and "source_ingestion_jobs"."max_attempts" between 1 and 10 and "source_ingestion_jobs"."attempts" <= "source_ingestion_jobs"."max_attempts"),
	CONSTRAINT "source_jobs_counts_valid" CHECK (("source_ingestion_jobs"."page_count" is null or "source_ingestion_jobs"."page_count" > 0) and ("source_ingestion_jobs"."byte_size" is null or "source_ingestion_jobs"."byte_size" > 0) and ("source_ingestion_jobs"."extracted_character_count" is null or "source_ingestion_jobs"."extracted_character_count" > 0)),
	CONSTRAINT "source_jobs_source_https_valid" CHECK ("source_ingestion_jobs"."source_url" ~ '^https://[^[:space:]]+$')
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "source_ingestion_jobs" ADD CONSTRAINT "source_ingestion_jobs_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "source_ingestion_jobs" ADD CONSTRAINT "source_ingestion_jobs_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_jobs_due_idx" ON "source_ingestion_jobs" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "source_jobs_active_unique" ON "source_ingestion_jobs" USING btree ("paper_id") WHERE "source_ingestion_jobs"."status" in ('QUEUED', 'PROCESSING', 'RETRY_WAIT');--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "source_jobs_paper_idx" ON "source_ingestion_jobs" USING btree ("paper_id","created_at");