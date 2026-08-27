# AI Web App Development Roadmap

> Reusable baseline for AI-assisted web application projects.
> Keep project-specific decisions, requirements, and implementation notes under each section as the project evolves.

---

## Global Development Principles

- Build everything in the most optimized, efficient, maintainable, and production-ready way practical.
- Prefer simple architecture over unnecessary complexity.
- Avoid premature over-engineering, but do not create obvious scaling, security, or maintenance bottlenecks.
- Reuse shared components, utilities, schemas, types, validation, and business logic wherever appropriate.
- Keep frontend, backend, database, infrastructure, and third-party integrations clearly separated.
- Use strong typing and validation across system boundaries.
- Minimize unnecessary dependencies, network requests, database queries, client-side JavaScript, and duplicated logic.
- Optimize for performance, reliability, security, developer experience, and operating cost.
- All production-critical behavior should be observable and debuggable.
- Design for graceful failure and clear user-facing error states.
- Keep secrets and credentials out of source control.
- Prefer environment-based configuration for deployment-specific values.

---

## Standard Technology Baseline

### Framework

- **Next.js**
- Use the current stable Next.js architecture appropriate for the project.
- Prefer Server Components and server-side execution where they reduce client-side complexity.
- Use Client Components only where browser interactivity requires them.
- Optimize rendering, caching, data fetching, images, fonts, and bundle size.

### Source Control

- **GitHub**
- GitHub is the source of truth for the application code.
- Use a clean Git workflow with meaningful commits.
- Production deployment must originate from GitHub rather than manual local deployment.

### Deployment

- **Vercel**
- Vercel must be connected directly to the GitHub repository.
- A push/merge to the configured production branch must automatically trigger a Vercel production deployment.
- Pull requests and non-production branches should use Vercel Preview Deployments where appropriate.
- Manual production deployments should not be the normal deployment workflow.
- Deployment configuration, environment variables, build commands, domains, redirects, headers, and runtime settings must be documented.

### Database Options

Choose the database based on the project's actual requirements:

- **Supabase**
- **Neon**
- **Convex**

Selection criteria should include:

- relational vs reactive data requirements
- real-time requirements
- transaction requirements
- expected scale
- query patterns
- geographic distribution
- authentication integration
- file/storage requirements
- operational complexity
- pricing
- migration requirements
- vendor lock-in
- developer experience

Do not select a database merely because it was used in another project.

### Authentication Options

Choose one:

- **Better Auth**
- **Clerk**

Authentication design must consider:

- email/password
- passwordless
- social login
- OAuth
- session management
- organization/team accounts
- roles and permissions
- MFA
- account recovery
- email verification
- authorization boundaries
- server-side protection
- API protection

Authorization must always be enforced server-side, regardless of frontend visibility.

### Email

- **Resend**
- All transactional and system emails should be sent through Resend unless a project has a documented reason to use another provider.
- Every email must use a professionally designed, responsive HTML email template.
- Email templates must visually match the website's design system and brand theme.
- Reuse website branding such as:
  - logo
  - typography
  - spacing
  - colors
  - border radius
  - button styles
  - tone of voice
- Emails must render well on desktop and mobile.
- Include a useful plain-text fallback where appropriate.
- Test major email clients where practical.
- Centralize shared email layout/components instead of designing every email independently.
- Handle delivery failures, retries, and provider errors appropriately.
- Configure SPF, DKIM, and DMARC for production sending domains.

### Payments

- **Stripe**
- Use Stripe for payments, subscriptions, billing, and customer payment management unless otherwise specified.
- Prefer Stripe-hosted flows such as Checkout and Customer Portal where they reduce implementation and compliance complexity.
- Treat Stripe webhooks as the authoritative source for asynchronous payment state changes.
- Verify webhook signatures.
- Make webhook processing idempotent.
- Never trust successful payment state based only on a browser redirect.
- Store only the Stripe identifiers and payment metadata the application actually needs.
- Do not store raw card information.

---


## Standard Engineering Rules

### Runtime & Package Management

- Define and pin the supported Node.js version.
- Use one package manager consistently across the project.
- Prefer `pnpm` unless the project has a specific reason to use another package manager.
- Commit the lockfile.
- Do not mix package managers.
- Keep runtime versions consistent between local development, CI, and Vercel.

### TypeScript

- Use TypeScript throughout the application.
- Enable strict TypeScript settings.
- Avoid `any` unless there is a documented unavoidable reason.
- Prefer inferred types where clear and explicit types at public boundaries.
- Keep shared domain types centralized.
- Never trust TypeScript alone for runtime validation.

### Runtime Validation

- Use Zod or an equivalent runtime schema system at trust boundaries.
- Validate:
  - forms
  - API input
  - webhook payloads
  - AI structured output
  - environment variables
  - third-party responses when required
  - database boundary input when useful
- Validation errors must become clear, structured application errors.

### Code Quality

- Keep components and modules focused.
- Avoid giant components and multi-purpose utility files.
- Reuse existing patterns before adding new abstractions.
- Do not duplicate business logic.
- Remove dead code.
- Avoid unnecessary comments that repeat the code.
- Prefer clear naming over clever naming.
- Keep dependencies minimal.
- Do not install a dependency for trivial functionality that can be safely implemented internally.

### Dependency Policy

Before adding a dependency, consider:

- maintenance activity
- security history
- bundle size
- runtime impact
- transitive dependencies
- vendor lock-in
- whether platform/framework functionality already solves the problem

### Server / Client Boundary

- Keep secrets server-side.
- Keep privileged operations server-side.
- Never expose private API keys to the browser.
- Never trust client-provided roles, prices, subscription state, permissions, or ownership.
- Minimize Client Components.
- Prefer server-side data access when it improves security and efficiency.

### Environment Variables

- Maintain `.env.example`.
- Never commit real secrets.
- Validate required environment variables at startup/build where appropriate.
- Separate preview and production credentials.
- Document the owner and purpose of every production secret.
- Maintain a rotation/revocation process for critical secrets.

### GitHub Rules

- GitHub is the source of truth.
- `main` or the documented production branch represents production.
- Prefer pull requests for significant changes.
- Run automated checks before merge where appropriate.
- Protect the production branch for mature projects.
- Do not use force pushes on production branches as a normal workflow.
- Keep commits understandable and scoped.

### GitHub → Vercel Deployment Rule

Required production flow:

```text
Local Development
      ↓
Commit
      ↓
GitHub Push / Pull Request
      ↓
Automated Checks
      ↓
Vercel Preview Deployment
      ↓
Review / Test
      ↓
Merge to Production Branch
      ↓
Automatic Vercel Production Deployment
```

- A GitHub push/merge must be the normal trigger for Vercel deployment.
- Do not require local `vercel --prod` commands for routine production deployment.
- Preview and production environment variables must be correctly separated.
- Deployments must be reproducible.

### Database Discipline

- Design indexes around real query patterns.
- Avoid N+1 queries.
- Paginate potentially large datasets.
- Use constraints for invariants that the database can safely enforce.
- Keep migrations in source control.
- Never make undocumented manual production schema changes.
- Prefer backwards-compatible migrations for zero-downtime deployment.
- Plan migration rollback or forward-fix behavior.
- Keep database access efficient and measurable.

### Authentication

Authentication provider:

- Better Auth
- Clerk

Rules:

- Protect authentication state server-side.
- Use secure cookies/session configuration.
- Implement verification and recovery flows safely.
- Rate-limit authentication abuse where relevant.
- Do not leak whether sensitive accounts exist unnecessarily.

### Authorization

- Authorization must always be enforced server-side.
- Hiding a UI element is never authorization.
- Verify ownership before accessing user-owned resources.
- Verify roles for privileged operations.
- Protect against IDOR/BOLA vulnerabilities.
- Test cross-account access attempts.
- Centralize permission logic where practical.

### Stripe

- Use Stripe Checkout and Customer Portal when they reduce unnecessary complexity.
- Treat verified Stripe webhooks as authoritative for asynchronous billing state.
- Verify webhook signatures.
- Make webhook processing idempotent.
- Deduplicate events.
- Never unlock paid access from a browser success redirect alone.
- Store only necessary Stripe identifiers and state.
- Do not store raw card data.
- Model subscription/entitlement states explicitly.
- Handle:
  - checkout completion
  - subscription creation
  - upgrades
  - downgrades
  - cancellations
  - trial transitions
  - payment failures
  - refunds
  - disputes
  - expiration
- Test duplicate and out-of-order webhook events.

### Resend & Email

- Use Resend for application email unless documented otherwise.
- Create a centralized branded email layout.
- Reuse shared email components.
- Match the application's visual identity.
- Make all emails responsive.
- Test mobile layouts.
- Include plain-text versions where appropriate.
- Validate all template variables.
- Never interpolate untrusted HTML directly.
- Track delivery failures when operationally useful.
- Configure SPF, DKIM, and DMARC.
- Separate transactional and marketing requirements.
- Provide unsubscribe behavior where legally or product-wise required.

### Email Design Standard

Each email should reflect the website theme through:

- logo
- typography
- colors
- spacing
- border radius
- buttons
- card styling
- tone
- footer
- support links

Each project should maintain:

- shared email wrapper
- shared CTA component
- shared header
- shared footer
- reusable information rows/cards
- email preview fixtures

### AI Cost Controls

For AI-enabled applications:

- choose the cheapest model that reliably satisfies the task
- establish output token limits
- avoid sending unnecessary context
- cache deterministic/reusable outputs where safe
- apply per-user and per-IP controls when relevant
- set timeouts
- cap retries
- track model usage and cost
- protect expensive AI routes against abuse
- separate synchronous and background AI workloads appropriately

### AI Reliability

- Prefer structured model output.
- Validate AI output against schemas.
- Never make the LLM responsible for deterministic rules that code can reliably enforce.
- Keep prompts versioned.
- Build fallback behavior.
- Handle invalid or partial outputs.
- Maintain test/evaluation cases for critical AI features.
- Track model/provider changes that affect behavior.

### Observability Defaults

Recommended baseline:

- Sentry for errors and performance
- PostHog for product analytics when product analytics is needed

Track:

- frontend exceptions
- backend exceptions
- API failures
- database failures
- webhook failures
- background job failures
- AI failures
- payment failures
- deployment regressions

Avoid logging secrets and unnecessary personal data.

### Audit Trail

Record important events when relevant:

- admin actions
- account changes
- role changes
- billing changes
- refunds
- payouts
- destructive actions
- security-sensitive changes
- document generation
- feature-flag changes
- site-mode changes

Audit entries should capture:

- actor
- action
- target
- timestamp
- relevant metadata
- before/after values when safe and useful

### Data Lifecycle

Define:

- data creation
- retention
- archival
- export
- deletion
- account deletion
- cascading deletion
- anonymization
- backups
- restoration

Never retain data indefinitely without reason.

### Performance Budgets

Define project-appropriate limits for:

- initial JavaScript
- route payload
- image size
- API latency
- database query latency
- server response time
- Core Web Vitals
- AI response latency where relevant

### Caching Policy

For every cacheable resource decide:

- what is cached
- where it is cached
- who can see it
- cache key
- TTL
- invalidation strategy
- whether stale data is acceptable

Never cache private user data in a shared public cache.

### Concurrency & Race Conditions

Design critical operations for:

- double-clicks
- repeated form submissions
- duplicate webhooks
- retries
- multiple browser tabs
- simultaneous requests
- out-of-order events
- partial failures

Use idempotency, transactions, locks, version checks, or atomic operations where appropriate.

### Feature Flags

Use feature flags for:

- staged rollouts
- experimental features
- risky changes
- beta access
- emergency kill switches

Avoid permanent forgotten flags.

### Accessibility

Target WCAG AA where practical.

Require:

- semantic HTML
- keyboard navigation
- clear focus states
- labels
- accessible forms
- sufficient contrast
- meaningful alt text
- reduced-motion support where relevant
- screen-reader-friendly interactive controls

### Responsive Design

Test representative widths for:

- mobile
- tablet
- laptop
- desktop
- wide desktop where relevant

Requirements:

- no accidental horizontal scrolling
- usable touch targets
- readable typography
- responsive tables
- responsive navigation
- responsive modals
- responsive forms
- sensible content density

### SEO

Where applicable:

- metadata
- canonical URLs
- sitemap
- robots.txt
- Open Graph
- social preview images
- structured data
- semantic URLs
- server-rendered indexable content
- Core Web Vitals

### UI State Completeness

Every data-driven feature should intentionally implement:

- loading state
- empty state
- error state
- success state
- disabled state
- permission-denied state where relevant

### Destructive Actions

- Require confirmation for meaningful destructive actions.
- Use soft deletion where recovery/auditing is valuable.
- Use hard deletion where privacy or data lifecycle requires it.
- Protect repeated destructive requests.
- Log high-risk destructive admin actions.

### Testing Priorities

Do not optimize for arbitrary 100% coverage.

Prioritize:

- authentication
- authorization
- payments
- entitlements
- destructive actions
- business rules
- database invariants
- AI validation
- critical email flows
- webhook processing
- account lifecycle

### Seed & Demo Data

- Maintain reproducible development data where useful.
- Never copy sensitive production data into development.
- Provide deterministic seed scripts for complex applications.
- Make demo/test accounts clearly distinguishable.

### Browser Testing

At minimum validate important user flows in:

- Chrome
- Safari

Add Firefox and Edge where the audience or application requirements justify it.

### Build vs Buy

Use established providers for commodity infrastructure when they reduce risk and complexity.

Custom-build what differentiates the product.

Examples typically better bought/managed:

- payments
- email delivery
- authentication
- commodity storage
- observability

### Cost Architecture

For architecture-sensitive products, estimate behavior at representative scale such as:

- 1,000 users
- 10,000 users
- 100,000 users
- 1,000,000 users

Consider:

- Vercel
- database
- bandwidth
- email
- Stripe fees
- AI usage
- storage
- observability
- third-party APIs

### Scaling Thresholds

Define what signals require scaling changes:

- database CPU/connections
- query latency
- serverless invocation volume
- background queue depth
- AI throughput
- real-time connections
- storage
- bandwidth
- cache hit ratio
- API provider quotas

Do not add complex distributed architecture before metrics justify it.

### Vendor Failure Strategy

For every critical provider define expected behavior during outage:

- database
- Stripe
- Resend
- authentication
- AI provider
- storage
- analytics
- external APIs

Use graceful degradation when possible.

### Production Debugging

Use correlation/request IDs where practical so an operation can be followed through:

```text
User Action
   ↓
Frontend
   ↓
API / Server Action
   ↓
Backend Logic
   ↓
Database
   ↓
Third-Party Provider
   ↓
Webhook / Async Processing
```

### Privacy by Default

- Collect only necessary data.
- Avoid logging private content.
- Never log passwords.
- Never log raw authentication tokens.
- Never log payment card data.
- Redact sensitive headers and payload fields.
- Limit internal access to sensitive user data.

### Pre-Launch Security Review

Verify:

- no authentication bypass
- no authorization bypass
- no IDOR/BOLA
- no secrets in client bundles
- no secrets in Git
- no public storage buckets unintentionally exposed
- no unrestricted privileged API endpoints
- no unverified webhooks
- no unsafe redirect logic
- no obvious XSS injection path
- no SQL injection path
- no unrestricted expensive AI endpoint
- no open email abuse endpoint
- admin dashboard protected server-side

### Post-Launch Maintenance

Regularly review:

- Sentry errors
- performance
- slow queries
- failed jobs
- failed webhooks
- Stripe issues
- Resend failures
- dependency updates
- security advisories
- costs
- user feedback
- technical debt
- analytics funnels

---

## AI Development Agent Rules

### Before Implementing

- Inspect the existing architecture.
- Inspect existing code patterns.
- Reuse existing components and utilities.
- Identify affected:
  - frontend
  - backend
  - database
  - authentication
  - authorization
  - email
  - payments
  - infrastructure
  - deployment
- Understand the current schema before modifying data models.
- Understand existing business rules before changing behavior.
- Do not replace working architecture without a clear reason.

### While Implementing

- Make the smallest complete change.
- Avoid unrelated refactoring.
- Do not duplicate functionality.
- Keep business logic centralized.
- Preserve type safety.
- Validate external input.
- Enforce authorization server-side.
- Consider performance.
- Consider failure states.
- Consider race conditions.
- Consider mobile and desktop.
- Follow the existing design system.
- Reuse shared UI.
- Avoid placeholder implementations unless explicitly requested.
- Do not silently leave TODOs for core functionality.
- Do not introduce unnecessary dependencies.

### After Implementing

- run typecheck
- run lint
- run relevant tests
- run production build
- inspect build warnings
- check for regressions
- check responsive behavior
- check authentication boundaries
- check authorization boundaries
- check database migrations
- check environment variables
- check webhook behavior where relevant
- check email rendering where relevant
- check payment state behavior where relevant
- verify GitHub → Vercel deployment remains functional
- summarize exactly what changed
- report remaining risks or intentionally deferred work

---

## Feature Implementation Gate

Before implementing every significant feature, answer:

1. What data is required?
2. Where does that data live?
3. Who owns the data?
4. Who can read it?
5. Who can modify it?
6. What validates it?
7. What business rules apply?
8. What happens if the operation runs twice?
9. What happens if it fails halfway?
10. What happens under concurrent requests?
11. Does it require a transaction?
12. Does it require idempotency?
13. Does it require background processing?
14. Does it require real-time behavior?
15. What should be cached?
16. What must never be cached?
17. What should be logged?
18. What must never be logged?
19. What metrics should be tracked?
20. How will failures be detected?
21. How will this scale?
22. What will this cost at scale?
23. How will it be tested?
24. What permissions are required?
25. What happens if a third-party provider is unavailable?
26. How can the change be rolled back?
27. Does the admin dashboard need visibility or controls for this feature?
28. Does this introduce a new support or operational workflow?
29. Does this require an email or notification?
30. Does this affect analytics or the activation funnel?

---

# Roadmap

## 1. Product & Planning

### Goals

### Target Users

### Problem

### Value Proposition

### Core User Journey

### MVP Scope

### Future Scope

### Non-Goals

### Success Metrics

---

## 2. Requirements & Scope

### Functional Requirements

### Non-Functional Requirements

### User Roles

### User Stories

### Business Rules

### Constraints

### Edge Cases

---

## 3. Architecture

### Architecture Overview

### System Boundaries

### Client Responsibilities

### Server Responsibilities

### Data Flow

### External Services

### Architecture Decisions

### Tradeoffs

---

## 4. Technology Stack

### Frontend

- Next.js

### Backend

### Database

Choose:

- Supabase
- Neon
- Convex

### Authentication

Choose:

- Better Auth
- Clerk

### Email

- Resend

### Payments

- Stripe

### Hosting / Deployment

- Vercel

### Source Control

- GitHub

### Other Services

---

## 5. Project Structure

### Repository Structure

### App Structure

### Shared Components

### Shared Utilities

### Types

### Schemas

### Configuration

### Naming Conventions

---

## 6. UI/UX Design

### Design Direction

### Brand

### Layout

### Navigation

### Responsive Design

### Mobile Experience

### Desktop Experience

### Empty States

### Loading States

### Error States

### Forms

### User Feedback

### UX Rules

---

## 7. Design System

### Colors

### Typography

### Spacing

### Grid

### Border Radius

### Shadows

### Buttons

### Inputs

### Cards

### Modals

### Tables

### Icons

### Components

### Responsive Breakpoints

### Dark Mode

---

## 8. Frontend

### Rendering Strategy

### Server Components

### Client Components

### State Management

### Forms

### Validation

### Data Fetching

### Mutations

### Loading UI

### Error Boundaries

### Optimistic UI

### Responsive Behavior

### Bundle Optimization

---

## 9. Backend

### Backend Responsibilities

### Server Actions

### Route Handlers

### Business Logic

### Service Layer

### Validation

### Error Handling

### Authorization

### Transactions

### Idempotency

---

## 10. API Design

### Internal APIs

### Public APIs

### Endpoints

### Request Schemas

### Response Schemas

### Versioning

### Authentication

### Authorization

### Rate Limits

### Error Format

### Idempotency

---

## 11. Database

### Selected Database

### Why It Was Selected

### Schema

### Indexes

### Constraints

### Relationships

### Transactions

### Query Patterns

### Connection Management

### Migrations

### Backups

### Retention

### Scaling Strategy

---

## 12. Data Modeling

### Entities

### Relationships

### Ownership

### Lifecycle

### Soft Delete vs Hard Delete

### Audit Fields

### Status Models

### Validation Rules

---

## 13. Authentication

### Provider

Choose:

- Better Auth
- Clerk

### Sign-Up

### Sign-In

### Social Login

### Email Verification

### Password Reset

### Session Management

### MFA

### Account Recovery

### Account Deletion

---

## 14. Authorization & Permissions

### Roles

### Permissions

### Ownership Rules

### Server-Side Enforcement

### Admin Access

### Organization / Team Access

### API Permissions

---

## 15. AI / LLM Integration

### AI Features

### Model Providers

### Model Selection

### Structured Output

### Tool Calling

### Context Strategy

### Token Management

### Streaming

### Retries

### Timeouts

### Fallback Models

### Cost Controls

### Safety

### Evaluation

---

## 16. AI Architecture & Prompting

### System Prompts

### Prompt Templates

### Structured Schemas

### Deterministic Logic

### AI-Owned Logic

### Code-Owned Logic

### Validation

### Hallucination Controls

### Prompt Versioning

### Testing

### Evaluation Dataset

---

## 17. File Storage & Media

### Storage Provider

### Upload Flow

### File Limits

### MIME Validation

### Image Processing

### Signed URLs

### Access Control

### Retention

### Deletion

### CDN

---

## 18. Real-Time Features

### Real-Time Requirements

### Provider / Transport

### WebSockets

### Server-Sent Events

### Database Subscriptions

### Presence

### Reconnection

### Ordering

### Consistency

### Scaling

---

## 19. Background Jobs & Queues

### Jobs

### Scheduling

### Queue Provider

### Retries

### Backoff

### Dead-Letter Handling

### Idempotency

### Observability

---

## 20. Search

### Search Requirements

### Database Search

### Full-Text Search

### Semantic Search

### Vector Search

### Indexing

### Ranking

### Filters

### Pagination

---

## 21. Email & Notifications

### Provider

- Resend

### Email Types

### Website-Matched Email Design

Each outgoing email must have:

- responsive HTML
- mobile-friendly layout
- branding matching the website
- reusable shared layout
- website-consistent colors
- website-consistent typography
- website-consistent buttons
- accessible contrast
- clear CTA
- plain-text fallback where appropriate

### Templates

### Welcome Email

### Verification Email

### Password Reset

### Receipt / Payment Email

### Notification Email

### Alert Email

### Account Email

### Administrative Email

### Delivery Handling

### SPF

### DKIM

### DMARC

---

## 22. Payments & Billing

### Provider

- Stripe

### Pricing Model

### Products

### Prices

### Checkout

### Subscriptions

### One-Time Payments

### Trials

### Coupons

### Customer Portal

### Webhooks

### Refunds

### Failed Payments

### Taxes

### Invoices

### Entitlements

### Payment State Machine

---

## 23. Third-Party Integrations

### Integrations

### OAuth

### API Keys

### Webhooks

### Rate Limits

### Retries

### Failure Handling

### Data Sync

---

## 24. Security

### Threat Model

### Authentication Security

### Authorization Security

### Input Validation

### Output Encoding

### XSS

### CSRF

### SQL Injection

### SSRF

### File Upload Security

### Secret Management

### Dependency Security

### Headers

### CSP

### Encryption

### Audit Logging

---

## 25. Privacy & Data Protection

### Data Collected

### Data Purpose

### Data Minimization

### Sensitive Data

### Encryption

### Retention

### Deletion

### Export

### Consent

### Cookies

### Tracking

---

## 26. Legal & Compliance

### Terms of Service

### Privacy Policy

### Cookie Requirements

### GDPR

### CCPA / CPRA

### Industry-Specific Requirements

### Accessibility Requirements

### Record Retention

---

## 27. Validation & Error Handling

### Client Validation

### Server Validation

### Database Validation

### Schema Validation

### Business Rule Validation

### Error Taxonomy

### User-Facing Errors

### Internal Errors

### Retryable Errors

### Logging

---

## 28. Logging

### Structured Logging

### Log Levels

### Request IDs

### User / Session Correlation

### Sensitive Data Redaction

### Retention

---

## 29. Monitoring & Observability

### Error Tracking

### Performance Monitoring

### Uptime Monitoring

### Logs

### Traces

### Metrics

### Alerts

### Dashboards

---

## 30. Analytics

### Product Analytics

### Events

### Funnels

### Conversion

### Retention

### Attribution

### Privacy

### Analytics Schema

---

## 31. Testing

### Unit Tests

### Integration Tests

### API Tests

### Database Tests

### Authentication Tests

### Payment Tests

### Email Tests

### AI Tests

### End-to-End Tests

### Browser Tests

### Mobile Tests

### Regression Tests

---

## 32. Performance

### Performance Budget

### Core Web Vitals

### Server Performance

### Client Performance

### Database Performance

### API Latency

### Image Optimization

### Font Optimization

### Bundle Size

### Network Requests

---

## 33. Caching

### Browser Cache

### CDN Cache

### Vercel Cache

### Next.js Cache

### Database Cache

### API Cache

### Revalidation

### Cache Invalidation

---

## 34. Rate Limiting & Abuse Prevention

### Public Endpoints

### Authentication Endpoints

### AI Endpoints

### Email Endpoints

### Payment Endpoints

### API Limits

### Bot Protection

### Spam Protection

### Abuse Detection

---

## 35. Scalability

### Expected Initial Load

### Expected Growth

### Bottlenecks

### Horizontal Scaling

### Database Scaling

### Connection Scaling

### Background Processing

### Real-Time Scaling

### Storage Scaling

### Cost Scaling

---

## 36. Reliability & Fault Tolerance

### Failure Modes

### Provider Outages

### Database Failures

### API Failures

### Retry Strategy

### Circuit Breaking

### Graceful Degradation

### Idempotency

### Recovery

---

## 37. Backups & Disaster Recovery

### Database Backups

### File Backups

### Backup Frequency

### Retention

### Restore Testing

### Recovery Time Objective

### Recovery Point Objective

---

## 38. Infrastructure

### Vercel

### Database Infrastructure

### Storage

### DNS

### CDN

### Secrets

### Regions

### Infrastructure Configuration

---

## 39. Environments

### Local

### Development

### Preview

### Staging

### Production

### Environment Variables

### Environment Isolation

### Test Data

---

## 40. CI/CD

### GitHub Workflow

Standard deployment flow:

```text
Local Development
      ↓
Git Commit
      ↓
GitHub Push / Pull Request
      ↓
Automated Checks
      ↓
GitHub Repository
      ↓
Vercel Build
      ↓
Vercel Preview Deployment
      ↓
Merge to Production Branch
      ↓
Automatic Vercel Production Deployment
```

### Required Checks

### Linting

### Type Checking

### Tests

### Build Verification

### Migration Safety

### Preview Deployment

### Production Deployment

---

## 41. Deployment

### Platform

- Vercel

### GitHub Integration

- GitHub repository connected directly to Vercel.
- Production branch configured.
- GitHub push/merge automatically starts deployment.
- Preview deployments enabled where useful.
- Production deploys should not depend on a developer running a local deploy command.

### Build Configuration

### Environment Variables

### Domains

### Runtime

### Regions

### Deployment Protection

### Rollback

---

## 42. Domain & DNS

### Domain

### DNS Provider

### Production Domain

### WWW Strategy

### Redirects

### SSL

### Email DNS

### SPF

### DKIM

### DMARC

---

## 43. SEO

### Metadata

### Titles

### Descriptions

### Canonicals

### Open Graph

### Twitter Cards

### Sitemap

### Robots.txt

### Structured Data

### Indexing

### Performance

---

## 44. Accessibility

### Semantic HTML

### Keyboard Navigation

### Focus States

### Screen Readers

### Labels

### ARIA

### Contrast

### Reduced Motion

### Forms

### WCAG Target

---

## 45. Browser & Device Compatibility

### Desktop

### Mobile

### Tablet

### Chrome

### Safari

### Firefox

### Edge

### iOS

### Android

### Responsive Testing

---


## Mandatory Admin Dashboard Baseline

Every web application must include a secure internal admin dashboard unless the project explicitly documents why one is unnecessary.

### Admin Dashboard Requirements

- The admin area must be protected by server-side authorization.
- Knowing or guessing an `/admin` URL must never grant access.
- Admin roles and permissions must be explicit.
- Sensitive admin actions should be auditable.
- High-risk or destructive actions should require confirmation.
- Admin actions must never rely solely on client-side checks.
- Admin pages should be responsive and usable on desktop and mobile.
- Admin data should use pagination, filtering, and search where needed.
- Admin endpoints should be rate-limited where appropriate.
- Admin routes should not expose secrets, raw credentials, or unnecessary personal data.
- Prefer reusable admin tables, filters, metric cards, charts, detail panels, and action components.
- Admin pages should expose operationally useful data rather than raw database dumps.
- Every admin dashboard should provide clear loading, empty, error, and permission-denied states.
- Important actions should record who performed them, when, and what changed.
- Production-only actions must be clearly separated from test/development behavior.

### Default Admin Navigation

Use this baseline information architecture and adapt labels only when the project genuinely requires it.

#### Control Center

Default route:

`/admin`

Purpose:

- top-level operational overview
- key KPIs
- active users
- new users
- conversion
- revenue
- subscriptions
- recent system incidents
- support workload
- email status
- recent admin activity
- alerts requiring attention
- quick links to critical admin functions

#### Users & Accounts

Default route:

`/admin/users`

Purpose:

- search users
- inspect user profile/account state
- view account creation date
- authentication state
- plan/subscription
- usage
- roles
- organization/team membership
- account flags
- recent activity
- administrative notes
- account-level actions

#### Account Lifecycle

Default route:

`/admin/lifecycle`

Purpose:

- signups
- verification
- activation
- dormant users
- churn
- cancellations
- account deletion
- suspended/disabled users
- trial lifecycle
- lifecycle cohorts
- reactivation

#### System & Ingest Health

Default route:

`/admin/system`

Purpose:

- application health
- API health
- database health
- queue/background job health
- webhook health
- event ingest health
- email provider status
- Stripe integration status
- AI provider health
- recent errors
- failed jobs
- latency
- throughput
- retries
- deployment/version information
- service incidents

#### Revenue & Subscriptions

Default route:

`/admin/revenue`

Purpose:

- MRR
- ARR
- revenue
- active subscriptions
- trials
- upgrades
- downgrades
- cancellations
- failed payments
- refunds
- chargebacks/disputes
- churn
- ARPU
- LTV where relevant
- Stripe reconciliation
- plan distribution

#### Affiliates & Payouts

Default route:

`/admin/affiliates`

Purpose:

- affiliates
- referrals
- referral attribution
- conversions
- commissions
- pending payouts
- paid payouts
- payout failures
- fraud/abuse review
- affiliate status
- affiliate performance

If the project does not have an affiliate program yet, keep this section disabled or hidden behind a feature flag rather than deleting the architecture.

#### Activation Funnel

Default route:

`/admin/funnel`

Purpose:

- landing
- signup
- verification
- onboarding
- first key action
- activation
- conversion
- purchase
- retention milestones
- funnel drop-off
- segment comparison
- experiment comparison

#### Broadcasts & Flags

Default route:

`/admin/broadcasts`

Purpose:

- product announcements
- in-app notices
- banners
- maintenance messages
- user-targeted messages
- feature flags
- staged rollouts
- emergency kill switches
- audience targeting
- start/end scheduling

#### Site Mode & Waitlist

Default route:

`/admin/site-mode`

Purpose:

- normal mode
- maintenance mode
- invite-only mode
- waitlist mode
- closed registration
- beta access
- access codes
- launch gating
- global site notices

Site mode changes must be auditable and safe to reverse.

#### Billing Mode

Default route:

`/admin/billing-mode`

Purpose:

- billing enabled/disabled
- free mode
- test billing mode
- launch pricing mode
- grandfathering
- promotional pricing
- plan availability
- checkout availability
- billing emergency controls

Billing mode controls must never alter Stripe state unsafely or bypass entitlement logic.

#### Support Tickets

Default route:

`/admin/support-tickets`

Purpose:

- incoming tickets
- ticket status
- priority
- assigned admin
- user/account context
- conversation history
- internal notes
- issue category
- resolution
- response tracking
- escalation
- search/filtering

#### Send Email

Default route:

`/admin/send-email`

Purpose:

- send approved transactional or administrative emails
- select recipient/user
- select template
- preview email
- render responsive template
- send test
- send final email
- record delivery attempt
- record sender/admin
- avoid unrestricted arbitrary bulk sending unless explicitly supported

All sent emails must use the project's branded Resend email design system.

#### Email Tests

Default route:

`/admin/email-tests`

Purpose:

- preview every email template
- send test emails
- validate responsive rendering
- inspect template variables
- test dark/light email environments where relevant
- detect missing variables
- verify links
- verify sender configuration
- verify Resend integration
- confirm SPF/DKIM/DMARC readiness

#### Ad Playbook

Default route:

`/admin/marketing`

Purpose:

- campaign plans
- acquisition channels
- ad concepts
- creative variants
- landing page mapping
- campaign links/UTMs
- target audience
- campaign status
- budget notes
- performance metrics
- experiments
- winning/losing creatives
- reusable marketing learnings

### Optional Additional Admin Modules

Add when relevant:

- `/admin/audit-log`
- `/admin/roles`
- `/admin/organizations`
- `/admin/content`
- `/admin/feature-flags`
- `/admin/integrations`
- `/admin/webhooks`
- `/admin/jobs`
- `/admin/ai-usage`
- `/admin/storage`
- `/admin/security`
- `/admin/api-usage`
- `/admin/experiments`
- `/admin/feedback`
- `/admin/changelog`
- `/admin/settings`

---

## 46. Admin Dashboard & Internal Tools

> Mandatory baseline: every project should implement the secure admin dashboard defined in **Mandatory Admin Dashboard Baseline** above and adapt it to the project's actual features.

### Admin Roles

### User Management

### Content Management

### Support Tools

### Audit Logs

### Feature Controls

### System Health

### Manual Overrides

---

## 47. Feature Flags & Configuration

### Feature Flags

### Runtime Configuration

### Environment Configuration

### Experiments

### Rollouts

### Kill Switches

---

## 48. Documentation

### README

### Local Setup

### Architecture

### Database

### API

### Authentication

### Deployment

### Environment Variables

### Third-Party Services

### Operational Runbook

---

## 49. Development Workflow

### GitHub Repository

### Branch Strategy

### Commit Strategy

### Pull Requests

### Code Review

### AI-Assisted Development Rules

### Definition of Done

### Release Workflow

---

## 50. Production Readiness

### Build Passes

### Type Check Passes

### Lint Passes

### Tests Pass

### Security Review

### Authentication Review

### Authorization Review

### Payment Review

### Email Review

### Database Review

### Performance Review

### Responsive Review

### Accessibility Review

### Monitoring Enabled

### Backups Enabled

### Domains Verified

### Environment Variables Verified

---

## 51. Launch

### Launch Checklist

### Production Deployment

### Domain

### Analytics

### Monitoring

### Error Tracking

### Payments

### Emails

### Support

### Announcement

---

## 52. Post-Launch Operations

### Monitoring

### Error Review

### User Feedback

### Support

### Bug Triage

### Performance Review

### Cost Review

### Security Review

---

## 53. Cost Optimization

### Vercel Costs

### Database Costs

### AI Costs

### Resend Costs

### Stripe Costs

### Storage Costs

### Third-Party API Costs

### Cost Alerts

### Cost per User

### Cost per Request

---

## 54. Scaling Strategy

### Scaling Triggers

### Application Scaling

### Database Scaling

### Queue Scaling

### Real-Time Scaling

### Storage Scaling

### Geographic Scaling

### Cost Controls

---

## 55. Maintenance & Technical Debt

### Dependency Updates

### Security Updates

### Database Maintenance

### Refactoring

### Deprecated APIs

### Dead Code

### Test Maintenance

### Documentation Maintenance

### Technical Debt Register

---

## 56. Growth & Product Iteration

### Feedback

### Analytics

### Experiments

### Conversion Improvements

### Retention Improvements

### New Features

### Pricing Iteration

### Growth Channels

### Roadmap Updates

---

# Project Decisions Log

Record important project decisions here.

| Date | Area | Decision | Reason | Alternatives Considered |
|---|---|---|---|---|

---

# Open Questions

-

---

# Current Priorities

-

---

# Deferred Items

-

---

# Completed Items

-

---

# Advanced Production Engineering Standards

## API Contracts & Backward Compatibility
- Treat shared APIs as stable contracts.
- Prefer additive changes; version incompatible changes.
- Document deprecations and migration paths.
- Keep old/new app versions compatible during deployments.
- Validate important request and response schemas.

## Zero-Downtime Database Migrations
Use: **Expand → deploy compatible code → backfill → switch reads/writes → verify → contract**.
- Make backfills resumable and observable.
- Avoid removing/renaming fields in the same deployment that introduces replacements.
- Prefer forward fixes when database rollback is unsafe.

## Data Integrity Invariants
Document what must always be true for each important domain model.
Enforce invariants using the strongest appropriate layer: database constraints, transactions, server business rules, schemas, and authorization.

## State Machines
Use explicit states and valid transitions for subscriptions, orders, payouts, tickets, documents, onboarding, verification, jobs, approvals, and account lifecycle. Avoid scattered booleans for meaningful workflows.

## Money Representation
- Never use floating point for authoritative money.
- Prefer integer minor units such as cents or appropriate fixed decimals.
- Always associate amounts with currency.
- Define rounding explicitly.
- Never trust client-provided authoritative prices/totals.

## Time, Dates & Timezones
- Store authoritative timestamps in UTC unless the domain requires otherwise.
- Convert at presentation boundaries.
- Use server-authoritative time for security, billing, and entitlements.
- Handle DST, expiration, deadlines, and timezone semantics explicitly.

## Pagination Standard
- Paginate every potentially unbounded dataset.
- Prefer cursor pagination for large/changing datasets.
- Use deterministic ordering and supporting indexes.
- Never fetch an entire growing table merely to render one page.

## File Upload Pipeline
Validate authorization, size, MIME/signature, filenames/storage keys, ownership, access, retention, deletion, and abandoned uploads. Use signed access where appropriate and consider malware scanning for risky file categories.

## Standard Webhook Framework
Use: **receive → verify → validate → deduplicate → persist receipt if needed → acknowledge quickly → process → retry → audit**.
Assume duplicates and out-of-order delivery. Make handlers idempotent and expose failures in admin.

## Background Jobs
Move slow, retryable, expensive, batch, scheduled, or provider-dependent work out of request paths. Define payload schema, idempotency, retries, backoff, timeout, failure/dead-letter behavior, cancellation, monitoring, and admin visibility.

## Scheduled Jobs / Cron
Define schedule, timezone, owner, idempotency, overlapping-run behavior, missed-run behavior, retries, alerts, manual reruns, and admin visibility.

## Notification Architecture
Prefer **domain event → notification decision → preferences → channel delivery** instead of feature code directly calling Resend everywhere. Support retry/deduplication and delivery state where useful.

## Notification Preferences
Distinguish required transactional/security/account messages from optional product/marketing messages. Implement preferences and unsubscribe behavior where applicable.

## Search Architecture
Choose deliberately between database filtering, PostgreSQL full-text search, external search, and vector search. Define ranking, indexing, filters, permissions, tenant isolation, freshness, and pagination.

## Import & Export
Support safe CSV/JSON/user/admin exports where relevant. Large exports should be asynchronous. Validate imports and report partial failures.

## Localization / Internationalization
Keep domain logic independent of display language. Use locale-aware dates, numbers, currency, and timezone handling. Avoid architectures that make future translation unnecessarily difficult.

## URL & Identifier Strategy
Define internal IDs, public IDs, slugs, canonical URLs, rename/redirect behavior, and enumeration resistance. Durable URLs should remain stable.

## Media Lifecycle
Define originals, variants, thumbnails, optimization, CDN behavior, access control, cache invalidation, orphan cleanup, retention, and deletion.

## Canonical Schema Ownership
Maintain one canonical definition for important domain concepts. Avoid incompatible frontend/backend/API/database/AI/admin representations.

## Soft Delete & Uniqueness
Define whether deleted records reserve unique values, restoration behavior, relationship behavior, and how normal queries exclude deleted data.

## Multi-Tenancy
Treat tenant/workspace/org identity as a security boundary. Scope records, queries, caches, jobs, webhooks, and indexes appropriately. Test cross-tenant isolation.

## Admin Impersonation
If supported, require authorization, persistent visible indication, start/end audit logs, immediate exit, and restrictions on high-risk actions where appropriate.

## Admin Action Safety Levels
Classify actions as normal, sensitive, or destructive/critical. Increase confirmation, audit, reauthentication, or dual-control requirements with risk.

## Support Privacy
Use least privilege. Redact sensitive data, separate internal notes from user communication, define support permissions, and audit sensitive access where appropriate.

## Abuse & Fraud
Consider signup abuse, credential stuffing, free/trial abuse, affiliate/referral fraud, payment fraud, email abuse, scraping, bots, AI-credit abuse, API abuse, and upload abuse.

## Data Provenance
For important researched/imported/AI/legal data, track source/reference, retrieval date, provider/version, transformation, actor, and review status where useful.

## AI Prompt Injection Defense
Treat user/retrieved content as untrusted data. Separate trusted instructions, restrict tools, validate arguments/output, enforce authorization outside the model, minimize secrets, and require deterministic gates for high-risk actions.

## AI Data Boundaries
For each model provider define what user data may be sent, prohibited data, retention/data-use settings, region requirements, redaction, logging, and consent where applicable.

## AI Reproducibility
For important outputs record provider, model, prompt/template version, schema version, application version, parameters, timestamp, and source references where useful.

## AI Evaluation Before Deployment
Maintain golden evaluation cases. Before major model/prompt changes compare correctness, schema validity, latency, cost, regressions, and adversarial/prompt-injection behavior.

## AI Fallback UX
Define behavior for slow, unavailable, rate-limited, invalid, partial, and over-capacity AI responses. Preserve non-AI functionality where possible.

## Entitlements Architecture
Use **billing provider → billing state → entitlements → feature access**.
Do not scatter Stripe plan-name checks through UI code. Enforce entitlements server-side and support trials, grace periods, grandfathering, and provider delays.

## Usage Metering
Authoritatively meter AI usage, API requests, storage, seats, documents, messages, bandwidth, or other billable units. Metering must be idempotent, auditable, queryable, and resistant to client manipulation.

## Plan Limits
Define limits centrally, enforce server-side, prevent race-condition bypasses, and define resets, upgrades, and overages.

## Tax, Invoice & Accounting Lifecycle
Where relevant define tax responsibility, Stripe Tax, invoices, receipts, refunds, credit notes, payouts, accounting exports, and reconciliation.

## Reconciliation Jobs
Periodically compare local state with authoritative providers such as Stripe where drift matters. Surface mismatches in admin with traceability.

## Deployment Compatibility Window
Assume multiple app versions may briefly run simultaneously. Schema, APIs, and jobs must tolerate transitional versions.

## Rollback vs Roll-Forward
Before deployment determine code rollback safety, schema rollback safety, irreversible migrations, roll-forward options, and feature-flag/kill-switch fallback.

## Dependency Outage Matrix

| Provider | Failure Impact | User Experience | Retry/Fallback | Admin Signal |
|---|---|---|---|---|
| Database | | | | |
| Authentication | | | | |
| Stripe | | | | |
| Resend | | | | |
| AI Provider | | | | |
| Storage | | | | |
| Analytics | | | | |
| Other APIs | | | | |

## SLOs & SLIs
Where warranted define uptime, success rate, p95/p99 latency, job completion time, webhook delay, email dispatch delay, and AI success targets. Alert on user impact.

## Incident Response
Use: **detect → assess severity → contain → communicate → mitigate → recover → verify → postmortem → prevent recurrence**. Maintain an incident log.

## Security Incident Procedure
Prepare procedures for leaked keys, compromised admins, exposed databases/storage, unauthorized production access, webhook/OAuth compromise, and dependency compromise: revoke, rotate, contain, investigate, audit, notify, recover, document.

## Secret Rotation
Document rotation for GitHub, Vercel, DB, Stripe, Resend, Better Auth/Clerk, AI providers, storage, OAuth, monitoring, analytics, and webhook secrets.

## Production Access Policy
Define who can access GitHub production settings, Vercel, DB, Stripe, Resend, auth, logs, storage, DNS, analytics, and secrets. Apply least privilege and MFA.

## Backup Restore Drills
A backup is not proven until restored. Periodically test restoration, application compatibility, credentials, and encryption requirements.

## Domain & Email Health
Monitor DNS, SSL, domain expiration, SPF, DKIM, DMARC, bounce/complaint rates, sending reputation, and critical redirects where practical.

## Robots & AI Crawler Policy
Explicitly decide crawler access to public/private/generated content and APIs. `robots.txt` is never a security boundary.

## Legal Document Versioning & Consent History
When acceptance matters, version Terms, Privacy Policy, consent language, subscription terms, and other policies. Record user, version, timestamp, interface/source, and withdrawal where required.

## Automated Accessibility Testing
Add automated accessibility checks for important UI flows while retaining manual keyboard/screen-reader testing where warranted.

## Visual Regression Testing
For stable/high-value UI, capture key screens/components across responsive states and review unexpected visual changes.

## Post-Deployment Smoke Tests
After production deploy verify homepage, critical public route, auth entry, DB connectivity, primary API/server action, payment entry where relevant, admin health, and the core product workflow.

## Synthetic Monitoring
For important apps, periodically test real user journeys such as **visit → sign in → perform core action → verify result**, not only `/health`.

## Operational Kill Switches
Where relevant provide authorized, audited, reversible independent controls for signup, login methods, payments, checkout, AI, email, uploads, webhooks, jobs, affiliates, public APIs, and expensive features.

## Configuration vs Code
Operational settings that need safe runtime changes may belong in controlled configuration/admin: site mode, billing mode, waitlist, limits, rollout percentages, announcements, and feature availability. Do not make security-critical behavior casually editable.

## Feature Ownership Map

| Surface | Required? | Notes |
|---|---|---|
| User UI | | |
| Backend | | |
| Database | | |
| Authorization | | |
| Validation | | |
| Analytics | | |
| Admin Dashboard | | |
| Audit Log | | |
| Monitoring | | |
| Email / Notifications | | |
| Billing / Entitlements | | |
| Background Jobs | | |
| Tests | | |
| Documentation | | |
| Deployment | | |
| Rollback | | |

## Definition of Done
A feature is not complete merely because its happy path works. Address all relevant UI, backend, database, auth, validation, security, failure, concurrency, analytics, admin, audit, monitoring, notifications, billing, responsive, accessibility, testing, documentation, deployment, and rollback concerns.

## Mandatory Non-Happy-Path Review
For every significant feature explicitly consider:

- happy path
- empty state
- loading state
- invalid input
- unauthenticated user
- unauthorized/forbidden user
- not found
- duplicate request
- concurrent request
- partial failure
- provider failure
- timeout
- retry
- offline/poor network where relevant
- mobile
- accessibility
- analytics
- admin visibility
- audit logging
- monitoring
- security
- privacy
- cost
- scale
- tests

## Operational Surface Completeness
For every significant feature determine whether it needs:

- user UI
- backend
- database
- authorization
- validation
- analytics
- admin controls/visibility
- audit log
- monitoring
- error handling
- email/notifications
- billing/entitlements
- background jobs
- tests
- documentation
- deployment handling
- rollback/fallback

## Final AI Agent Rule
**Never implement only the happy path. Never call a feature complete until its relevant operational surface is complete.**

---

# Developer Documentation Standard

## `DEVELOPER_HANDBOOK.md`

Every project must include a root-level `DEVELOPER_HANDBOOK.md`.

The handbook is the practical operating manual for developers and AI coding agents working on the repository. It must stay synchronized with the actual project.

At minimum it must document:

- project purpose
- architecture summary
- technology stack
- repository/folder structure
- local prerequisites
- first-time setup
- environment variables and where they come from
- local development workflow
- web development workflow
- mobile development workflow when applicable
- database workflow
- authentication setup
- Stripe setup
- Resend/email setup
- AI provider setup when applicable
- testing workflow
- GitHub workflow
- Vercel deployment workflow
- mobile build/run workflow
- production deployment/release workflow
- troubleshooting
- common development tasks
- local scripts
- important external dashboards/services
- operational warnings
- known project-specific constraints

Do not let the handbook become a historical changelog. It should describe how the project works **now**.

When architecture, scripts, environment variables, deployment, or developer workflows change, update `DEVELOPER_HANDBOOK.md` in the same change.

## Local Scripts Documentation

Every executable local project script must be listed in `DEVELOPER_HANDBOOK.md`.

Use a compact table:

| Command | Purpose |
|---|---|
| `pnpm dev` | Starts the local Next.js development server. |
| `pnpm build` | Creates a production Next.js build and catches production-only build failures. |
| `pnpm start` | Runs the previously built Next.js application locally in production mode. |
| `pnpm lint` | Runs the project's lint rules and reports code-quality problems. |
| `pnpm typecheck` | Runs TypeScript type checking without producing build output. |
| `pnpm test` | Runs the project's automated test suite. |
| `pnpm test:watch` | Runs relevant tests continuously while files change. |
| `pnpm test:e2e` | Runs end-to-end tests against the application. |
| `pnpm db:migrate` | Applies pending database migrations to the configured database. |
| `pnpm db:generate` | Generates database migration/schema artifacts when the selected database tooling requires it. |
| `pnpm db:seed` | Populates the development database with reproducible seed data. |
| `pnpm db:reset` | Resets only the approved local/development database and recreates development data. |
| `pnpm email:preview` | Opens or runs the local preview environment for branded application emails. |
| `pnpm check` | Runs the standard local quality gate such as lint, typecheck, and tests. |

These are examples, not commands to invent blindly. The handbook must list the commands that **actually exist in that repository**.

Rules:

- Every command gets a one-line explanation.
- Remove documentation for scripts that no longer exist.
- Document destructive scripts clearly.
- Destructive scripts must refuse to target production unless explicitly and safely designed for production.
- If a command requires environment variables, services, simulators, or other prerequisites, mention that immediately below the table or in the relevant workflow section.
- Prefer memorable, consistent script names across projects.
- AI agents adding or changing scripts must update the handbook.

## Root Documentation

Recommended root documentation:

```text
README.md
DEVELOPER_HANDBOOK.md
.env.example
```

`README.md` should remain the concise project introduction and quick start.

`DEVELOPER_HANDBOOK.md` should contain the detailed developer/AI-agent operating instructions.

---

# Web + Native Mobile Application Standard

Some projects include both a Next.js web application and native mobile applications.

## Mobile Technology Baseline

When a project includes mobile:

- **React Native**
- **No Expo**
- **iOS development/building through Xcode**
- Native iOS project files must remain first-class parts of the repository.
- Use React Native's native tooling rather than introducing Expo unless a future project explicitly overrides this standard.
- Native modules may be integrated when the product requires platform capabilities unavailable through shared JavaScript alone.
- Keep native code narrow where React Native can safely own the feature.
- Do not force cross-platform abstraction when it harms native UX, reliability, or performance.

## Repository Strategy

Prefer a monorepo when web and mobile belong to the same product and can safely share domain logic, schemas, API clients, types, or design tokens.

Recommended structure:

```text
project/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── styles/
│   │   └── package.json
│   │
│   └── mobile/
│       ├── ios/
│       │   ├── ProjectName.xcodeproj/
│       │   ├── ProjectName.xcworkspace/
│       │   └── ProjectName/
│       ├── android/
│       ├── src/
│       │   ├── components/
│       │   ├── screens/
│       │   ├── navigation/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── store/
│       │   ├── lib/
│       │   ├── types/
│       │   ├── utils/
│       │   └── assets/
│       ├── index.js
│       └── package.json
│
├── packages/
│   ├── shared/
│   ├── schemas/
│   ├── api-client/
│   ├── config/
│   └── design-tokens/
│
├── docs/
├── scripts/
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── DEVELOPER_HANDBOOK.md
└── .env.example
```

Adapt the structure to the actual project rather than creating empty packages with no purpose.

## Folder Ownership

### `apps/web`

Owns:

- Next.js routes
- server-rendered web UI
- browser-specific components
- web SEO
- web middleware
- Vercel-specific web configuration
- web-only server actions/route handlers where appropriate

### `apps/mobile`

Owns:

- React Native application
- mobile screens
- mobile navigation
- mobile-specific state
- mobile permissions
- push-notification integration
- deep links
- mobile storage
- native bridges
- iOS/Android platform behavior

### `apps/mobile/ios`

Owns the actual Xcode project and iOS-native configuration, including where applicable:

- Xcode project/workspace
- signing
- capabilities
- entitlements
- Info.plist configuration
- native Swift/Objective-C integration
- AppDelegate/native initialization
- notification capabilities
- associated domains
- URL schemes
- native frameworks
- build configurations

Do not treat `ios/` as generated disposable output.

### `apps/mobile/android`

Keep the React Native Android native project when Android is supported or expected.

If a product is deliberately iOS-only, document that decision rather than pretending Android is supported.

### `packages/shared`

May contain platform-independent:

- business logic
- constants
- utilities
- domain types

Do not put Node-only, browser-only, or native-only code into shared packages without explicit boundaries.

### `packages/schemas`

May contain shared runtime schemas such as:

- API contracts
- validation schemas
- domain schemas

### `packages/api-client`

May contain typed API communication shared by web/mobile where appropriate.

Authentication/session transport can differ between platforms even when API contracts are shared.

### `packages/design-tokens`

May contain genuinely reusable:

- color values
- spacing
- typography definitions
- radius values
- semantic design tokens

Do not attempt to share DOM/CSS components directly with React Native merely for theoretical reuse.

## Sharing Rule

**Share logic and contracts aggressively; share UI only when it genuinely improves the product.**

Good sharing candidates:

- TypeScript domain types
- Zod schemas
- business rules
- calculations
- API contracts
- API client logic
- constants
- feature definitions
- entitlement rules
- analytics event names
- design tokens

Usually platform-specific:

- Next.js UI
- React Native UI
- navigation
- browser APIs
- native APIs
- storage adapters
- authentication persistence
- push notifications
- deep linking
- platform permissions

## Backend Strategy for Web + Mobile

Prefer one authoritative backend/data model serving both web and mobile when practical.

```text
Next.js Web ──────┐
                  │
                  ▼
            Backend / API
                  │
                  ▼
              Database
                  ▲
                  │
React Native ─────┘
```

Do not duplicate business rules separately in the web and mobile clients.

Server-side authorization remains authoritative for both.

## Authentication on Mobile

When using Better Auth or Clerk:

- verify official React Native/native compatibility before selecting implementation details
- use secure native credential/token storage
- do not store sensitive tokens in plain AsyncStorage
- handle token/session expiration
- handle logout/revocation
- handle deep-link/OAuth callbacks safely
- enforce authorization on the server regardless of mobile state

## Mobile Secure Storage

Sensitive mobile credentials should use appropriate platform-secure storage such as the iOS Keychain rather than plain local application storage.

## Mobile Navigation

Define:

- authentication flow
- onboarding flow
- main application flow
- modal flow
- deep-link mapping
- notification navigation
- logged-out redirects
- invalid/deleted resource behavior

## Deep Linking

Where relevant configure:

- custom URL schemes
- Universal Links on iOS
- associated domains
- authenticated deep-link handling
- fallback behavior

Test links when:

- app is closed
- app is backgrounded
- app is foregrounded
- user is logged out
- destination no longer exists

## Push Notifications

When the product uses push notifications:

- request permission at an appropriate contextual moment
- register device tokens securely
- associate tokens with the correct user/device
- handle token rotation
- remove invalid tokens
- support notification preferences
- define notification payload schema
- handle foreground/background/terminated states
- deep-link notifications safely
- never trust notification payloads as authorization

## Mobile Permissions

Request only permissions required by actual functionality.

For every permission define:

- why it is needed
- when it is requested
- denial behavior
- restricted behavior
- settings recovery path
- privacy disclosure

Avoid requesting permissions immediately at launch unless necessary.

## Native iOS / Xcode Standard

The iOS project must document:

- supported iOS deployment target
- Xcode version
- React Native version
- bundle identifier
- development team/signing strategy
- build configurations
- schemes
- capabilities
- entitlements
- required native dependencies
- CocoaPods/SPM usage if applicable
- simulator workflow
- physical-device workflow
- archive workflow
- release workflow

## Xcode Build Configurations

Prefer explicit separation such as:

- Debug
- Release

Add staging configurations/schemes only when the project benefits from them.

Environment-specific backend/API configuration must not require manually editing source files before each build.

## Mobile Environment Configuration

Document:

- development API URL
- staging API URL if used
- production API URL
- public client configuration
- native secrets policy
- build configuration mapping

Never bundle server secrets into the mobile application.

Assume anything shipped inside the mobile binary can ultimately be inspected by users.

## React Native Performance

Consider:

- unnecessary re-renders
- large lists and virtualization
- image size/caching
- navigation performance
- JS thread blocking
- native bridge/module cost
- startup time
- memory usage
- network request duplication
- offline/poor-network behavior

Profile before introducing complex optimization.

## Mobile Offline / Poor Network Behavior

For every core flow determine:

- what happens offline
- what happens on slow connections
- whether cached data is shown
- whether writes queue
- whether retries are safe
- how stale data is indicated
- what happens after connectivity returns

Do not silently claim success for a write that has not reached the authoritative backend.

## Mobile Error Handling

Handle:

- API timeout
- offline
- expired session
- permission denied
- native capability unavailable
- invalid deep link
- push registration failure
- server maintenance
- outdated app version
- partial sync failure

## Mobile Analytics

Use the same canonical event taxonomy as web where events represent the same business action.

Include platform/context properties rather than inventing incompatible event names unnecessarily.

## Mobile Crash Reporting

Production mobile apps should include crash/error reporting appropriate to the project.

Separate:

- JavaScript errors
- native crashes
- handled operational errors

Do not collect sensitive user data unnecessarily.

## Mobile Testing

Where appropriate include:

- shared business-logic tests
- React Native component tests
- navigation tests
- API integration tests
- authentication tests
- deep-link tests
- notification tests
- native module tests
- iOS simulator testing
- physical-device testing
- release-build testing

Critical flows should be tested on an actual device before release.

## Mobile Accessibility

Include:

- accessibility labels
- appropriate roles/traits
- Dynamic Type/text scaling
- VoiceOver testing
- sufficient touch targets
- contrast
- reduced-motion considerations
- keyboard support where applicable

## Mobile App Versioning

Define:

- marketing version
- build number
- release tagging
- minimum supported version
- backend compatibility
- forced/required update policy
- optional update policy

The backend must tolerate supported older app versions.

## Mobile API Compatibility

Unlike web, users do not all update immediately.

Therefore:

- never assume the newest mobile version is universal
- maintain API compatibility with supported versions
- version breaking APIs
- track app versions in analytics/admin where useful
- define minimum supported app version
- provide graceful outdated-version UX

## Mobile Release Workflow

Recommended iOS release flow:

```text
Feature Development
       ↓
Local React Native Testing
       ↓
Xcode Simulator
       ↓
Physical Device
       ↓
GitHub Push / PR
       ↓
Automated Checks
       ↓
Merge
       ↓
Release Candidate
       ↓
Xcode Archive
       ↓
App Store Connect
       ↓
TestFlight
       ↓
Production Review / Release
```

Vercel deploys the web/backend portions from GitHub automatically; native iOS binaries follow the Xcode/App Store release process.

## App Store Readiness

Before iOS submission verify:

- app name
- bundle ID
- version/build
- signing
- icons
- launch experience
- privacy manifest/disclosures where required
- permission descriptions
- screenshots
- metadata
- support URL
- privacy policy
- account deletion where required
- subscription/IAP disclosures where applicable
- review credentials/instructions if needed
- production backend configuration
- crash-free release build

## Mobile Admin Visibility

When a project has mobile clients, the web admin dashboard should add relevant operational information where useful:

- platform
- app version
- build number
- device registration
- push token status
- notification delivery
- last mobile activity
- minimum-supported-version compliance
- crash/error trends
- mobile activation funnel
- mobile subscription state where relevant

Do not expose unnecessary device identifiers or private device data.

## Web + Mobile Definition of Done

A cross-platform feature is not complete until relevant behavior has been considered independently for:

- web
- mobile
- backend
- database
- authentication
- authorization
- API compatibility
- offline/poor network
- responsive/mobile-native UX
- analytics
- admin visibility
- notifications
- tests
- deployment/release
- old supported app versions

---

# Recommended Repository Documentation Structure

For larger projects:

```text
docs/
├── architecture/
├── database/
├── api/
├── auth/
├── payments/
├── email/
├── mobile/
├── operations/
├── security/
└── decisions/
```

Keep `DEVELOPER_HANDBOOK.md` as the primary entry point and link to deeper documentation instead of turning it into an unreadable dump.

Architecture decisions with long-term impact may be recorded as ADRs under:

```text
docs/decisions/
```

Each ADR should briefly state:

- context
- decision
- alternatives considered
- consequences


---

# Mandatory Dockerized Database Testing

## Core Rule

**Automated and local database tests must never run against the actual production database or a developer's normal live/shared database.**

Database tests must use an isolated, disposable, Dockerized test database whenever the selected database technology supports a compatible local containerized database.

The test database must be safe to:

- migrate
- seed
- truncate
- reset
- corrupt intentionally
- recreate
- destroy

without affecting real application data.

## Required Database Separation

Keep these concepts separate:

```text
Production Database
        ↑
   NEVER TEST HERE

Preview / Staging Database
        ↑
Integration environment only when explicitly required

Local Development Database
        ↑
Normal developer work

Dockerized Test Database
        ↑
Automated DB / integration tests
```

Tests must not silently fall back to development, preview, staging, or production when the test database is unavailable.

**Fail closed:** if the Dockerized test database is not available or its configuration cannot be proven safe, database tests must stop rather than connect elsewhere.

## Test Database Safety Guard

Before any test suite performs destructive database operations, verify safeguards such as:

- `NODE_ENV=test`
- explicit test database configuration
- expected test host
- expected test database name
- no production hostname
- no production database identifier
- no production credentials
- no shared production connection string

Add hard runtime guards around destructive test/reset/seed commands.

A command such as `db:test:reset` must refuse to execute when the connection does not clearly identify an approved test environment.

## Docker Compose

Where practical, provide a dedicated Docker Compose configuration for database testing.

Example repository structure:

```text
project/
├── docker/
│   └── test/
│       └── docker-compose.yml
├── scripts/
│   ├── test-db-start.*
│   ├── test-db-reset.*
│   └── test-db-stop.*
├── .env.test.example
├── DEVELOPER_HANDBOOK.md
└── package.json
```

The exact structure may be simplified when the project is small.

## Recommended Local Test Workflow

```text
Start Docker test database
        ↓
Wait for database readiness
        ↓
Apply migrations
        ↓
Seed deterministic test fixtures
        ↓
Run database/integration tests
        ↓
Reset or destroy test database
        ↓
Stop container when appropriate
```

## Local Script Standard

When the project has database tests, expose clear scripts where appropriate.

Example:

| Command | Purpose |
|---|---|
| `pnpm db:test:start` | Starts the isolated Dockerized database used only by automated/local database tests. |
| `pnpm db:test:stop` | Stops the Dockerized test database without touching development or production databases. |
| `pnpm db:test:reset` | Recreates the isolated test database, applies migrations, and restores deterministic test fixtures. |
| `pnpm db:test:migrate` | Applies the application's migrations to the isolated Dockerized test database. |
| `pnpm test:db` | Runs database-focused tests against the isolated Dockerized test database. |
| `pnpm test:integration` | Runs backend integration tests against isolated test infrastructure, including the Dockerized database. |

Only document scripts that actually exist in the project.

Every actual script must also appear in `DEVELOPER_HANDBOOK.md` with its one-line explanation.

## Test Data

Test fixtures must be:

- deterministic
- synthetic
- reproducible
- safe to delete
- independent of real users

Never copy sensitive production data into the Dockerized test database merely to make tests realistic.

If production-shaped data is required, generate synthetic fixtures with equivalent structure.

## Test Isolation

Tests should not depend on execution order.

Use one or more appropriate strategies:

- transaction rollback per test
- truncation between tests
- schema/database recreation
- isolated test identifiers
- worker-specific databases/schemas for parallel tests

Parallel test execution must not cause tests to modify each other's state.

## Migration Testing

The Dockerized database must be used to verify migrations.

At minimum test:

```text
Empty database
      ↓
Run all migrations
      ↓
Current schema
      ↓
Run application/database tests
```

For risky migrations also test representative upgrade paths from the previous schema.

## Database Constraints Testing

Test important database-level invariants directly, including where relevant:

- unique constraints
- foreign keys
- required fields
- cascade behavior
- delete restrictions
- transaction behavior
- tenant isolation
- indexes/query behavior
- idempotency constraints
- state invariants

## CI Database Testing

GitHub CI should start an isolated database service/container for database/integration tests when supported.

CI must:

1. start the test database
2. wait for readiness
3. apply migrations
4. load deterministic fixtures if required
5. run tests
6. destroy the environment after the job

CI must not require access to the production database to validate application code.

## Database Provider Notes

### Neon

Because Neon is PostgreSQL, use a local Dockerized PostgreSQL instance for normal database/integration testing when application behavior can be reproduced with standard PostgreSQL.

Provider-specific Neon behavior may be tested separately only when necessary.

### Supabase

For database-level testing, use isolated local/containerized Supabase/PostgreSQL tooling where appropriate rather than the production Supabase project.

Provider-specific integration tests should use a dedicated non-production environment when local emulation cannot reproduce the behavior.

### Convex

Convex does not map directly to a normal PostgreSQL Docker container.

Do not pretend a PostgreSQL container tests Convex behavior.

For Convex projects:

- isolate tests from production
- use Convex-supported local/test development workflows
- use dedicated test deployments/environments where required
- mock only when testing logic that does not require real Convex semantics
- never point automated destructive tests at the production Convex deployment

The principle remains the same: **tests run against disposable isolated infrastructure, never production.**

## External Service Testing

Apply the same isolation philosophy to other services.

Prefer:

- Stripe test mode
- Resend test/safe recipient workflows
- test authentication tenants/configurations where supported
- mocked or sandbox AI calls for deterministic tests where appropriate
- local object storage/emulation or dedicated test buckets where practical

Never make an automated test suite capable of charging real cards, emailing real customers, deleting real user data, or mutating production infrastructure.

## AI Agent Database Testing Rule

Before an AI coding agent runs any database test, migration test, reset, seed, truncate, or destructive database command, it must determine which database environment the command targets.

If that cannot be established safely, **do not execute the command**.

The agent must never solve a failing test setup by pointing the tests at an available production or shared database.

## Definition of Done Addition

For features that modify persistence:

- Dockerized/isolated database tests pass
- migrations apply from a clean test database
- relevant constraints are tested
- test fixtures remain deterministic
- no test requires production credentials
- no test mutates production/shared application data

---

# AI Agent Execution & Release Rules

## Git Commit / Push Policy

After the AI agent fully completes a requested task:

- review the changes
- run the relevant validation checks
- confirm the task is complete
- create a Git commit for that completed task

Each completed task should end with a clean, scoped commit when repository state allows it.

Commit rules:

- commit only completed, validated work
- keep commits focused on the task just completed
- use clear commit messages describing the actual change
- do not combine unrelated changes into the same commit
- do not commit secrets, generated junk, temporary files, local credentials, or unrelated user changes
- inspect `git status` before committing
- preserve unrelated pre-existing working-tree changes

### Never Push Without Explicit Permission

**The AI agent must never run `git push`, push a branch, publish a tag, or otherwise send local Git commits to a remote repository unless the user explicitly asks it to push.**

A completed task should normally end at:

```text
Implementation
    ↓
Validation
    ↓
Git Commit
    ↓
STOP
```

Do not assume that because a commit was requested or created, a push is also authorized.

Do not push merely because:

- Vercel deploys from GitHub
- CI needs to run
- a release is ready
- the task appears finished
- a remote branch already exists

Wait for explicit user instruction before pushing.

---

# Stripe CLI Standard

Use the Stripe CLI when configuring and testing Stripe-related development workflows where the CLI supports the required operation.

Preferred Stripe development workflow:

- authenticate the Stripe CLI securely
- use Stripe test mode during development/testing
- create or inspect products/prices through supported Stripe CLI/API workflows where appropriate
- forward Stripe webhooks to the local application during development
- verify webhook signatures
- test checkout and subscription lifecycle locally
- test duplicate/out-of-order webhook behavior
- keep Stripe identifiers in environment configuration rather than hardcoding them

## Stripe Payment Setup

When implementing payments:

- create the required Stripe products/prices using Stripe-supported tooling
- use Checkout / Payment Links / Billing primitives appropriate to the product
- keep server-side Stripe configuration authoritative
- do not trust client-provided pricing
- use verified webhooks for final payment/subscription state

## Stripe Tax

Enable Stripe automatic tax calculation when the product/business model supports it and the Stripe account is configured for the required tax registrations/settings.

Where applicable:

- enable Stripe Tax / automatic tax calculation on Checkout Sessions or other supported payment flows
- do not hardcode tax rates when Stripe automatic tax is the intended source of truth
- display tax behavior clearly in checkout
- test taxable and non-taxable scenarios
- verify tax behavior in Stripe test mode before launch

If Stripe account-level prerequisites prevent automatic tax from functioning, report the exact prerequisite rather than silently disabling tax.

---

# Vercel CLI Environment Variable Standard

Use the Vercel CLI for project environment-variable management when working from the development environment and the CLI supports the required action.

Preferred workflow:

- inspect the linked Vercel project
- use the correct project/environment
- add/update environment variables via Vercel CLI
- distinguish:
  - Development
  - Preview
  - Production
- never expose secret values in logs or commit them
- keep `.env.example` synchronized with variable names, but never include real secret values
- pull safe local environment configuration when appropriate using Vercel-supported workflows

The AI agent should not tell the user to manually click through Vercel for environment variables if the CLI can perform the required change safely.

Production environment-variable changes must be deliberate and scoped to the intended Vercel project.

---

# Apple App Store Connect API & iOS Release Automation

The user has an Apple Developer account.

**Do not ask whether the user has an Apple Developer account.**

The user's iPhone is already in Developer Mode.

**Do not ask whether the device is in Developer Mode.**

When iOS release work is requested, use the available Apple/App Store Connect API and supported tooling where appropriate to automate release preparation rather than defaulting to manual instructions.

## iOS Build Submission

Where supported, the release workflow should cover:

- create/archive the iOS release build
- validate signing and entitlements
- produce the distributable build
- upload the build to App Store Connect using supported API/tooling
- associate the build with the correct app/version
- prepare TestFlight where applicable
- prepare the App Store version for submission

Do not publish a production App Store release without explicit user authorization when the action is irreversible or externally visible.

## App Store Connect Metadata

Before launch, complete the required App Store metadata where applicable:

- app name
- subtitle
- promotional text
- description
- keywords
- primary category
- secondary category where appropriate
- support URL
- marketing URL where appropriate
- privacy policy URL
- copyright
- age rating questionnaire
- app privacy details
- export compliance
- content rights
- review contact information
- review notes
- demo account/instructions where needed
- version release notes
- localization metadata where relevant

Populate metadata from the actual product rather than generic placeholder copy.

## ASO Standard

Perform App Store Optimization before launch.

ASO should cover:

- keyword research
- app title strategy
- subtitle
- keyword field
- description positioning
- category selection
- competitor positioning
- screenshots
- screenshot captions
- app preview strategy where useful
- icon review
- localization opportunities
- release-note quality

ASO should be consistent with the product's real capabilities and should not use misleading claims.

---

# ASO Image Generation Timing

For mobile apps, create ASO/App Store listing images **after core product development is complete and before launch/review submission**.

Do not create final App Store screenshots too early if the UI is still likely to change.

Recommended sequence:

```text
Core Development Complete
        ↓
Release UI Stabilized
        ↓
Final Device Testing
        ↓
ASO Strategy
        ↓
Generate / Capture ASO Images
        ↓
Prepare App Store Metadata
        ↓
Upload Build
        ↓
TestFlight / Review
        ↓
Launch
```

ASO images should:

- use the actual final app UI where appropriate
- match the app's visual identity
- communicate the strongest user benefits
- be legible at App Store browsing size
- use concise benefit-led captions
- meet Apple's current screenshot dimensions/specifications
- cover the most important product flows
- avoid outdated UI
- avoid unsupported claims

Use image-generation/design tools when appropriate for backgrounds, framing, compositing, or marketing presentation, while keeping screenshots truthful to the real product.

---

# Mobile Platform Assumptions

The user has the required Apple/Android developer access for projects that need those platforms.

Do not ask basic setup questions such as:

- whether the user has an Apple Developer account
- whether the user has Android developer access
- whether the user's iPhone is in Developer Mode

Only ask about platform credentials/configuration when a specific missing credential, identifier, certificate, API key, signing asset, or account permission is actually required and cannot be resolved from the repository/tooling.

---

# Next.js Latest Caching Standard

Use the current stable Next.js caching and data-fetching model supported by the project's installed Next.js version.

Do not copy outdated caching patterns from older Next.js releases without verifying they still apply.

For each data source/route decide explicitly:

- dynamic vs static
- request-time vs build-time rendering
- cacheable vs non-cacheable
- private vs public data
- revalidation strategy
- tag/path invalidation where supported
- stale-data tolerance
- mutation invalidation behavior

Prefer the latest supported Next.js cache APIs and conventions available in the installed version.

Never cache:

- secrets
- authorization decisions in an unsafe shared scope
- private user data in a public cache
- rapidly changing billing/entitlement state when stale access would be dangerous

Document non-obvious caching decisions.

---

# Skills & Tooling Rule

When a relevant installed skill, connector, CLI, or purpose-built tool is available, use it rather than reinventing the workflow manually.

Examples include:

- framework-specific skills
- React/Next.js best-practice skills
- shadcn skills
- Stripe skills
- database/provider skills
- GitHub skills
- Figma/design skills
- mobile/macOS/iOS skills when relevant
- document/spreadsheet/presentation skills for artifact work

The AI agent should inspect and follow the relevant skill's instructions before performing work that requires it.

Do not ignore available specialized tooling and then provide a lower-quality manual workaround.

---

# Domain & DNS Default

Most project domains are expected to be managed through **Cloudflare** unless the project explicitly uses another DNS provider.

Default assumptions:

- DNS provider: Cloudflare
- app hosting: Vercel
- source control: GitHub

Typical deployment path:

```text
GitHub
   ↓
Vercel
   ↓
Custom Domain
   ↓
Cloudflare DNS
```

When configuring domains, verify:

- apex domain
- `www` strategy
- redirects
- CNAME/A/AAAA records as required
- SSL/TLS
- proxy mode when appropriate
- email DNS records
- SPF
- DKIM
- DMARC
- conflicting records
- Vercel domain verification

Do not make destructive DNS changes without verifying existing records and their purpose.

---

# Frontend UI Standard

Use:

- **Tailwind CSS**
- **shadcn/ui**

as the default frontend styling/component baseline for Next.js web applications unless a project explicitly requires another design system.

Rules:

- use shadcn components as composable source code, not as an untouchable black box
- adapt components to the project's design system
- keep Tailwind usage consistent
- prefer reusable variants over duplicated class strings
- preserve accessibility behavior
- avoid excessive one-off styling
- maintain consistent spacing, typography, radius, elevation, and states
- keep the UI responsive by default
- do not ship default-looking shadcn pages without applying the product's visual identity

Use the relevant shadcn skill/tooling when available and appropriate.

---

# Required Next.js Error & Loading UX

Every Next.js web project must include deliberate application-level handling for common error/loading states.

At minimum implement:

## 404 / Not Found

Create the appropriate Next.js not-found experience, typically using:

```text
app/not-found.tsx
```

Requirements:

- branded design
- clear explanation
- useful navigation back to a safe route
- responsive layout
- accessible controls
- no generic framework-default 404 page in production

## 500 / Error Experience

Implement the appropriate Next.js error boundaries/pages for application failures, using current App Router conventions such as:

```text
app/error.tsx
app/global-error.tsx
```

where appropriate.

Requirements:

- branded error state
- safe retry action where useful
- no sensitive stack traces
- error logging/observability integration
- graceful fallback
- useful path back to the application

## Loading UI

Use Next.js loading conventions where appropriate, such as:

```text
app/loading.tsx
```

and route-segment loading states for meaningful waits.

Requirements:

- avoid blank screens during server/data transitions
- keep layout stable
- use meaningful skeletons for data-heavy UI
- avoid fake progress indicators when they do not reflect real progress

## Skeleton Components

Create reusable skeleton components for major data-driven UI patterns such as:

- cards
- tables
- lists
- dashboards
- profile/detail views
- admin metrics
- forms where meaningful

Skeletons should approximate the final layout closely enough to reduce layout shift.

## Suspense

Use React/Next.js Suspense boundaries where they improve streaming and route responsiveness.

Do not add Suspense mechanically where it creates complexity without UX benefit.

## Empty States

For all important lists/data surfaces, implement a deliberate empty state rather than rendering an unexplained blank area.

## Error-State Completeness

For every significant route consider:

- loading
- empty
- not found
- recoverable error
- unrecoverable error
- unauthorized
- forbidden
- offline/poor network where relevant


---

# Final Engineering Standards

## Feature Request Intake

Before significant work capture goal, user, scope, non-goals, acceptance criteria, data, permissions, UX, backend, DB, mobile, admin, analytics, notifications, billing, security, tests, rollout, and rollback.

## Architecture Decision Records

Use `docs/decisions/` for long-lived architectural choices. Record context, decision, alternatives, consequences, date/status. Do not create ADRs for trivial implementation details.

## Release Notes & Changelog

For meaningful releases document features, behavior changes, important fixes, migrations, compatibility changes, and known limitations without exposing security-sensitive internals.

## Database Query Review

For potentially expensive queries inspect indexes/query plans where useful, avoid N+1 and unbounded scans, verify pagination/scoping, and measure representative latency.

## Performance Regression

For major critical-path changes compare server/API/DB latency, Core Web Vitals, bundle/image payload, memory, and mobile performance where relevant.

## Security Headers & CSP

Configure appropriate CSP, HSTS, Referrer-Policy, Permissions-Policy, frame-ancestors, and X-Content-Type-Options. Grant third-party origins the narrowest required CSP permissions.

## Dependency Automation & Supply Chain

Use Dependabot/Renovate where appropriate; review major upgrades, commit lockfiles, review risky install scripts, pin trusted GitHub Actions, and prioritize security updates.

## GitHub Actions Security

Use least-privilege `GITHUB_TOKEN`, never expose production secrets to untrusted PRs, and separate privileged deployment workflows from untrusted code.

## Branch & Environment Mapping

Document Local/Preview/Staging/Production mappings for DB, Stripe, Resend, auth, AI, and other services; preview code must not silently use production credentials.

## Preview Cleanup

Remove temporary DB branches, storage, fixtures, test webhooks, credentials, and other preview resources when branches/environments are removed.

## Data Backfills & Large Operations

Backfills/imports/exports/bulk deletes/bulk sends must be batched, resumable, observable, idempotent where practical, rate-limited when needed, and run as background jobs rather than giant HTTP requests.

## Idempotency Keys

Use idempotency for payments, document generation, email jobs, imports, exports, payouts, destructive mutations, and critical provider calls where duplicate execution is dangerous.

## Optimistic Concurrency

Prevent silent last-write-wins corruption using versions, timestamps, compare-and-swap, transactions, or conflict UX where concurrent editing is possible.

## Timeouts, Retries & Circuit Breaking

Define finite downstream timeouts; classify retryable/permanent/user-correctable/rate-limit errors; use bounded backoff/jitter and provider throttling/circuit breaking where appropriate.

## Health & Maintenance

Distinguish liveness, readiness, and dependency health. Define consistent maintenance-mode behavior for web, API, mobile, admin, checkout, jobs, and webhooks.

## Rate Limiting

Centralize limits by IP/user/org/API key/endpoint/feature/cost unit as appropriate and expose meaningful abuse signals in admin.

## Customer API Keys

Generate high-entropy keys, hash where feasible, support scopes/rotation/revocation, record created/last-used, rate-limit, and audit important usage.

## Customer Webhooks

Sign payloads, timestamp signatures, retry with backoff, expose delivery logs/replay, rotate secrets, allow disabling endpoints, and protect URL registration against SSRF.

## Audit Log Integrity

Normal administrators must not casually edit/delete audit history; define retention and higher-privilege management.

## Data Classification & Residency

Classify data as Public/Internal/Confidential/Highly Sensitive where useful and use that to drive logging, encryption, admin visibility, retention, export, AI sharing, and regional residency.

## Encryption Key Management

For app-level encryption separate keys from data, version/rotate keys, define recovery, restrict access, and never hardcode keys.

## Account Linking & Sessions

Safely merge/link verified login identities; support session/device visibility, revocation, logout-all, and meaningful security alerts where appropriate.

## Organization Ownership Transfer

For team products protect the last owner and define ownership transfer, billing ownership, deletion/member-removal behavior, and audit history.

## Deletion Grace Period

Where appropriate use request → grace period → cancellation opportunity → irreversible cleanup while respecting cases requiring immediate deletion.

## Subscription Semantics

Define immediate vs period-end cancellation, grace periods, failed-payment access, trials, entitlement removal, data retention, reactivation, and refunds.

## Trial Abuse & Refunds

Define repeat-trial policy proportionately; refunds must coordinate authorization, Stripe, local state, entitlements, audit, customer communication, and reconciliation.

## Email Queueing & Suppression

Do not block requests on non-critical email unnecessarily; queue/retry where useful and respect hard bounces, complaints, unsubscribes, and invalid recipients.

## Mobile Push Lifecycle

Support multiple devices, token rotation/removal, safe user/device association, preferences, and delivery failure handling.

## App Store Server Notifications & Billing

For Apple subscriptions/IAP, verify App Store Server Notifications and reconcile server-side. Check current Apple/Google billing rules before assuming Stripe can sell native digital goods.

## Mobile Signing & Crash Symbols

Document certificate/profile rotation and release credentials; preserve/upload dSYMs, source maps, and native symbols so production crashes are actionable.

## Mobile Rollback & Compatibility

Use feature flags/kill switches/backward-compatible APIs because native releases cannot roll back like Vercel; define supported versions and an emergency forced-update flow.

## Production Migration Ownership

Define the workflow/tool authorized to run production migrations and prevent concurrent migration races.

## Analytics Taxonomy

Use canonical shared event names/properties across web/mobile; prevent duplicates, impossible states, accidental PII, and client-authoritative revenue events.

## Experimentation

Define hypothesis, audience, variant, primary metric, guardrails, expected duration/sample, stopping rule, and rollout decision.

## SEO Quality & Scaling

Do not generate thin AI SEO pages; use sitemap indexes when needed and validate structured data against current requirements.

## Images, Fonts & Third-Party Scripts

Optimize Next.js images/dimensions/caching, minimize font variants/layout shift, and give every analytics/chat/ad script a purpose, consent decision, performance budget, and removal path.

## Cookies & Bots

Classify cookies as necessary/preferences/analytics/marketing and apply consent rules; distinguish bots where useful for analytics, abuse, rate limits, billing, and SEO.

## Support Escalation

Define severity, owner, response target, engineering/security/billing escalation paths, and resolution state.

## Admin Bulk Actions & Exports

Use preview/count, dry run, confirmation, background progress, cancellation, audit, and failure reporting; protect sensitive exports with least privilege and expiring controlled access.

## Production Data Editing

Prefer validated admin actions over direct DB edits; emergency direct modifications must be documented/audited.

## Dry Run

Provide dry-run mode for risky migrations, backfills, bulk email/delete, payouts, imports, and data corrections where practical.

## Launch Rollback

Before launch know how to disable signup/checkout/AI/email/risky features, restore web deployment, stop jobs, communicate incidents, and safely roll forward DB changes.

## Disaster Communication

For serious products define status/in-app/support/email incident communication.

## Domain Renewal

Track registrar, renewal/payment status, owner, expiration, DNS owner, and enable auto-renew where appropriate.

## Brand Gate

Before locking a brand consider domain ownership, app-store conflicts, basic trademark conflicts, important social handles, spelling/pronunciation, and international meaning.

## Accessibility Launch Gate

Before launch verify keyboard, focus, labels, contrast, zoom/text scaling, screen-reader basics, touch targets, and reduced motion where relevant.

## Browser Support Matrix

Document supported browser/platform versions based on audience, explicitly considering current Chrome, Safari/iOS Safari, Edge, and Firefox where relevant.

## License Compliance

Avoid incompatible third-party licenses, preserve required notices, review unusual/copyleft dependencies, and track licenses when commercial distribution requires it.

# Mandatory AI Coding Task Execution Protocol

For every coding task, follow this sequence unless a step genuinely does not apply:

1. Read `DEVELOPER_HANDBOOK.md`.
2. Inspect repository structure and existing architecture.
3. Read/use relevant installed skills and specialized tooling.
4. Run `git status`; preserve unrelated user work.
5. Understand the existing implementation before modifying it.
6. Identify affected frontend, backend, DB, auth, admin, analytics, billing, email, mobile, and infrastructure surfaces.
7. Choose the smallest complete implementation.
8. Consider security, privacy, permissions, failure states, concurrency, cost, and scale.
9. Implement using existing patterns/shared components.
10. Add/update relevant tests.
11. Update documentation/`DEVELOPER_HANDBOOK.md` when workflows or architecture changed.
12. Run lint.
13. Run typecheck.
14. Run relevant tests.
15. Use only isolated Dockerized/test infrastructure for DB tests.
16. Run the production build.
17. Inspect warnings/errors.
18. Inspect `git diff`.
19. Verify authorization/security boundaries.
20. Verify loading, empty, error, not-found, unauthorized, and forbidden states where relevant.
21. Verify responsive behavior and accessibility basics.
22. Verify admin visibility/controls where relevant.
23. Verify analytics/monitoring where relevant.
24. Verify email/payment/provider behavior where relevant.
25. Verify no secrets/unrelated files are included.
26. Fix task-caused validation failures; never hide them or weaken tests/types/security merely to pass.
27. Commit the fully completed task with a clear scoped message.
28. **STOP. NEVER PUSH unless the user explicitly instructs the agent to push.**

---

# Standard New Project Bootstrap

## Repository & Runtime
- [ ] Git + GitHub repository
- [ ] Supported Node.js version pinned
- [ ] `pnpm`
- [ ] TypeScript strict
- [ ] lockfile committed
- [ ] `.gitignore`
- [ ] `.env.example`
- [ ] `README.md`
- [ ] `DEVELOPER_HANDBOOK.md`

## Web
- [ ] Latest stable Next.js / App Router
- [ ] Latest applicable Next.js caching patterns
- [ ] Tailwind CSS
- [ ] shadcn/ui
- [ ] Responsive design/theme
- [ ] 404/not-found
- [ ] error/global-error where appropriate
- [ ] loading/skeleton states
- [ ] empty/permission states
- [ ] accessibility baseline
- [ ] metadata/SEO baseline

## Source Control & Deployment
- [ ] GitHub source of truth
- [ ] Vercel linked to GitHub
- [ ] Push/merge triggers Vercel deployment
- [ ] Preview deployments
- [ ] Development/Preview/Production env separation
- [ ] Vercel CLI env workflow
- [ ] Cloudflare DNS/domain
- [ ] Production smoke tests

## Data
- [ ] Supabase, Neon, or Convex selected deliberately
- [ ] Schema/indexes/constraints
- [ ] Migrations
- [ ] Dockerized/isolated DB tests
- [ ] Synthetic deterministic fixtures
- [ ] Backup/restore strategy

## Authentication & Security
- [ ] Better Auth or Clerk
- [ ] Server-side authorization
- [ ] Rate limiting
- [ ] Security headers/CSP
- [ ] Secret management
- [ ] Audit logging where needed
- [ ] Admin access protected

## Payments
- [ ] Stripe
- [ ] Stripe CLI
- [ ] Test mode
- [ ] Verified/idempotent webhooks
- [ ] Entitlements
- [ ] Stripe automatic tax where applicable/configured
- [ ] Refund/cancellation semantics

## Email
- [ ] Resend
- [ ] Branded responsive email system
- [ ] SPF/DKIM/DMARC
- [ ] Email preview/tests
- [ ] Bounce/complaint/unsubscribe handling

## Observability & Analytics
- [ ] Sentry/error monitoring
- [ ] PostHog/product analytics where needed
- [ ] Health/operational signals
- [ ] Admin system health
- [ ] Production alerts where warranted

## Admin Dashboard
- [ ] Control Center
- [ ] Users & Accounts
- [ ] Account Lifecycle
- [ ] System & Ingest Health
- [ ] Revenue & Subscriptions
- [ ] Affiliates & Payouts
- [ ] Activation Funnel
- [ ] Broadcasts & Flags
- [ ] Site Mode & Waitlist
- [ ] Billing Mode
- [ ] Support Tickets
- [ ] Send Email
- [ ] Email Tests
- [ ] Ad Playbook

## Mobile When Applicable
- [ ] React Native, no Expo
- [ ] Xcode/native iOS project
- [ ] Secure storage
- [ ] Deep links
- [ ] Push notifications
- [ ] API backward compatibility
- [ ] Physical-device testing
- [ ] Crash symbolication
- [ ] App Store Connect metadata
- [ ] ASO strategy/images after UI stabilizes and before launch
- [ ] TestFlight/release workflow
- [ ] Store billing rules checked for digital goods

## CI / Quality
- [ ] Lint
- [ ] Typecheck
- [ ] Unit/integration/E2E tests as appropriate
- [ ] Isolated DB service in CI
- [ ] Production build verification
- [ ] Dependency/security checks
- [ ] No production secrets in untrusted PR workflows

## Launch
- [ ] Production configuration verified
- [ ] Domain/DNS/SSL verified
- [ ] Auth tested
- [ ] Payments tested
- [ ] Email tested
- [ ] Admin tested
- [ ] Mobile release tested where applicable
- [ ] Accessibility gate
- [ ] Browser support verified
- [ ] Analytics/monitoring active
- [ ] Rollback/kill switches understood
- [ ] Production smoke tests pass

---

# Master Document Size Rule

This roadmap is the comprehensive reference, but project-specific instructions should not require an AI agent to repeatedly ingest irrelevant sections.

For mature projects, split operational rules into focused documents such as:

```text
docs/engineering/
├── MASTER.md
├── architecture.md
├── frontend.md
├── design-system.md
├── backend.md
├── database.md
├── auth-security.md
├── ai.md
├── payments.md
├── email-notifications.md
├── admin-dashboard.md
├── analytics.md
├── mobile.md
├── testing.md
├── deployment.md
├── scaling-performance.md
├── reliability.md
├── privacy-compliance.md
└── launch-checklist.md
```

`MASTER.md` should contain the non-negotiable rules and route the developer/AI agent to the relevant specialized documents.

`DEVELOPER_HANDBOOK.md` remains the practical project-specific operating manual.

---

# Repository Task Management Standard

## Default Task Source of Truth

By default, every project should use a root-level:

```text
TODO.md
```

for active project execution and development task tracking.

Do **not** require Linear or another external project-management system for a normal single-developer / AI-assisted project.

The repository should remain the immediate source of truth for implementation work because the coding agent can read, update, version, and commit task state together with the code.

Recommended root structure:

```text
project/
├── TODO.md
├── DEVELOPER_HANDBOOK.md
├── README.md
├── docs/
│   ├── engineering/
│   └── decisions/
└── ...
```

## `TODO.md` Structure

Keep `TODO.md` intentionally lightweight.

Recommended structure:

```markdown
# Project Tasks

## In Progress

- [ ] Implement Stripe checkout
  - [ ] Create Stripe products/prices
  - [ ] Enable automatic tax
  - [ ] Implement checkout
  - [ ] Implement webhook
  - [ ] Add admin visibility
  - [ ] Add tests

## Next

- [ ] Add Resend emails
- [ ] Build admin dashboard
- [ ] Add onboarding

## Blocked

- [ ] App Store submission
  - Blocked by: final screenshots

## Later

- [ ] Affiliate system

## Completed

- [x] Authentication
- [x] Database schema
```

Do not turn `TODO.md` into a large project-management database.

It should answer:

- what is being worked on now?
- what comes next?
- what is blocked?
- what is intentionally deferred?
- what was recently completed?

## AI Agent Task Lifecycle

Before starting a development task:

1. Read `TODO.md`.
2. Identify the relevant task.
3. Add the task if it does not already exist and is significant enough to track.
4. Mark only the task actually being worked on as `In Progress`.
5. Preserve unrelated tasks and user edits.

While implementing:

- add newly discovered **necessary** subtasks
- do not silently expand optional scope
- record blockers when they prevent completion
- keep task wording concise
- do not mark incomplete work as completed

After implementation:

1. complete the implementation
2. run relevant tests/checks
3. run lint/typecheck/build as required
4. update documentation
5. verify operational/admin/security surfaces
6. mark the task/subtasks complete
7. move the completed task to `Completed` where appropriate
8. inspect Git diff/status
9. commit the task, code, tests, docs, and task-state update together
10. **STOP — never push unless the user explicitly instructs the agent to push**

Standard lifecycle:

```text
Read TODO.md
      ↓
Mark task In Progress
      ↓
Implement
      ↓
Add discovered required subtasks
      ↓
Tests / Typecheck / Lint / Build
      ↓
Update Documentation
      ↓
Verify Completion
      ↓
Mark TODO Complete
      ↓
Git Commit
      ↓
STOP — NO PUSH
```

## Task Completion Integrity

A TODO item must not be marked complete merely because code was written.

It is complete only when the relevant Definition of Done has been satisfied.

If work is partially complete:

- leave it in progress, or
- split the completed and remaining work into separate tasks

Never use task-status changes to hide unfinished implementation.

## Blocked Tasks

When a task cannot proceed, move or record it under `Blocked` with a concise reason.

Example:

```markdown
## Blocked

- [ ] Submit iOS app for review
  - Blocked by: final ASO screenshots
```

Do not invent blockers merely because a workflow requires additional work the AI agent can perform itself.

## Discovered Work

During implementation, the AI agent may discover additional work.

Classify it:

### Required for current task

Add as a subtask and complete it before marking the parent task complete.

### Important but separate

Add to `Next`.

### Optional / future improvement

Add to `Later`.

Do not silently turn optional improvements into current scope.

## Completed Task Retention

Keep enough recently completed tasks to understand current project progress.

For long-running projects, old completed work may be moved to:

```text
docs/history/
```

or a changelog/release history if `TODO.md` becomes unnecessarily large.

Git history remains the authoritative historical record of implementation changes.

## Relationship to Git Commits

Task completion and Git commits should align.

Preferred:

```text
One completed logical task
        ↓
One focused commit
```

The commit should include:

- implementation
- tests
- documentation updates
- `TODO.md` completion update

Avoid a separate commit whose only purpose is marking the task complete when it can naturally be included with the implementation commit.

## Linear Integration

Linear is optional, not a default dependency.

Use Linear when a project benefits from:

- multiple developers
- multiple teams
- many parallel workstreams
- assignments
- deadlines
- sprint/cycle planning
- customer-reported bugs
- product/engineering coordination
- cross-project planning
- larger backlog management

## Linear Source-of-Truth Rule

If a project is **explicitly connected to Linear for task management**, Linear becomes the primary task-management source of truth for tracked product/engineering work.

In that case, the AI agent should use the available Linear integration/tooling when appropriate to:

- read the issue before implementation
- understand acceptance criteria
- move the issue to the appropriate active status
- add useful implementation notes when needed
- record genuine blockers
- mark the issue complete only after the task passes its Definition of Done

Do not maintain two competing detailed task systems.

When Linear is authoritative:

- Linear owns project/issue status
- repository documentation owns technical truth
- Git owns code/history
- `TODO.md` should be omitted or limited to small repository-local technical notes that do not belong in Linear

## Linear + Git Relationship

Even when Linear is used:

```text
Linear Issue
     ↓
Implementation
     ↓
Validation
     ↓
Documentation
     ↓
Linear status updated
     ↓
Git Commit
     ↓
STOP — NO PUSH
```

The Git push rule does not change.

**Never push merely because a Linear issue has been completed. Explicit user authorization is still required.**

## Default Decision

Unless a project explicitly says otherwise:

```text
Task management: TODO.md
Code/history: Git
Developer instructions: DEVELOPER_HANDBOOK.md
Architecture/reference: docs/
Remote source control: GitHub
Deployment: GitHub → Vercel after an authorized push
```

This keeps AI-assisted projects simple, local, version-controlled, and self-contained while leaving a clear upgrade path to Linear when project coordination becomes complex.
