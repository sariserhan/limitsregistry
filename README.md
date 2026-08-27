# Limits Registry

Limits Registry is a curated public record of mathematical and theoretical-computer-science limits.

## Local development

Requirements: Node.js 20+, npm, and Docker.

```bash
npm install
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run dev
```

The local database is PostgreSQL 16 in Docker. Production uses Neon PostgreSQL through the same `DATABASE_URL` and Drizzle schema.

## Database workflow

```bash
npm run db:generate  # create a reviewed migration
npm run db:migrate   # apply migrations
npm run db:studio    # inspect locally
```

Never commit `.env.local` or production credentials. In Vercel, configure a Neon pooled connection string as `DATABASE_URL` separately for Preview and Production.

## Verification

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
