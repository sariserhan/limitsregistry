#!/usr/bin/env bash
# Apply and verify pending Drizzle migrations against Neon, Preview first then Production.
# Run this from your own terminal (authenticated to the ssari/limitsregistry Vercel project) —
# it needs real, unmasked env vars that a sandboxed agent session cannot read.
#
# Usage:
#   ./scripts/deploy-migrate.sh preview
#   ./scripts/deploy-migrate.sh production   # only after Preview has been verified
set -euo pipefail

TARGET="${1:-}"
if [[ "$TARGET" != "preview" && "$TARGET" != "production" ]]; then
  echo "Usage: $0 <preview|production>" >&2
  exit 1
fi

if [[ "$TARGET" == "production" ]]; then
  read -r -p "About to run a forward migration against PRODUCTION Neon. Type 'production' to continue: " CONFIRM
  if [[ "$CONFIRM" != "production" ]]; then
    echo "Aborted." >&2
    exit 1
  fi
fi

cd "$(git rev-parse --show-toplevel)"

echo "==> Running full check suite (typecheck, lint, test, build)"
npm run typecheck
npm run lint
npm test
npm run build

echo "==> Checking for uncommitted schema changes needing a new migration"
npm run db:generate
if git status --porcelain drizzle/ | grep -q .; then
  echo "New migration files were generated. Review, commit them, and re-run this script." >&2
  git status --short drizzle/ >&2
  exit 1
fi

if command -v vercel >/dev/null 2>&1; then
  VERCEL=(vercel)
else
  echo "==> Vercel CLI not installed globally; using npx vercel"
  VERCEL=(npx --yes vercel)
fi

ENV_FILE="$(mktemp -t "vercel-env-${TARGET}.XXXXXX")"
trap 'rm -f "$ENV_FILE"' EXIT

echo "==> Pulling ${TARGET} environment variables from Vercel"
vercel env pull --environment="$TARGET" --yes "$ENV_FILE"

DB_URL="$(grep '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')"
if [[ -z "$DB_URL" || "$DB_URL" == "[SENSITIVE]" ]]; then
  echo "DATABASE_URL for ${TARGET} was not resolvable (masked or missing). Aborting without migrating." >&2
  exit 1
fi

echo "==> Applying forward migrations against ${TARGET}"
DATABASE_URL="$DB_URL" npm run db:migrate

HEALTH_URL="https://www.limitsregistry.com/api/health/db"
if [[ "$TARGET" == "preview" ]]; then
  read -r -p "Preview deployment URL to verify against (e.g. https://limitsregistry-xxxx-ssari.vercel.app): " PREVIEW_URL
  HEALTH_URL="${PREVIEW_URL%/}/api/health/db"
fi

echo "==> Verifying ${HEALTH_URL}"
curl -sD - -o /dev/null "$HEALTH_URL"

echo "==> Done. Confirm the response above was 200 and note the x-request-id for the deployment log."
