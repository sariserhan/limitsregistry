CREATE TYPE "public"."announcement_level" AS ENUM('INFO', 'WARNING', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."inbox_channel" AS ENUM('CONTACT', 'SUPPORT');--> statement-breakpoint
CREATE TYPE "public"."inbox_status" AS ENUM('OPEN', 'RESOLVED');--> statement-breakpoint
CREATE TABLE "admin_sent_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"heading" text NOT NULL,
	"body" text NOT NULL,
	"footer_note" text,
	"sent_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" "inbox_channel" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" "inbox_status" DEFAULT 'OPEN' NOT NULL,
	"reply_body" text,
	"replied_at" timestamp with time zone,
	"replied_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"maintenance_enabled" boolean DEFAULT false NOT NULL,
	"maintenance_message" text,
	"announcement_enabled" boolean DEFAULT false NOT NULL,
	"announcement_message" text,
	"announcement_level" "announcement_level" DEFAULT 'INFO' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" text
);
--> statement-breakpoint
ALTER TABLE "admin_sent_emails" ADD CONSTRAINT "admin_sent_emails_sent_by_user_id_user_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_replied_by_user_id_user_id_fk" FOREIGN KEY ("replied_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inbox_messages_channel_idx" ON "inbox_messages" USING btree ("channel");