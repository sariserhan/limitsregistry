CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_number" text NOT NULL,
	"certificate_type" text NOT NULL,
	"claim_id" uuid NOT NULL,
	"record_hash" text NOT NULL,
	"signature" text,
	"signature_algorithm" text DEFAULT 'SHA-256' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"issued_by_user_id" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"superseded_at" timestamp with time zone,
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_user_id_user_id_fk" FOREIGN KEY ("issued_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "certificates_claim_idx" ON "certificates" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "certificates_hash_idx" ON "certificates" USING btree ("record_hash");