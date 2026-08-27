# Limits Registry — Master Product & Engineering Specification

## 1. Product Name

**Limits Registry**

Domain:

`limitsregistry.com`

## 2. Mission

Limits Registry records, verifies, and tracks the known boundaries of what is possible.

The platform is not merely a leaderboard and not merely a database of open problems.

Every registry entry represents a precisely defined limit with:

- a measurable objective,
- a direction,
- a formal or operational specification,
- a best known demonstrated result,
- a theoretical or proven opposing bound where available,
- a historical progression of results,
- evidence and provenance,
- researchers and institutions,
- references to original papers,
- verification status,
- an unresolved gap where one still exists.

Core concept:

```text
KNOWN ACHIEVABLE RESULT
        ↓
        │
        │ UNKNOWN GAP
        │
        ↑
PROVEN / THEORETICAL BOUND
```

The objective is to close that gap.

When the demonstrated frontier and proven frontier meet, the limit is considered proven.

## 3. Core Positioning

Primary positioning:

> **The verified boundaries of what is possible.**

Alternative:

> **A public record of humanity's known limits.**

Do not position the company merely as:

- Guinness for science,
- an open-problem list,
- a benchmark leaderboard,
- a paper database,
- a records website.

Those are comparisons, not the product definition.

Limits Registry combines:

```text
scientific literature
+
historical progression
+
known achievable results
+
known impossibility bounds
+
verification
+
attribution
+
open challenges
+
community submissions
```

## 4. Core Vocabulary

Use consistent terminology.

### Limit

The central registry object.

Example:

```text
LR-000127
Maximum fault tolerance under protocol model X
```

### Result

A demonstrated or claimed value associated with a Limit.

### Achievable Frontier

The strongest verified result known to be achievable.

### Proven Bound

A mathematically, formally, or otherwise rigorously established boundary that cannot be exceeded under the specification.

### Gap

The unresolved region between what is known achievable and what is known impossible.

### Open Limit

A Limit where the achievable frontier and proven bound do not coincide.

### Proven Limit

A Limit where the achievable frontier equals the proven boundary.

### Submission

A user/researcher contribution proposing:

- a better result,
- a stronger lower bound,
- a stronger upper bound,
- a proof,
- a reproduction,
- a correction,
- a new Limit.

### Verification

The process used to establish the validity of a claim.

## 5. Optimization Directions

Limits Registry must support both directions.

```text
MINIMIZE
MAXIMIZE
```

Examples:

### Minimize

- fewest states,
- lowest energy,
- least memory,
- shortest construction,
- smallest size,
- least communication,
- fewest sensors.

### Maximize

- highest efficiency,
- maximum throughput,
- greatest fault tolerance,
- longest survival,
- highest compression,
- greatest density,
- most information.

The core data model must not assume that “better” always means lower.

## 6. Universal Bound Model

Represent every Limit using two conceptual frontiers:

```text
ACHIEVABLE FRONTIER
IMPOSSIBILITY FRONTIER
```

For maximization:

```text
BEST ACHIEVABLE                PROVEN CEILING

      92  ───── UNKNOWN ─────     100

                92 ≤ L ≤ 100
```

For minimization:

```text
PROVEN FLOOR                   BEST ACHIEVABLE

       4  ───── UNKNOWN ─────      6

                 4 ≤ L ≤ 6
```

When both sides meet:

```text
L = 5

PROVEN LIMIT
```

## 7. Source Provenance

Every published fact must have explicit provenance.

Required source-status enum:

```text
LITERATURE_REPORTED
LITERATURE_REPRODUCED
FORMALLY_PROVEN
LIMITS_REGISTRY_REPRODUCED
LIMITS_REGISTRY_VERIFIED
LIMITS_REGISTRY_FORMALLY_VERIFIED
```

Do not imply Limits Registry independently verified literature results unless it actually did.

## 8. Publication Rule

Non-negotiable:

> **Nothing becomes a Limits Registry fact because an AI said it.**

Every published quantitative claim must terminate in identifiable evidence.

AI may:

- discover candidate records,
- extract structured claims,
- summarize papers,
- identify authors,
- suggest relationships,
- draft timelines.

AI may not:

- directly publish,
- invent bounds,
- calculate authoritative results from prose,
- infer unsupported attribution,
- assign verification status without evidence.

All public records require validation and human/admin approval in V1.

## 9. V1 Scope

V1 consists of:

1. Canonical data model.
2. Research Console.
3. Literature ingestion.
4. Public Registry.
5. Open Limits.
6. Researcher and institution pages.
7. Paper pages.
8. Historical timelines.
9. Submission system.
10. Verification metadata.
11. Corrections/retractions.
12. Admin dashboard.
13. Search/filtering.
14. Authentication for contributors.
15. Public read access without login.

Do not initially build:

- physical-site adjudication,
- mobile applications,
- paid certifications,
- complicated social networking,
- chat,
- forums,
- enterprise private challenges,
- prize pools,
- cryptocurrency,
- AI-generated public records without review.

## 10. Initial Categories

Launch with rigorous, evidence-rich categories.

### Mathematics

- combinatorics
- graph theory
- number theory
- geometry
- optimization

### Computer Science

- algorithms
- automata
- complexity
- distributed systems
- coding theory
- compression
- data structures

### Information & Communications

- information theory
- coding
- networking
- communication efficiency
- channel limits

### Physics

- theoretical limits
- experimentally established limits
- physical constants only where relevant to the registry model
- clearly distinguish theoretical from empirical results

### AI & Machine Learning

Use carefully.

Only include benchmark/resource limits where:

- specification is versioned,
- benchmark is stable,
- hardware/software context is explicit,
- result is reproducible or properly sourced.

### Engineering

Only add literature-backed entries with clearly measurable specifications.

## 11. Pre-Launch Catalog Goal

Target:

```text
100–300 high-quality records
```

Preferred initial composition:

```text
Mathematics                75
Computer Science           75
Information/Communication  40
Physics                    30
AI/ML                      20
Engineering                10
```

Quality matters more than hitting a number.

A launch with 100 excellent records is preferable to 1,000 questionable ones.

## 12. Limit Object

Every Limit should contain:

```text
id
slug
registry_number
title
short_title
description
formal_statement
category_id
subcategory_id
tags[]
direction
metric_name
unit
constraints
scope_notes
status
created_at
updated_at
published_at
```

Registry ID format:

```text
LR-000001
LR-000002
...
```

IDs are permanent and never reused.

## 13. Limit Status

Suggested enum:

```text
DRAFT
UNDER_REVIEW
OPEN
PROVISIONALLY_CLOSED
PROVEN
DISPUTED
RETIRED
```

Never delete published historical Limits.

## 14. Result Object

One Limit may have many Results.

Schema:

```text
id
limit_id
result_type
value
value_numeric
value_text
unit
directional_effect
date_established
publication_date
source_status
verification_status
method_summary
notes
created_at
updated_at
```

`result_type` examples:

```text
ACHIEVABLE_RESULT
LOWER_BOUND
UPPER_BOUND
EXACT_RESULT
COUNTEREXAMPLE
REPRODUCTION
```

## 15. Historical Timeline

Every material change becomes an immutable timeline event.

Examples:

```text
RESULT_ADDED
BOUND_IMPROVED
RESULT_REPRODUCED
RESULT_RETRACTED
PROOF_ADDED
LIMIT_CLOSED
LIMIT_REOPENED
SPECIFICATION_REVISED
CORRECTION_ADDED
```

## 16. Paper Object

Papers are first-class objects.

Schema:

```text
id
title
abstract
publication_date
venue
journal
conference
volume
issue
pages
doi
arxiv_id
publisher_url
pdf_url_if_legal
citation_text
created_at
updated_at
```

A paper may establish or improve multiple Limits.

## 17. People

Create researcher/person profiles.

Schema:

```text
id
display_name
normalized_name
orcid
website
scholar_url_optional
bio
profile_status
claimed_by_user_id
created_at
updated_at
```

Profile status:

```text
UNCLAIMED
CLAIM_REQUESTED
VERIFIED
DISPUTED
MERGED
```

Do not assume two identical names refer to the same person.

## 18. Contributor Roles

Use role-based attribution.

Examples:

```text
PROBLEM_ORIGINATOR
DISCOVERER
RECORD_SETTER
BOUND_AUTHOR
PROOF_AUTHOR
FORMALIZER
REPRODUCER
VERIFIER
DATASET_AUTHOR
IMPLEMENTER
EDITOR
```

Do not force every record into one “founder” field.

## 19. Institutions

Schema:

```text
id
name
country
website
ror_id_optional
type
created_at
updated_at
```

## 20. Evidence Object

Evidence types:

```text
PAPER
FORMAL_PROOF
SOURCE_CODE
DATASET
EXPERIMENT
VIDEO
STANDARD
REPOSITORY
INDEPENDENT_REPRODUCTION
CERTIFICATE
OTHER
```

Every result should link to the strongest available evidence.

## 21. Verification Status

Use explicit verification statuses.

```text
UNVERIFIED
SOURCE_CONFIRMED
REPRODUCED
AUTOMATICALLY_VERIFIED
EXPERT_VERIFIED
FORMALLY_VERIFIED
DISPUTED
INVALIDATED
```

## 22. Corrections and Retractions

Never destructively overwrite historical scientific claims.

Use correction records and preserve prior states.

## 23. Research Console

Build this before the polished public homepage.

Purpose:

```text
trusted source
↓
AI-assisted extraction
↓
candidate Limit/Result
↓
evidence review
↓
validation
↓
human approval
↓
publish
```

Internal interface should support:

```text
Add source
Find candidate claims
Resolve people
Resolve institutions
Resolve papers
Attach evidence
Compare current frontier
Detect contradictions
Build timeline
Approve
Reject
Request review
```

## 24. Research Console — Source Intake

Input:

```text
paper URL
DOI
arXiv URL
publisher URL
specialized database URL
manual citation
```

System should extract metadata and candidate claims.

AI output must be schema validated.

## 25. Candidate Claim Extraction

Example internal draft:

```text
Candidate Limit Found

Title:
Maximum X under Y constraints

Direction:
MAXIMIZE

Best demonstrated:
72

Proven upper bound:
81

Paper:
...

Authors:
...

Previous result:
68

Confidence:
0.92

Evidence:
...
```

Admin actions:

```text
REVIEW EVIDENCE
APPROVE
EDIT
MERGE
REJECT
MARK NEEDS EXPERT
```

## 26. Source Hierarchy

Prefer:

```text
1. original paper
2. formal proof repository
3. official project/research repository
4. recognized specialist database
5. standards body
6. institutional research page
7. high-quality secondary literature
```

Avoid using blogs as primary evidence when original sources exist.

## 27. Ingestion Automation

Create ingestion jobs.

Pipeline:

```text
source discovered
↓
metadata extracted
↓
candidate claims extracted
↓
entity resolution
↓
historical references expanded
↓
consistency validation
↓
review queue
```

AI never publishes directly.

## 28. Consistency Validation

Before approval, check:

```text
units consistent
direction valid
new result actually improves/strengthens expected frontier
dates plausible
duplicate paper detection
duplicate result detection
person resolution
constraint compatibility
source attached
value parseable
```

## 29. Specification Versioning

Every Limit specification is versioned.

Results store the exact spec version under which they were established.

## 30. Public Limit Page

Every published Limit page should show:

```text
LR number
title
category
status
formal question
plain-language explanation
direction
metric/unit
constraints
best verified achievable result
proven opposing bound
current gap
bound visualization
timeline
current record holder(s)
proof author(s)
papers
evidence
verification status
open challenge state
related Limits
corrections/disputes
```

## 31. Bound Visualization

Universal component.

Example:

```text
MAXIMIZATION

ACHIEVABLE                          PROVEN CEILING
    92  ───────── UNKNOWN ─────────   100

              92 ≤ L ≤ 100
```

## 32. Public Result Page

Each result gets a permanent URL showing value, date, authors, institutions, method, evidence, verification status, and frontier change.

## 33. Public Paper Page

Show paper metadata, authors, venue, DOI/arXiv, Limits affected, results established, and related papers.

Do not host copyrighted PDFs unless legally permitted.

## 34. Researcher Profile

Show:

```text
name
ORCID
affiliation
verified status
limits associated
results
proven bounds
papers
record improvements
historical contributions
```

## 35. Institution Page

Show institution metadata, associated researchers, Limits improved, papers, and verified results.

## 36. Homepage

Launch with real registry content.

Suggested structure:

```text
Limits Registry
The verified boundaries of what is possible.

[Search limits]

250 Limits
1,436 Results
617 Papers
893 Researchers

Recently Improved
Closest Open Limits
Recently Proven
Historic Limits
Categories
```

Numbers must be real.

## 37. Search

Global search across:

```text
Limits
Results
Researchers
Papers
Institutions
Tags
Categories
```

Support filters by category, status, direction, verification, open/proven, date, gap size, and source status.

## 38. Open Limits

Automatically generate an Open Limits view where a non-zero gap exists.

## 39. Submission System

Authenticated users can submit:

```text
BETTER_ACHIEVABLE_RESULT
STRONGER_BOUND
PROOF
REPRODUCTION
CORRECTION
NEW_LIMIT_PROPOSAL
ATTRIBUTION_CORRECTION
```

Every submission gets a permanent ID.

## 40. Submission Workflow

```text
SUBMITTED
↓
AUTOMATED CHECKS
↓
EDITORIAL REVIEW
↓
EXPERT REVIEW if required
↓
REPRODUCTION if possible
↓
ACCEPTED / REJECTED / NEEDS REVISION
↓
registry updated
```

## 41. Automated Verification Framework

For computational Limits, create reusable versioned verifiers.

Verification output:

```text
PASS
FAIL
INCONCLUSIVE
ERROR
```

Store logs and hashes.

## 42. Sandboxed Execution

Never run arbitrary contributor code directly on application servers.

Use:

```text
isolated container
strict CPU limit
strict memory limit
strict timeout
read-only filesystem where possible
network disabled by default
temporary workspace
output limits
```

## 43. Reproduction Bundles

Accepted computational records should ideally expose a reproducible bundle.

## 44. Verification Tiers

Display clearly:

- Literature Reported
- Source Confirmed
- Reproduced
- Automatically Verified
- Expert Verified
- Formally Verified

## 45. Reviewer System

Later V1 or V1.5: support qualified reviewers, fields of expertise, credentials, conflicts of interest, and review records.

## 46. Moderation

Admin must be able to flag, freeze, dispute, merge, split, correct, invalidate, and restore frontiers with full audit history.

## 47. Audit Log

Immutable audit events must capture actor, action, entity, before/after, reason, and timestamp.

## 48. Authentication

Public browsing requires no account.

Authentication required for submissions, profile claiming, review, and admin work.

## 49. Researcher Identity Claiming

Potential proof methods:

```text
ORCID OAuth
institutional email
verified domain
manual review
paper-associated repository ownership
```

## 50. Admin Dashboard

Sections:

```text
Registry Health
Research Queue
Submission Queue
Data Quality
Verification
```

## 51. Suggested Technology Stack

Use:

```text
Next.js
TypeScript
Postgres
Drizzle ORM
Tailwind
shadcn/ui
```

Deployment:

```text
Vercel
```

Database:

```text
Neon or Supabase Postgres
```

Storage:

```text
Cloudflare R2 or S3-compatible storage
```

Background jobs:

```text
Trigger.dev / Inngest / dedicated worker
```

Monitoring:

```text
Sentry
```

Analytics:

```text
PostHog
```

## 52. Research AI Architecture

Use provider abstraction.

Functions:

```text
extractPaperMetadata
extractCandidateClaims
summarizeClaimEvidence
resolveEntities
suggestRelatedLimits
detectContradictions
```

All AI outputs validated with Zod.

Store model, prompt version, response hash, confidence, and review state.

## 53. Cost Control

Use AI primarily during ingestion/research.

Public page loads should not require AI calls.

Prefer deterministic parsing for DOI, dates, numeric values, units, authors, and URLs.

## 54. Canonical Data Tables

Recommended initial schema:

```text
users
limits
limit_spec_versions
categories
tags
limit_tags
results
papers
paper_limit_claims
people
institutions
person_affiliations
limit_people
result_people
paper_people
evidence
result_evidence
timeline_events
submissions
submission_evidence
verifiers
verification_runs
corrections
reviewers
reviews
audit_logs
```

## 55. Numeric Representation

Do not store scientific values only as floating point.

Support exact text, arbitrary precision decimals, rational values, scientific notation, units, uncertainty, and comparison operators.

## 56. Units

Create normalized unit handling and never compare incompatible dimensions.

## 57. Proven Bound Semantics

Store explicit relations such as:

```text
L ≥ 4
L ≤ 100
L = 6
```

Avoid inferring exactness from prose alone.

## 58. Open-Gap Computation

Only mark a Limit as proven when the achievable frontier and opposing rigorous bound coincide under the same specification, unit, and semantics.

## 59. API

Version API from the start:

```text
/api/v1/
```

Public read endpoints for Limits, Results, Papers, Researchers, and Institutions.

## 60. SEO

Each Limit should have a strong canonical page with accurate metadata and evidence-backed claims.

## 61. Citations

Every factual claim on public pages should link to its evidence.

Prefer original source links.

## 62. Licensing

Store bibliographic metadata and original summaries.

Do not copy entire copyrighted papers.

## 63. Security

Required:

```text
strict authorization
CSRF protection
rate limiting
input validation
sandboxing
secret isolation
token encryption
audit logging
safe file uploads
malware scanning for submissions
```

## 64. Roles

Suggested:

```text
PUBLIC
USER
RESEARCHER
REVIEWER
EDITOR
ADMIN
SUPERADMIN
```

## 65. Initial Research Sources

Prioritize authoritative sources such as:

```text
Crossref
OpenAlex
arXiv
ORCID
DOI metadata
specialist mathematical databases
official research repositories
standards bodies
institutional repositories
```

## 66. Research Workflow

For each candidate Limit:

```text
1. Identify canonical question.
2. Find original formulation.
3. Find strongest current result.
4. Find opposing proven/theoretical bound.
5. Find historical progression.
6. Resolve authors.
7. Resolve institutions.
8. Attach papers/evidence.
9. Normalize units.
10. Confirm specification consistency.
11. Run second-pass review.
12. Approve.
```

## 67. Launch Data Standard

A record is launch-ready only if it has:

```text
LR ID
clear title
plain-language description
formal/specification description
category
direction
metric
unit where applicable
at least one frontier result
source
attribution
verification/source status
timeline event
```

For an Open Limit, also require an opposing bound and explicit gap.

## 68. Founding Record Strategy

Do not invent arbitrary challenges first.

Populate from established literature.

During ingestion, identify records with a known achievable frontier plus a known opposing bound and a non-zero gap.

These become the first authentic Open Limits.

## 69. Alerts — Later

Users may eventually follow Limits, categories, researchers, and institutions.

## 70. Certificates — Later

Future paid product:

```text
LIMITS REGISTRY VERIFIED
```

Only after institutional credibility exists.

## 71. Sponsored Challenges — Later

Sponsors can fund Open Limits and Limits Registry can manage formalization, submissions, verification, and award criteria.

## 72. Private Challenges — Later

Enterprise customers can define private optimization problems.

Not V1.

## 73. Monetization Roadmap

### Stage 1

Free public Registry.

Goal:

```text
authority
traffic
citations
contributors
```

### Stage 2

Sponsored challenges and bounties.

### Stage 3

Professional verification and certification.

### Stage 4

Institutional API / data subscriptions.

### Stage 5

Private R&D challenges.

## 74. Public Trust Principles

1. Never fabricate provenance.
2. Never silently rewrite history.
3. Separate reported from verified.
4. Publish verification methodology.
5. Expose conflicts and disputes.
6. Preserve corrections.
7. Attribute contributors precisely.
8. Version specifications.
9. Avoid sensational “world record” claims without justification.
10. Make computational verification reproducible.

## 75. Design Direction

The visual design should feel like:

```text
scientific registry
+
modern reference database
+
technical standards body
```

Not a flashy startup or gaming leaderboard.

## 76. Primary Navigation

Recommended:

```text
Registry
Open Limits
Categories
Researchers
Papers
Submit
About
```

Authenticated admin:

```text
Research Console
Review Queue
Admin
```

## 77. Landing Page CTA

Primary:

```text
Explore the Registry
```

Secondary:

```text
Browse Open Limits
```

## 78. Methodology Page

Publish methodology publicly and version it.

Include inclusion criteria, verification levels, source hierarchy, specification versioning, conflict handling, corrections, attribution, frontier calculation, proven-limit criteria, and editorial process.

## 79. Development Phases

### Phase 1 — Foundation

Implement core app, database, auth, roles, categories, Limits, Results, Papers, People, Institutions, and admin shell.

### Phase 2 — Research Console

Implement source intake, metadata extraction, candidate claim extraction, entity resolution, review queue, approval workflow.

### Phase 3 — Public Registry

Implement public pages, search, categories, timelines, and bound visualization.

### Phase 4 — Catalog Population

Research and approve first 100 records.

### Phase 5 — Open Limits

Implement gap detection and Open Limits views.

### Phase 6 — Submissions

Implement user contributions.

### Phase 7 — Verification

Implement first computational verifier framework.

### Phase 8 — Launch

Launch with substantial catalog.

## 80. First Development Vertical Slice

Implement one full record end-to-end:

```text
paper/source
↓
Research Console
↓
candidate Limit
↓
candidate result
↓
paper/person resolution
↓
admin approval
↓
public LR page
↓
timeline
↓
bound visualization
```

Only then generalize.

## 81. Testing

Required automated tests:

```text
frontier calculation
direction handling
bound comparison
unit normalization
specification version matching
duplicate detection
correction history
submission permissions
review permissions
citation relationships
researcher claiming
audit logging
```

## 82. Import Tools

Admin should support:

```text
DOI paste
arXiv ID
BibTeX
RIS
manual paper entry
CSV batch import
```

All imports produce drafts, never direct publication.

## 83. Data Export

Public records should eventually support:

```text
JSON
CSV
BibTeX citations
```

## 84. Permanent URLs

Avoid changing URLs.

Examples:

```text
/limits/LR-000142
/results/RES-000391
/papers/<slug-or-id>
/researchers/<id-or-slug>
```

## 85. Record IDs

Use separate namespaces:

```text
LR-000001     Limit
RES-000001    Result
SUB-000001    Submission
```

## 86. Historical Integrity

Never reuse IDs.

Never physically delete published records unless legally required.

Use statuses such as:

```text
RETRACTED
INVALIDATED
SUPERSEDED
MERGED
```

## 87. Researcher Contribution Credit

Profile statistics can include Limits originated, frontiers improved, bounds strengthened, Limits proven, reproductions, and papers.

Avoid meaningless point gamification initially.

## 88. Open Limit Challenge Page

An Open Limit page should answer:

```text
What is known?
What is proven?
What is unknown?
What would improve the frontier?
What would strengthen the opposing bound?
How can someone submit?
What evidence is required?
```

## 89. Potential Future Categories

After credibility:

```text
materials
robotics
energy
electronics
chemistry
biology
physical engineering
```

Physical-world records require different verification processes.

## 90. Organization Model

Long-term credibility may benefit from a scientific advisory board, independent reviewers, public methodology, conflict-of-interest policy, appeal process, and possibly a nonprofit relationship later.

Do not create governance complexity prematurely.

## 91. Success Metrics

Early:

```text
approved Limits
Open Limits
papers indexed
researchers resolved
source completeness
data correction rate
search traffic
repeat visitors
researcher claims
submissions
```

Later:

```text
frontiers improved through Registry
limits closed
citations in papers
verified reproductions
sponsored challenge participation
institutional users
```

## 92. Launch Criteria

Do not publicly launch until:

1. At least 100 strong literature-backed Limits exist.
2. Categories are populated meaningfully.
3. Every public record has provenance.
4. Public methodology exists.
5. Corrections system works.
6. Search works.
7. Researcher/paper relationships work.
8. Bound visualizations are correct.
9. At least several genuine Open Limits exist.
10. Admin can correct a bad record without destroying history.

Preferred launch size:

```text
100–250 Limits
```

## 93. Definition of V1 Complete

V1 is complete when:

1. Admin can ingest a paper/source.
2. AI can prepare structured candidate claims.
3. Candidate claims are schema validated.
4. Admin can review evidence.
5. Admin can approve a Limit and Result.
6. Public LR page is generated.
7. Historical results can be added.
8. Achievable and theoretical frontiers are computed.
9. Open/proven status is represented correctly.
10. Papers, people, and institutions are linked.
11. Corrections preserve history.
12. Users can search the Registry.
13. Researchers can submit corrections/results.
14. Submission workflow exists.
15. Every public quantitative claim exposes its source status.

## 94. Core Engineering Rules

- TypeScript strict mode.
- Zod validation for all AI and external input.
- Database migrations for every schema change.
- No AI output directly enters published tables.
- Use staged draft/review/publish states.
- Preserve immutable historical events.
- Encrypt sensitive tokens.
- Never store unnecessary secrets.
- Add structured logging.
- Add Sentry.
- Add rate limiting.
- Use background jobs for ingestion.
- Keep prompts versioned.
- Store model/version used for extraction.
- Write unit tests before frontier logic is trusted.
- Commit each completed logical task.
- Do not push unless explicitly instructed.

## 95. Core Product Principle

Limits Registry should eventually let someone open a page and immediately understand:

> **This is what humanity has demonstrated.**

> **This is what we have proven cannot be exceeded.**

> **This is who moved those boundaries.**

> **These are the papers and evidence.**

> **And this is what remains unknown.**

That is the product.
