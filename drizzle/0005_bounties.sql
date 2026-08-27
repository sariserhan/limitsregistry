CREATE TYPE "public"."bounty_status" AS ENUM('ACTIVE', 'CLAIMED', 'EXPIRED', 'WITHDRAWN');--> statement-breakpoint
CREATE TABLE "bounties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sponsor" text NOT NULL,
	"amount" text,
	"url" text NOT NULL,
	"status" "bounty_status" DEFAULT 'ACTIVE' NOT NULL,
	"notes" text,
	"added_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bounties" ADD CONSTRAINT "bounties_limit_id_limits_id_fk" FOREIGN KEY ("limit_id") REFERENCES "public"."limits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bounties" ADD CONSTRAINT "bounties_added_by_user_id_user_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bounties_limit_idx" ON "bounties" USING btree ("limit_id");