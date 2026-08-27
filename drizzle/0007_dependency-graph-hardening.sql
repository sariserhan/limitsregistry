CREATE TABLE IF NOT EXISTS "limit_dependencies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_limit_id" uuid NOT NULL REFERENCES "limits"("id"),
  "target_limit_id" uuid NOT NULL REFERENCES "limits"("id"),
  "relation" text NOT NULL,
  "evidence_claim_id" uuid REFERENCES "claims"("id"),
  "review_status" text DEFAULT 'DRAFT' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dependencies_source_idx" ON "limit_dependencies" ("source_limit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dependencies_target_idx" ON "limit_dependencies" ("target_limit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dependencies_public_idx" ON "limit_dependencies" ("review_status", "source_limit_id", "target_limit_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "dependencies_unique_edge_idx" ON "limit_dependencies" ("source_limit_id", "target_limit_id", "relation");--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dependencies_no_self_edge') THEN ALTER TABLE "limit_dependencies" ADD CONSTRAINT "dependencies_no_self_edge" CHECK ("source_limit_id" <> "target_limit_id"); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dependencies_relation_valid') THEN ALTER TABLE "limit_dependencies" ADD CONSTRAINT "dependencies_relation_valid" CHECK ("relation" in ('REDUCES_TO', 'DEPENDS_ON', 'IMPROVES', 'GENERALIZES')); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dependencies_review_status_valid') THEN ALTER TABLE "limit_dependencies" ADD CONSTRAINT "dependencies_review_status_valid" CHECK ("review_status" in ('DRAFT', 'ACCEPTED', 'REJECTED')); END IF; END $$;
