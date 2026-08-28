ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "affiliation" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "orcid" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "website" text;
