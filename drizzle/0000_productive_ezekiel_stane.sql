CREATE TYPE "public"."claim_relation" AS ENUM('<', '<=', '=', '>=', '>');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('DRAFT', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'DISPUTED', 'INVALIDATED');--> statement-breakpoint
CREATE TYPE "public"."claim_type" AS ENUM('UPPER_BOUND', 'LOWER_BOUND', 'EXACT_VALUE', 'CONSTRUCTION', 'COUNTEREXAMPLE', 'ASYMPTOTIC_BOUND', 'COMPUTATIONAL_BOUND');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('MINIMIZE', 'MAXIMIZE');--> statement-breakpoint
CREATE TYPE "public"."epistemic_status" AS ENUM('LITERATURE_ASSERTED', 'SOURCE_CONFIRMED', 'REPRODUCED', 'PROVEN', 'FORMALLY_PROVEN', 'EMPIRICALLY_SUPPORTED', 'DISPUTED', 'INVALIDATED');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('PAPER', 'FORMAL_PROOF', 'SOURCE_CODE', 'DATASET', 'EXHAUSTIVE_COMPUTATION', 'EXPERIMENT', 'REPRODUCTION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."limit_status" AS ENUM('DRAFT', 'OPEN', 'PROVEN', 'DISPUTED', 'RETIRED');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_evidence" (
	"claim_id" uuid NOT NULL,
	"evidence_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_papers" (
	"claim_id" uuid NOT NULL,
	"paper_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_number" text NOT NULL,
	"specification_version_id" uuid NOT NULL,
	"claim_type" "claim_type" NOT NULL,
	"relation" "claim_relation" NOT NULL,
	"value_exact" text NOT NULL,
	"value_numeric" bigint,
	"value_text" text,
	"unit" text,
	"scope_parameters" jsonb NOT NULL,
	"epistemic_status" "epistemic_status" NOT NULL,
	"status" "claim_status" DEFAULT 'DRAFT' NOT NULL,
	"method_summary" text,
	"supersedes_claim_id" uuid,
	"invalidates_claim_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "evidence_type" NOT NULL,
	"label" text NOT NULL,
	"url" text,
	"location" text,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registry_number" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"direction" "direction" NOT NULL,
	"metric_name" text NOT NULL,
	"unit" text,
	"status" "limit_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "limits_registry_number_unique" UNIQUE("registry_number"),
	CONSTRAINT "limits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "papers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"abstract" text,
	"publication_date" timestamp with time zone,
	"venue" text,
	"doi" text,
	"arxiv_id" text,
	"publisher_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"orcid" text,
	"website" text,
	"profile_status" text DEFAULT 'UNCLAIMED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"reviewer_user_id" uuid NOT NULL,
	"decision" text NOT NULL,
	"rationale" text NOT NULL,
	"conflict_disclosed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "limit_spec_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"formal_statement" text NOT NULL,
	"constraints" jsonb NOT NULL,
	"assumptions" jsonb NOT NULL,
	"asymptotic" boolean DEFAULT false NOT NULL,
	"probabilistic" boolean DEFAULT false NOT NULL,
	"supersedes_version_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit_id" uuid NOT NULL,
	"claim_id" uuid,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_papers" ADD CONSTRAINT "claim_papers_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_papers" ADD CONSTRAINT "claim_papers_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_specification_version_id_limit_spec_versions_id_fk" FOREIGN KEY ("specification_version_id") REFERENCES "public"."limit_spec_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "limit_spec_versions" ADD CONSTRAINT "limit_spec_versions_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "claim_evidence_unique" ON "claim_evidence" USING btree ("claim_id","evidence_id");--> statement-breakpoint
CREATE UNIQUE INDEX "claim_papers_unique" ON "claim_papers" USING btree ("claim_id","paper_id");--> statement-breakpoint
CREATE INDEX "claims_spec_idx" ON "claims" USING btree ("specification_version_id");--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "limits_category_idx" ON "limits" USING btree ("category");--> statement-breakpoint
CREATE INDEX "limits_status_idx" ON "limits" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "papers_doi_unique" ON "papers" USING btree ("doi");--> statement-breakpoint
CREATE INDEX "people_name_idx" ON "people" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "reviews_claim_idx" ON "reviews" USING btree ("claim_id");--> statement-breakpoint
CREATE UNIQUE INDEX "limit_spec_version_unique" ON "limit_spec_versions" USING btree ("limit_id","version_number");--> statement-breakpoint
CREATE INDEX "timeline_limit_date_idx" ON "timeline_events" USING btree ("limit_id","occurred_at");