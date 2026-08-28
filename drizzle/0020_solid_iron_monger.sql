CREATE TYPE "public"."editorial_application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TYPE "public"."editorial_application_type" AS ENUM('REVIEWER', 'EDITOR');--> statement-breakpoint
CREATE TABLE "editorial_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_user_id" text NOT NULL,
	"application_type" "editorial_application_type" NOT NULL,
	"affiliation" text NOT NULL,
	"orcid" text,
	"website" text,
	"fields_of_expertise" jsonb NOT NULL,
	"credentials" text NOT NULL,
	"motivation" text NOT NULL,
	"conflict_disclosure" boolean NOT NULL,
	"status" "editorial_application_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by_user_id" text,
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "editorial_applications" ADD CONSTRAINT "editorial_applications_applicant_user_id_user_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_applications" ADD CONSTRAINT "editorial_applications_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "editorial_applications_applicant_idx" ON "editorial_applications" USING btree ("applicant_user_id","created_at");--> statement-breakpoint
CREATE INDEX "editorial_applications_queue_idx" ON "editorial_applications" USING btree ("status","application_type");--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_applications_pending_unique" ON "editorial_applications" USING btree ("applicant_user_id","application_type") WHERE "editorial_applications"."status" = 'PENDING';