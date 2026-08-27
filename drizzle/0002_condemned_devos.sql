CREATE TYPE "public"."submission_status" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'NEEDS_REVISION');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('BETTER_ACHIEVABLE_RESULT', 'STRONGER_BOUND', 'PROOF', 'REPRODUCTION', 'CORRECTION');--> statement-breakpoint
CREATE TABLE "reviewer_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"fields_of_expertise" jsonb NOT NULL,
	"credentials" text,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED'::"public"."submission_status";--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "status" SET DATA TYPE "public"."submission_status" USING "status"::"public"."submission_status";--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "submitter_user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "limit_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "submission_type" "submission_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "proposed_relation" "claim_relation";--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "proposed_value_exact" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "evidence_url" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "reviewed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "reviewer_notes" text;--> statement-breakpoint
ALTER TABLE "reviewer_profiles" ADD CONSTRAINT "reviewer_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitter_user_id_user_id_fk" FOREIGN KEY ("submitter_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submissions_limit_idx" ON "submissions" USING btree ("limit_id");--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "submitter_email";