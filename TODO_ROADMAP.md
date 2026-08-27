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
- [x] Normalize researched candidate packets as draft-only, source-linked records with editorial-readiness and research-queue states. (`src/domain/research-packets.ts`; no draft can contribute to a published frontier)

## V1 — finish the trusted registry

### 1. Data model hardening

- [x] Add explicit `evidence` and `review` fixtures to every ontology test.
- [x] Add rational and scientific-notation comparison tests.
- [x] Define strict semantics for `<` and `>` bounds.
- [x] Define integer-gap display rules separately from continuous values.
- [x] Add validation for contradictory accepted Claims.
- [x] Add validation for impossible frontiers, such as lower bound greater than upper bound.
- [x] Add immutable correction and invalidation event tests.

### 2. Database-backed reads

- [x] Add repository functions for specification versions, evidence, reviews, timeline events, papers, and people.
- [x] Add database serializers between Drizzle rows and domain types.
- [x] Replace static public page data with server-side database reads.
- [x] Add a safe empty-registry state for a new production database.
- [x] Add pagination and filtering to repository queries.
- [x] Add database integration tests against Docker PostgreSQL.

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
- [x] Add accessible loading, empty, and error states. (`app/loading.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, plus per-route skeletons for `/limits/[id]`, `/papers/[id]`, `/researchers/[id]`, `/institutions/[id]`, `/console`, `/admin`; empty states already existed on Console/Admin lists)
- [x] Add copy-citation interaction. (`app/limits/[id]/CopyCitationButton.tsx`)
- [x] Add responsive visual QA at mobile, tablet, desktop, and wide desktop sizes. (375/768/1440/1920 checked with agent-browser; fixed a mobile overflow on `/admin`'s table and a squeezed intake form on `/console`; vertically centered and branded `/login` and `/signup`)

### 5. Launch catalog

- [x] Select 25–40 real Limits across mathematics and theoretical CS.
- [x] Write formal specifications for each Limit.
- [x] Gather original papers and evidence locations. (`scripts/seed-launch-catalog.ts` — 32 real papers with real DOI/arXiv IDs, gathered via cited research across 5 independent research passes, one per 5-limit batch; deduped against each other, e.g. Hamming 1950 is shared by two limits and stored once)
- [x] Resolve people and institutions conservatively. (39 real paper authors resolved by name; institutions deliberately *not* resolved — nearly every affiliation research turned up came back "not confirmed," so per the conservative-resolution rule they were left out rather than guessed)
- [x] Create historical timeline events. (49 events, e.g. Turán 1941, Håstad 1986, the Coppersmith–Winograd → Duan–Wu–Zhou → Williams–Xu–Xu–Zhou matrix-multiplication-exponent chain)
- [ ] Complete independent editorial review. (cannot be done by the agent that drafted the content — self-review isn't independent — per master spec §8/§74/"No AI-only publication." All 26 seeded Claims sit in DRAFT with a real citation attached, ready for a human reviewer.)
- [ ] Publish only records with evidence-backed Claims. (same constraint: publishing — i.e. accepting a Claim, or flipping a Limit's status off DRAFT — is a human/admin action per the spec's Publication Rule, not something to do unreviewed on the spec's own authority)
- [ ] Verify every public quantitative statement against a source. (not yet applicable — nothing from this pass is public yet; every seeded Claim already carries its source citation in `method_summary`/`claim_papers`, ready for a reviewer to check against the primary source before publishing)

### 6. Operations and deployment

- [x] Push the latest server-layer commit to GitHub.
- [x] Verify Vercel Preview deployment.
- [x] Verify Vercel Production deployment from `main`.
- [x] Confirm Neon Preview/Production environment separation.
- [x] Configure Neon backup and retention expectations.
- [x] Add error monitoring and request IDs.
- [x] Add production database migration runbook.
- [x] Add rollback/forward-fix procedure.
- [x] Add security review for admin and database routes.

## V2 — real editorial platform

- [x] Add authentication with Better Auth or another selected provider. (email/password; `src/auth/`; email verification and password reset via Resend — `src/lib/email/`, `/forgot-password`, `/reset-password`)
- [x] Add server-side roles and permissions. (`USER < RESEARCHER < REVIEWER < EDITOR < ADMIN < SUPERADMIN`, `src/auth/permissions.ts`, enforced in `requireRole()` — never client-side only)
- [x] Add protected editor and admin routes. (`/console` RESEARCHER+, `/admin` ADMIN+; optimistic `proxy.ts` redirect + secure per-page `requireRole()` check)
- [x] Add persistent users and reviewer identities. (Better Auth `user`/`session`/`account` tables; `reviews.reviewer_user_id` and `audit_logs.actor_user_id` now reference real users)
- [ ] Add DOI, Crossref, OpenAlex, and arXiv source ingestion. (DOI via Crossref and arXiv done — `src/lib/ingestion/`; OpenAlex intentionally skipped as redundant with Crossref for this catalog's needs, add if citation-graph/open-access data becomes a real requirement)
- [x] Add AI-assisted metadata and Claim extraction as draft-only workflows. (`src/lib/ai/extract-claims.ts` writes only to `candidate_claims`, never `claims`; metadata itself stays deterministic per spec §53, sourced from Crossref/arXiv, not AI)
- [x] Add contradiction and duplicate detection. (`src/domain/contradiction.ts`, `src/domain/duplicate-detection.ts`, wired into the Research Console intake and candidate-review flow)
- [x] Add paper, researcher, and institution pages backed by Postgres. (`/papers/[id]`, `/researchers/[id]`, `/institutions/[id]`)
- [ ] Add reviewer assignments and conflict-of-interest tracking. (schema only — `reviewer_assignments` table with `conflict_disclosed`; no assignment UI yet since there's no claim-detail editor to attach it to until the V1 editorial console lands)
- [ ] Add public API only after the data contract stabilizes. (deliberately not started — the public-page data contract is still V1 work in progress)
- [ ] Add Neon branch-based preview database workflow. (not yet configured — Vercel's Neon integration creates a DB branch per PR automatically once installed on the project in the Vercel dashboard; no app code needed, just enabling the integration)

## V3 — open research infrastructure

- [x] Add authenticated public submissions. (`/submit` — any signed-in USER proposes a better result/stronger bound/proof/reproduction/correction against a published Limit, rate-limited 5/hour/user; `/console` gets an EDITOR+ review queue with required reviewer notes. Accepting a submission never writes to `claims` directly — same draft-only posture as the AI-extraction candidate queue. Note: this directly contradicts this file's own "No public submissions" non-goal below — read that as "not yet, for V1/V2" since V3 has its own line item for exactly this; flagging the tension rather than silently overriding it.)
- [x] Add expert reviewer network and credentials. (`reviewer_profiles` table + `/reviewer-profile` self-service editor for REVIEWER+ users; directory visible at `/admin`. Self-reported only, labeled as such everywhere it's shown — not independently verified, consistent with how institutions were handled in the launch-catalog pass.)
- [x] Add reproducible computational verification.
- [x] Add sandboxed execution for approved verifier types.
- [x] Add independent reproduction workflows.
- [x] Add notifications and followed Limits.
- [x] Add public data exports and API rate limits.
- [x] Evaluate Upstash Redis for queues, rate limiting, and cache workloads.
- [x] Evaluate certificates and sponsored challenges only after trust is established.

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
