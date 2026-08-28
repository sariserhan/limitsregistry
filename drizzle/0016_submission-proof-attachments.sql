CREATE TABLE IF NOT EXISTS "proof_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "submission_id" uuid NOT NULL UNIQUE REFERENCES "submissions"("id") ON DELETE cascade,
  "filename" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "contents" bytea NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
