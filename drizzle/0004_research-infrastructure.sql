CREATE TABLE "breakthrough_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit_id" uuid NOT NULL,
	"claim_id" uuid,
	"event_type" text NOT NULL,
	"accepted_only" boolean DEFAULT true NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "limit_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_limit_id" uuid NOT NULL,
	"target_limit_id" uuid NOT NULL,
	"relation" text NOT NULL,
	"evidence_claim_id" uuid,
	"review_status" text DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_bounties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit_id" uuid,
	"title" text NOT NULL,
	"sponsor" text NOT NULL,
	"description" text NOT NULL,
	"source_url" text NOT NULL,
	"status" text DEFAULT 'UNVERIFIED' NOT NULL,
	"amount" text,
	"currency" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semantic_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"content" text NOT NULL,
	"embedding" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"verifier" text NOT NULL,
	"repository_url" text NOT NULL,
	"commit_hash" text NOT NULL,
	"verifier_version" text,
	"build_result" text DEFAULT 'NOT_RUN' NOT NULL,
	"verification_level" text DEFAULT 'ARTIFACT_LINKED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "breakthrough_events" ADD CONSTRAINT "breakthrough_events_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breakthrough_events" ADD CONSTRAINT "breakthrough_events_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "limit_dependencies" ADD CONSTRAINT "limit_dependencies_source_limit_id_limits_id_fk" FOREIGN KEY ("source_limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "limit_dependencies" ADD CONSTRAINT "limit_dependencies_target_limit_id_limits_id_fk" FOREIGN KEY ("target_limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "limit_dependencies" ADD CONSTRAINT "limit_dependencies_evidence_claim_id_claims_id_fk" FOREIGN KEY ("evidence_claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_bounties" ADD CONSTRAINT "research_bounties_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_artifacts" ADD CONSTRAINT "verification_artifacts_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_events" ADD CONSTRAINT "watchlist_events_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "breakthrough_limit_idx" ON "breakthrough_events" USING btree ("limit_id");--> statement-breakpoint
CREATE INDEX "dependencies_source_idx" ON "limit_dependencies" USING btree ("source_limit_id");--> statement-breakpoint
CREATE INDEX "dependencies_target_idx" ON "limit_dependencies" USING btree ("target_limit_id");--> statement-breakpoint
CREATE INDEX "bounties_limit_idx" ON "research_bounties" USING btree ("limit_id");--> statement-breakpoint
CREATE INDEX "bounties_status_idx" ON "research_bounties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "semantic_entity_idx" ON "semantic_documents" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "artifacts_claim_idx" ON "verification_artifacts" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "watchlist_events_limit_idx" ON "watchlist_events" USING btree ("limit_id");