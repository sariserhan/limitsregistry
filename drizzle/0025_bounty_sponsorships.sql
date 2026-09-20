CREATE TABLE "bounty_sponsorships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bounty_id" uuid NOT NULL,
	"status" text DEFAULT 'REQUESTED' NOT NULL,
	"sponsor_url" text NOT NULL,
	"contact_email" text NOT NULL,
	"fee_amount" text,
	"fee_currency" text,
	"invoice_reference" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"resolution_note" text,
	"refund_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sponsorship_status_valid" CHECK ("bounty_sponsorships"."status" in ('REQUESTED','INVOICED','PAID','LAPSED','CANCELLED','REFUNDED')),
	CONSTRAINT "sponsorship_fee_paired" CHECK (("bounty_sponsorships"."fee_amount" is null) = ("bounty_sponsorships"."fee_currency" is null) and ("bounty_sponsorships"."fee_amount" is null) = ("bounty_sponsorships"."invoice_reference" is null)),
	CONSTRAINT "sponsorship_fee_valid" CHECK ("bounty_sponsorships"."fee_amount" is null or (case when "bounty_sponsorships"."fee_amount" ~ '^[0-9]{1,8}([.][0-9]{1,2})?$' then "bounty_sponsorships"."fee_amount"::numeric > 0 else false end)),
	CONSTRAINT "sponsorship_currency_valid" CHECK ("bounty_sponsorships"."fee_currency" is null or "bounty_sponsorships"."fee_currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "sponsorship_invoice_valid" CHECK ("bounty_sponsorships"."invoice_reference" is null or length(trim("bounty_sponsorships"."invoice_reference")) between 1 and 200),
	CONSTRAINT "sponsorship_invoice_required" CHECK ("bounty_sponsorships"."status" not in ('INVOICED','PAID','LAPSED','REFUNDED') or "bounty_sponsorships"."invoice_reference" is not null),
	CONSTRAINT "sponsorship_window_paired" CHECK (("bounty_sponsorships"."starts_at" is null) = ("bounty_sponsorships"."ends_at" is null) and ("bounty_sponsorships"."starts_at" is null) = ("bounty_sponsorships"."paid_at" is null)),
	CONSTRAINT "sponsorship_window_ordered" CHECK ("bounty_sponsorships"."ends_at" is null or "bounty_sponsorships"."ends_at" > "bounty_sponsorships"."starts_at"),
	CONSTRAINT "sponsorship_payment_required" CHECK ("bounty_sponsorships"."status" not in ('PAID','LAPSED','REFUNDED') or "bounty_sponsorships"."paid_at" is not null),
	CONSTRAINT "sponsorship_payment_invoice" CHECK ("bounty_sponsorships"."paid_at" is null or "bounty_sponsorships"."invoice_reference" is not null),
	CONSTRAINT "sponsorship_unpaid_window" CHECK ("bounty_sponsorships"."status" not in ('REQUESTED','INVOICED') or "bounty_sponsorships"."paid_at" is null),
	CONSTRAINT "sponsorship_resolution_required" CHECK ("bounty_sponsorships"."status" not in ('CANCELLED','REFUNDED') or length(trim(coalesce("bounty_sponsorships"."resolution_note",''))) between 10 and 2000),
	CONSTRAINT "sponsorship_refund_required" CHECK ("bounty_sponsorships"."status" <> 'REFUNDED' or length(trim(coalesce("bounty_sponsorships"."refund_reference",''))) between 1 and 200),
	CONSTRAINT "sponsorship_url_valid" CHECK ("bounty_sponsorships"."sponsor_url" ~ '^https://[^/?#[:space:]@]+([/?#][^[:space:]]*)?$' and length("bounty_sponsorships"."sponsor_url") <= 2000),
	CONSTRAINT "sponsorship_email_valid" CHECK ("bounty_sponsorships"."contact_email" ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' and length("bounty_sponsorships"."contact_email") <= 254)
);
--> statement-breakpoint
ALTER TABLE "bounty_sponsorships" ADD CONSTRAINT "bounty_sponsorships_bounty_id_research_bounties_id_fk" FOREIGN KEY ("bounty_id") REFERENCES "public"."research_bounties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bounty_sponsorship_expiry_idx" ON "bounty_sponsorships" USING btree ("status","ends_at");--> statement-breakpoint
CREATE INDEX "bounty_sponsorship_bounty_idx" ON "bounty_sponsorships" USING btree ("bounty_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bounty_sponsorship_pending_unique" ON "bounty_sponsorships" USING btree ("bounty_id") WHERE "bounty_sponsorships"."status" in ('REQUESTED','INVOICED');