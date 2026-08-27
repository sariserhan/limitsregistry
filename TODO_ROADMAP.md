# Limits Registry Todo Roadmap

## Current status

Implementation status is tracked honestly below: completed infrastructure is checked off, while database-backed UI reads, editorial writes, and launch-catalog curation remain open.

- [x] Next.js + TypeScript application scaffold
- [x] Public Browse experience
- [x] Canonical `/limits/[id]` pages
- [x] Research Console prototype
- [x] Claim-centered domain model
- [x] Specification version model
- [x] Deterministic frontier computation
- [x] Exact, rational, text, asymptotic, and probabilistic value support
- [x] Claim validation rules
- [x] Ten ontology stress-test fixtures
- [x] Drizzle ORM schema
- [x] Dockerized local PostgreSQL
- [x] Neon production database connection
- [x] Initial migration applied to Neon
- [x] Server-side repository layer
- [x] Database health endpoint
- [x] Tests, typecheck, lint, and production build

## V1 — finish the trusted registry

### 1. Data model hardening

- [ ] Add explicit `evidence` and `review` fixtures to every ontology test.
- [x] Add rational and scientific-notation comparison tests.
- [x] Define strict semantics for `<` and `>` bounds.
- [x] Define integer-gap display rules separately from continuous values.
- [x] Add validation for contradictory accepted Claims.
- [x] Add validation for impossible frontiers, such as lower bound greater than upper bound.
- [x] Add immutable correction and invalidation event tests.

### 2. Database-backed reads

- [x] Add repository functions for specification versions, evidence, reviews, timeline events, papers, and people.
- [x] Add database serializers between Drizzle rows and domain types.
- [ ] Replace static public page data with server-side database reads.
- [x] Add a safe empty-registry state for a new production database.
- [x] Add pagination and filtering to repository queries.
- [ ] Add database integration tests against Docker PostgreSQL.

### 3. Editorial console

- [x] Add source intake form.
- [x] Add Limit creation flow.
- [x] Add specification-version creation flow.
- [x] Add Claim draft form with runtime validation.
- [x] Add evidence attachment flow.
- [x] Add review decision flow.
- [x] Add accept, reject, request-revision, dispute, and invalidate actions.
- [x] Add audit-log display.
- [x] Add editorial queue filters and search.
- [x] Keep all write actions server-side.

### 4. Public registry quality

- [x] Show Claim provenance on canonical pages.
- [x] Show specification details and constraints.
- [x] Show correction and dispute history.
- [x] Show derived frontier explanation.
- [x] Add canonical metadata, sitemap, robots.txt, and structured data.
- [x] Add accessible loading, empty, and error states.
- [x] Add copy-citation interaction.
- [ ] Add responsive visual QA at mobile, tablet, desktop, and wide desktop sizes.

### 5. Launch catalog

- [ ] Select 25–40 real Limits across mathematics and theoretical CS.
- [ ] Write formal specifications for each Limit.
- [ ] Gather original papers and evidence locations.
- [ ] Resolve people and institutions conservatively.
- [ ] Create historical timeline events.
- [ ] Complete independent editorial review.
- [ ] Publish only records with evidence-backed Claims.
- [ ] Verify every public quantitative statement against a source.

### 6. Operations and deployment

- [ ] Push the latest server-layer commit to GitHub.
- [ ] Verify Vercel Preview deployment.
- [ ] Verify Vercel Production deployment from `main`.
- [ ] Confirm Neon Preview/Production environment separation.
- [ ] Configure Neon backup and retention expectations.
- [ ] Add error monitoring and request IDs.
- [ ] Add production database migration runbook.
- [ ] Add rollback/forward-fix procedure.
- [ ] Add security review for admin and database routes.

## V2 — real editorial platform

- [ ] Add authentication with Better Auth or another selected provider.
- [ ] Add server-side roles and permissions.
- [ ] Add protected editor and admin routes.
- [ ] Add persistent users and reviewer identities.
- [ ] Add DOI, Crossref, OpenAlex, and arXiv source ingestion.
- [ ] Add AI-assisted metadata and Claim extraction as draft-only workflows.
- [ ] Add contradiction and duplicate detection.
- [ ] Add paper, researcher, and institution pages backed by Postgres.
- [ ] Add reviewer assignments and conflict-of-interest tracking.
- [ ] Add public API only after the data contract stabilizes.
- [ ] Add Neon branch-based preview database workflow.

## V3 — open research infrastructure

- [ ] Add authenticated public submissions.
- [ ] Add expert reviewer network and credentials.
- [ ] Add reproducible computational verification.
- [ ] Add sandboxed execution for approved verifier types.
- [ ] Add independent reproduction workflows.
- [ ] Add notifications and followed Limits.
- [ ] Add public data exports and API rate limits.
- [ ] Evaluate Upstash Redis for queues, rate limiting, and cache workloads.
- [ ] Evaluate certificates and sponsored challenges only after trust is established.

## Explicit non-goals for now

- [ ] No payments or Stripe integration
- [ ] No public submissions
- [ ] No social network, chat, or forums
- [ ] No AI-only publication
- [ ] No physics, engineering, or unstable AI benchmark coverage
- [ ] No multi-objective/Pareto Limits
- [ ] No arbitrary contributor-code execution

## V1 completion gate

V1 is complete when:

1. The ten ontology tests pass with evidence and review records.
2. Public pages read from the database rather than static arrays.
3. Editors can create, review, correct, and invalidate Claims.
4. Every published quantitative statement links to evidence.
5. At least 25 real Limits pass the editorial checklist.
6. Preview and Production deployments are reproducible.
7. The database backup, migration, and incident runbooks exist.
