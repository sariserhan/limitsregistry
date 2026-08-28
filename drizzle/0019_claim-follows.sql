CREATE TABLE IF NOT EXISTS "claim_follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "claim_number" text NOT NULL REFERENCES "claims"("claim_number"),
  "subscriber_key" text NOT NULL,
  "email" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "claim_follows_claim_subscriber_unique" UNIQUE("claim_number", "subscriber_key")
);
CREATE INDEX IF NOT EXISTS "claim_follows_subscriber_idx" ON "claim_follows" ("subscriber_key");
