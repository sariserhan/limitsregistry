# Limits Registry — Next Implementation Roadmap

This roadmap tracks the remaining work after the current research infrastructure commits. All write actions remain authenticated and review-gated. No draft Claim may affect a public frontier.

## 1. Semantic search

- [ ] Enable PostgreSQL `pgvector` in Docker and Neon.
- [ ] Add vector columns and migration.
- [ ] Generate embeddings for Limits, specifications, Claims, and papers.
- [ ] Add embedding refresh and failure handling.
- [ ] Add semantic search repository functions and `/api/search`.
- [ ] Add exact-search and semantic-search UI modes.
- [ ] Add authorization, empty-state, and relevance tests.

## 2. Dependency graph

- [x] Add dependency database table.
- [x] Add dependency repository functions.
- [x] Add authenticated dependency submission API.
- [x] Add authenticated graph review page.
- [ ] Add visual node-and-edge graph.
- [ ] Add dependency creation form and editor decisions.
- [ ] Display only accepted dependencies publicly.
- [ ] Add reduction-direction and cycle validation.

## 3. Verification and reproducibility

- [x] Add verification-artifact database table.
- [x] Add artifact submission API.
- [x] Add artifact status page.
- [ ] Add artifact submission form.
- [ ] Add reviewer decisions and audit entries.
- [ ] Add verifier execution records.
- [ ] Add Lean 4, Coq, Isabelle, and SAT result adapters.
- [ ] Issue `MACHINE_CHECKED` only after a reproducible successful build.
- [ ] Show reproduction history on canonical Limit pages.

## 4. Breakthrough events

- [ ] Detect newly accepted stronger bounds and constructions.
- [ ] Detect accepted frontier closure.
- [ ] Persist immutable breakthrough events.
- [ ] Add audit-log records for generated events.
- [ ] Display events on canonical pages and feeds.
- [ ] Add tests proving draft or disputed Claims cannot trigger events.

## 5. Watchlists and notifications

- [x] Add watchlist-event database table.
- [x] Add published-only RSS endpoint: `/api/watchlists/rss?limitId=...`.
- [ ] Add watchlist subscribe/unsubscribe UI.
- [ ] Add email notification preferences.
- [ ] Generate events only from accepted editorial changes.
- [ ] Connect events to email and weekly digest delivery.
- [ ] Add unsubscribe, retry, and delivery tests.

## 6. Prize and bounty tracker

- [x] Add bounty database table.
- [x] Add authenticated bounty submission API.
- [x] Add basic bounty listing in Research Infrastructure.
- [ ] Add bounty creation form.
- [ ] Add editor verification and moderation actions.
- [ ] Add public verified-bounty listing.
- [ ] Add expiration, status, currency, and source validation.
- [ ] Link verified bounties to canonical Limits.

## 7. PDF and source ingestion

- [x] Add DOI and arXiv metadata ingestion.
- [x] Add arXiv PDF extraction.
- [x] Add AI draft extraction from extracted text.
- [x] Add BibTeX import and single/batch export.
- [ ] Add secure DOI/publisher PDF allowlist.
- [ ] Persist PDF extraction status and page count.
- [ ] Add background processing, retries, size limits, and failure states.
- [ ] Add source-ingestion integration tests.

## 8. UI integration

- [x] Add Research Infrastructure page: `/console/research`.
- [x] Add dependency graph review page: `/console/research/graph`.
- [x] Add artifact status page: `/console/research/artifacts`.
- [ ] Add navigation links from the main Console.
- [ ] Add forms for artifacts, dependencies, bounties, and watchlists.
- [ ] Add semantic-search interface.
- [ ] Add interactive graph visualization.
- [ ] Add breakthrough feed and notification controls.
- [ ] Add accessible loading, empty, error, and success states.

## 9. Validation and release

- [ ] Apply and verify migration `0004_research-infrastructure.sql` in Docker.
- [ ] Apply and verify the migration in Neon through the deployment workflow.
- [ ] Add integration tests for all new tables and APIs.
- [ ] Add authorization and draft/publication-isolation tests.
- [ ] Run full TypeScript, lint, unit, integration, and production-build checks.
- [ ] Run browser QA at 375, 768, 1440, and 1920 pixels.
- [ ] Update `TODO_ROADMAP.md` when each item is genuinely complete.
- [ ] Commit all changes locally.
- [ ] Do not push without explicit authorization.
