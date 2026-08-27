CREATE TABLE IF NOT EXISTS "verification_artifacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "claim_id" uuid NOT NULL REFERENCES "claims"("id"),
  "verifier" text NOT NULL,
  "repository_url" text NOT NULL,
  "commit_hash" text NOT NULL,
  "verifier_version" text,
  "build_result" text DEFAULT 'NOT_RUN' NOT NULL,
  "verification_level" text DEFAULT 'ARTIFACT_LINKED' NOT NULL,
  "review_status" text DEFAULT 'DRAFT' NOT NULL,
  "reviewed_by_user_id" text,
  "review_rationale" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "verification_artifacts" ADD COLUMN IF NOT EXISTS "review_status" text DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_artifacts" ADD COLUMN IF NOT EXISTS "reviewed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "verification_artifacts" ADD COLUMN IF NOT EXISTS "review_rationale" text;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifier_executions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "artifact_id" uuid NOT NULL REFERENCES "verification_artifacts"("id"),
  "verifier" text NOT NULL,
  "command" text NOT NULL,
  "tool_version" text NOT NULL,
  "exit_code" integer NOT NULL,
  "status" text NOT NULL,
  "reproducible" boolean DEFAULT false NOT NULL,
  "output_summary" text NOT NULL,
  "output_digest" text NOT NULL,
  "executed_by_user_id" text NOT NULL,
  "started_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artifacts_claim_idx" ON "verification_artifacts" ("claim_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artifacts_review_idx" ON "verification_artifacts" ("review_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "executions_artifact_idx" ON "verifier_executions" ("artifact_id", "created_at");--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='artifacts_verifier_valid' AND conrelid='verification_artifacts'::regclass) THEN ALTER TABLE "verification_artifacts" ADD CONSTRAINT "artifacts_verifier_valid" CHECK ("verifier" in ('LEAN4','COQ','ISABELLE','SAT_SOLVER')) NOT VALID; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='artifacts_commit_hash_valid' AND conrelid='verification_artifacts'::regclass) THEN ALTER TABLE "verification_artifacts" ADD CONSTRAINT "artifacts_commit_hash_valid" CHECK ("commit_hash" ~ '^[0-9a-fA-F]{40}$') NOT VALID; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='artifacts_review_status_valid' AND conrelid='verification_artifacts'::regclass) THEN ALTER TABLE "verification_artifacts" ADD CONSTRAINT "artifacts_review_status_valid" CHECK ("review_status" in ('DRAFT','ACCEPTED','REJECTED')) NOT VALID; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='artifacts_level_valid' AND conrelid='verification_artifacts'::regclass) THEN ALTER TABLE "verification_artifacts" ADD CONSTRAINT "artifacts_level_valid" CHECK ("verification_level" in ('ARTIFACT_LINKED','REPRODUCED','MACHINE_CHECKED')) NOT VALID; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='executions_status_valid' AND conrelid='verifier_executions'::regclass) THEN ALTER TABLE "verifier_executions" ADD CONSTRAINT "executions_status_valid" CHECK ("status" in ('PASSED','FAILED','REJECTED')); END IF; END $$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_machine_checked_artifact() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF NEW.verification_level = 'MACHINE_CHECKED' AND NOT (
    NEW.review_status = 'ACCEPTED' AND NEW.build_result = 'PASSED' AND EXISTS (
      SELECT 1 FROM verifier_executions e WHERE e.artifact_id = NEW.id AND e.status = 'PASSED' AND e.reproducible = true
    )
  ) THEN RAISE EXCEPTION 'MACHINE_CHECKED requires an accepted artifact and passed reproducible execution'; END IF;
  RETURN NEW;
END $$;--> statement-breakpoint
DROP TRIGGER IF EXISTS verification_artifact_machine_checked_guard ON "verification_artifacts";--> statement-breakpoint
CREATE TRIGGER verification_artifact_machine_checked_guard BEFORE INSERT OR UPDATE OF verification_level, review_status, build_result ON "verification_artifacts" FOR EACH ROW EXECUTE FUNCTION enforce_machine_checked_artifact();
