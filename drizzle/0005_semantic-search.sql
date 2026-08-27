CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "semantic_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "registry_number" text,
  "title" text DEFAULT '' NOT NULL,
  "content" text NOT NULL,
  "content_hash" text DEFAULT '' NOT NULL,
  "embedding_model" text DEFAULT 'openai/text-embedding-3-small' NOT NULL,
  "embedding" vector(1536),
  "embedding_status" text DEFAULT 'PENDING' NOT NULL,
  "embedding_error" text,
  "last_embedded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'semantic_documents'
      AND column_name = 'embedding' AND data_type = 'text'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'semantic_documents' AND column_name = 'embedding_legacy'
  ) THEN
    ALTER TABLE "semantic_documents" RENAME COLUMN "embedding" TO "embedding_legacy";
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'semantic_documents' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE "semantic_documents" ADD COLUMN "embedding" vector(1536);
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "registry_number" text;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "content_hash" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "embedding_model" text DEFAULT 'openai/text-embedding-3-small' NOT NULL;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "embedding_status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "embedding_error" text;--> statement-breakpoint
ALTER TABLE "semantic_documents" ADD COLUMN IF NOT EXISTS "last_embedded_at" timestamp with time zone;--> statement-breakpoint
DROP INDEX IF EXISTS "semantic_entity_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "semantic_entity_unique" ON "semantic_documents" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semantic_registry_idx" ON "semantic_documents" USING btree ("registry_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semantic_status_idx" ON "semantic_documents" USING btree ("embedding_status");
