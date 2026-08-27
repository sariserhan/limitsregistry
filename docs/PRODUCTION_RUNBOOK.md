# Production runbook

## Environments

Vercel Preview uses the Neon Preview branch and `DATABASE_URL` scoped to Preview. Vercel Production uses the Neon Production branch and a separate Production `DATABASE_URL`. Never reuse a production URL in Preview.

## Deploy

1. Run `npm run typecheck && npm run lint && npm test && npm run build`.
2. Generate a reviewed migration with `npm run db:generate`.
3. Apply forward migrations with `npm run db:migrate` against the target environment.
4. Verify `GET /api/health/db` returns 200 and inspect the deployment logs/request ID.

## Rollback / forward-fix

Application rollback is a Vercel deployment rollback. Database migrations are forward-only: do not edit an applied migration or drop production data. For a bad migration, deploy a corrective migration, verify on Preview first, then apply Production.

## Neon retention

Keep Neon point-in-time restore and retention enabled according to the selected plan. Record the retention window and branch owner in the deployment change log; periodically perform a restore drill on a non-production branch.

## Incident checks

Use the `x-request-id` response header and structured server logs. If health is 503, stop editorial writes, inspect Neon status/connectivity, and prefer a forward-fix or deployment rollback only after confirming schema compatibility.


## Neon backup and retention checklist

- Enable Neon point-in-time restore and confirm the retention window allowed by the production plan.
- Keep Preview and Production on separate Neon branches/projects and separate Vercel environment variables.
- Record the selected retention window and last restore drill date in the change log.
- Perform a restore drill on a non-production branch before the first public launch and after major schema changes.

Neon retention is configured in the Neon project console/plan, not through application code.
