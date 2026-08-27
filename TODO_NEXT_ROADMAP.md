# Limits Registry — Next Implementation Roadmap

This roadmap tracks the remaining work after the current research infrastructure commits. All write actions remain authenticated and review-gated. No draft Claim may affect a public frontier.

## 1. Semantic search

- [x] Enable PostgreSQL `pgvector` in Docker and Neon.
- [x] Add vector columns and migration.
- [x] Generate embeddings for Limits, specifications, Claims, and papers. (public-corpus indexer is implemented; production currently has no publishable rows and no `AI_GATEWAY_API_KEY`)
- [x] Add embedding refresh and failure handling.
- [x] Add semantic search repository functions and `/api/search`.
- [x] Add exact-search and semantic-search UI modes.
- [x] Add authorization, empty-state, and relevance tests.

## 2. Dependency graph

- [x] Add dependency database table.
- [x] Add dependency repository functions.
- [x] Add authenticated dependency submission API.
- [x] Add authenticated graph review page.
- [x] Add visual node-and-edge graph.
- [x] Add dependency creation form and editor decisions.
- [x] Display only accepted dependencies publicly.
- [x] Add reduction-direction and cycle validation.

## 3. Verification and reproducibility

- [x] Add verification-artifact database table.
- [x] Add artifact submission API.
- [x] Add artifact status page.
- [x] Add artifact submission form.
- [x] Add reviewer decisions and audit entries.
- [x] Add verifier execution records.
- [x] Add Lean 4, Coq, Isabelle, and SAT result adapters.
- [x] Issue `MACHINE_CHECKED` only after a reproducible successful build.
- [x] Show reproduction history on canonical Limit pages.

## 4. Breakthrough events

- [x] Detect newly accepted stronger bounds and constructions.
- [x] Detect accepted frontier closure.
- [x] Persist immutable breakthrough events.
- [x] Add audit-log records for generated events.
- [x] Display events on canonical pages and feeds.
- [x] Add tests proving draft or disputed Claims cannot trigger events.

## 5. Watchlists and notifications

- [x] Add watchlist-event database table.
- [x] Add published-only RSS endpoint: `/api/watchlists/rss?limitId=...`.
- [x] Add watchlist subscribe/unsubscribe UI.
- [x] Add email notification preferences.
- [x] Generate events only from accepted editorial changes.
- [x] Connect events to email and weekly digest delivery.
- [x] Add unsubscribe, retry, and delivery tests.

## 6. Prize and bounty tracker

- [x] Add bounty database table.
- [x] Add authenticated bounty submission API.
- [x] Add basic bounty listing in Research Infrastructure.
- [x] Add bounty creation form.
- [x] Add editor verification and moderation actions.
- [x] Add public verified-bounty listing.
- [x] Add expiration, status, currency, and source validation.
- [x] Link verified bounties to canonical Limits.

## 7. PDF and source ingestion

- [x] Add DOI and arXiv metadata ingestion.
- [x] Add arXiv PDF extraction.
- [x] Add AI draft extraction from extracted text.
- [x] Add BibTeX import and single/batch export.
- [x] Add secure DOI/publisher PDF allowlist.
- [x] Persist PDF extraction status and page count.
- [x] Add background processing, retries, size limits, and failure states.
- [x] Add source-ingestion integration tests.

## 8. UI integration

- [x] Add Research Infrastructure page: `/console/research`.
- [x] Add dependency graph review page: `/console/research/graph`.
- [x] Add artifact status page: `/console/research/artifacts`.
- [x] Add navigation links from the main Console.
- [x] Add forms for artifacts, dependencies, bounties, and watchlists.
- [x] Add semantic-search interface.
- [x] Add interactive graph visualization.
- [x] Add breakthrough feed and notification controls.
- [x] Add accessible loading, empty, error, and success states.

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
