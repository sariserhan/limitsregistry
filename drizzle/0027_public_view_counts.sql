CREATE TABLE "public_view_counts" (
	"kind" text NOT NULL,
	"target" text NOT NULL,
	"views" bigint DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_view_counts_kind_target_pk" PRIMARY KEY("kind","target"),
	CONSTRAINT "public_view_kind" CHECK ("public_view_counts"."kind" in ('LIMIT', 'CATEGORY', 'BOUNTY')),
	CONSTRAINT "public_view_nonnegative" CHECK ("public_view_counts"."views" >= 0)
);
--> statement-breakpoint
CREATE TABLE "public_view_receipts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "public_view_receipts_created_idx" ON "public_view_receipts" USING btree ("created_at");