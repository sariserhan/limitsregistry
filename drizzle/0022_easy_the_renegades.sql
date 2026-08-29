CREATE TYPE "public"."person_claim_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "person_claim_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"verification_note" text NOT NULL,
	"status" "person_claim_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by_user_id" text,
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "claimed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "person_claim_requests" ADD CONSTRAINT "person_claim_requests_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_claim_requests" ADD CONSTRAINT "person_claim_requests_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_claim_requests" ADD CONSTRAINT "person_claim_requests_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "person_claim_requests_person_idx" ON "person_claim_requests" USING btree ("person_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "person_claim_requests_pending_unique" ON "person_claim_requests" USING btree ("person_id","requested_by_user_id") WHERE "person_claim_requests"."status" = 'PENDING';--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;