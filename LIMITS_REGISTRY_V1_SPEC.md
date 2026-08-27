# Limits Registry — V1 Product & Engineering Specification

## 1. Purpose

Limits Registry is a curated public record of precisely defined mathematical and theoretical-computer-science limits.

V1 optimizes for epistemic trust and model correctness, not catalog size. It launches with 25–40 excellent Limits, manually curated by an editorial team.

Initial domains:

- Mathematics: combinatorics, graph theory, optimization
- Theoretical computer science: automata, coding theory, algorithms

V1 excludes multi-objective limits, physics, engineering, AI benchmarks, public submissions, automated verifier sandboxes, profile claiming, certificates, sponsorships, notifications, and a public API.

## 2. Core model

The fundamental chain is:

```text
Limit → Specification Version → Claim → Evidence → Review
```

A Limit is the enduring question. A Specification Version defines exactly what question is being asked. A Claim asserts a relation about that specification. Evidence supports the claim. Review records the editorial decision.

The current state of a Limit is derived from active, accepted Claims. It is never manually entered as an authoritative fact.

## 3. Definitions

### Limit

A canonical question with a measurable quantity and optimization direction.

### Specification Version

An immutable definition of the problem, including objects, constraints, metric, units, finite/asymptotic scope, and allowed assumptions. A new interpretation creates a new version; historical versions remain available.

### Claim

An assertion that a quantity satisfies a relation under one specification version. Claims are the only source from which current bounds and status are computed.

Supported relations in V1:

```text
<  <=  =  >=  >
```

Supported claim types:

```text
UPPER_BOUND
LOWER_BOUND
EXACT_VALUE
CONSTRUCTION
COUNTEREXAMPLE
ASYMPTOTIC_BOUND
COMPUTATIONAL_BOUND
```

### Evidence

An identifiable source or artifact supporting a Claim: original paper, formal proof, source code, dataset, exhaustive computation, experiment, simulation, standard, or independent reproduction.

### Review

An editorial decision about whether a Claim is sufficiently supported for publication. AI suggestions are never reviews and never publish data.

## 4. Epistemic and evidence semantics

These concepts remain separate.

### Epistemic status

```text
LITERATURE_ASSERTED
SOURCE_CONFIRMED
REPRODUCED
PROVEN
FORMALLY_PROVEN
EMPIRICALLY_SUPPORTED
DISPUTED
INVALIDATED
```

### Proof or evidence type

```text
MATHEMATICAL_PROOF
FORMAL_MACHINE_PROOF
EXHAUSTIVE_COMPUTATION
CONSTRUCTION
COUNTEREXAMPLE
EMPIRICAL_EXPERIMENT
REPRODUCED_EXPERIMENT
SIMULATION
LITERATURE_ASSERTION
```

“A paper reports X,” “X has a mathematical proof,” and “X was observed in 10,000 trials” must produce visibly different public explanations. There is no universal green Verified badge.

## 5. Claim lifecycle

```text
DRAFT → UNDER_REVIEW → ACCEPTED
                     ↘ REJECTED
ACCEPTED → DISPUTED → INVALIDATED
```

Accepted Claims are immutable in meaning. Corrections and invalidations create new events and preserve the prior state.

Every accepted or invalidated Claim records its evidence, attribution, reviewer, decision, rationale, timestamp, and specification version.

## 6. Current frontier computation

For a scalar Limit under one specification version:

- active accepted lower-bound Claims determine the strongest known lower bound;
- active accepted upper-bound Claims determine the strongest known upper bound;
- an accepted construction contributes to the achievable frontier;
- an accepted exact Claim closes the Limit only when its conditions match the specification;
- a Limit is `PROVEN` only when compatible accepted Claims establish the same value from the required sides, or an exact proof establishes it directly.

Claims from different specification versions are not combined.

For integer-valued quantities, the UI may display logical tightening such as `5 ≤ L ≤ 6`, but the underlying Claims remain unchanged.

V1 does not support Pareto frontiers or claims with multiple independently optimized objectives.

## 7. Canonical entities

Initial tables:

```text
users
limits
limit_spec_versions
claims
papers
people
institutions
evidence
claim_evidence
claim_people
claim_institutions
reviews
timeline_events
corrections
audit_logs
```

### Limit

```text
id
registry_number       # LR-000001; permanent and never reused
slug
title
plain_language_summary
category
subcategory
direction             # MINIMIZE | MAXIMIZE
metric_name
unit
status                # DRAFT | OPEN | PROVEN | DISPUTED | RETIRED
created_at
updated_at
published_at
```

### Specification Version

```text
id
limit_id
version_number
formal_statement
objects_and_domain
constraints
assumptions
scope_notes
finite_n              # nullable
asymptotic            # boolean
probabilistic         # boolean; allowed for representation, not a multi-objective
created_at
supersedes_version_id
```

### Claim

```text
id                    # CLM-000001; permanent and never reused
limit_spec_version_id
claim_type
relation
value_numeric         # arbitrary precision; nullable
value_exact           # rational/scientific/exact text representation
value_text            # nullable display form
unit
scope_parameters      # structured, versioned parameters
epistemic_status
evidence_type
method_summary
status                # DRAFT | UNDER_REVIEW | ACCEPTED | REJECTED | DISPUTED | INVALIDATED
supersedes_claim_id   # nullable
invalidates_claim_id  # nullable
created_at
updated_at
```

Values must support arbitrary-precision decimals, rational numbers, scientific notation, uncertainty, comparison operators, and exact text. Floating point is not authoritative storage.

### Review

```text
id
claim_id
reviewer_user_id
decision              # ACCEPTED | REJECTED | NEEDS_REVISION
rationale
conflict_disclosed
created_at
```

## 8. Editorial requirements

A publication-ready Limit requires:

- stable registry ID and clear title;
- plain-language and formal descriptions;
- one immutable specification version;
- at least one accepted Claim;
- identifiable evidence;
- attribution with explicit roles;
- timeline event;
- visible epistemic status.

An Open Limit should have accepted Claims on both sides where the literature supports them. If one side is unknown, the page must say so explicitly rather than implying a numerical gap.

Editorial review must check units, direction, specification compatibility, numerical parsing, duplicate entities, dates, source identity, attribution, and whether the Claim actually strengthens the frontier.

## 9. Research Console

The private console is the primary V1 product. It supports:

1. Add a paper or source by DOI, URL, arXiv ID, or manual citation.
2. Extract metadata and candidate Claims.
3. Create or select a Limit and Specification Version.
4. Resolve papers, people, and institutions.
5. Attach evidence and locations such as theorem, page, table, or repository path.
6. Compare the candidate against existing Claims.
7. Review contradictions and specification mismatches.
8. Accept, reject, or request revision.
9. Publish the resulting public record.

AI may assist extraction, summarization, entity suggestions, and contradiction detection. All AI output is draft data, schema-validated, stored with model and prompt versions, and reviewed by a human.

## 10. Public V1

Public read access requires no account.

Each Limit page shows the formal question, current derived bounds, specification version, Claim cards, evidence, attribution, timeline, papers, disputes, corrections, and a clear explanation of what is proven versus merely reported.

Initial search covers Limits, Claims, Papers, People, Institutions, categories, and tags. Filters include category, status, direction, epistemic status, finite/asymptotic scope, and date.

## 11. Ten ontology stress tests

Before implementation, model these as fixtures. The schema is not ready if any requires an ad hoc exception.

1. **Exact proven limit** — matching lower and upper mathematical proofs derive `L = 5`.
2. **Open integer gap** — accepted Claims derive `5 ≤ L ≤ 6`.
3. **Asymptotic bound** — a Claim states `L(n) = O(log n)` with explicit asymptotic scope.
4. **Exhaustive computation** — a finite search establishes a bound, with code, version, hash, and run parameters.
5. **Formal machine proof** — a proof assistant artifact supports the Claim and records its system/version.
6. **Invalidated history** — a formerly accepted proof is invalidated; the old Claim and reason remain visible while the frontier recomputes.
7. **Incompatible specifications** — two numerically similar Claims use different constraints and must not combine.
8. **Probabilistic bound** — a Claim includes probability, confidence/error parameters, and quantifier scope rather than pretending to be deterministic.
9. **Construction** — a paper demonstrates an achievable object/value without proving optimality.
10. **Counterexample** — a new accepted counterexample invalidates a universal Claim and links to the affected Claim.

## 12. Explicit non-goals

V1 does not include public user submissions, automated code execution, paid verification, sponsored or private challenges, social features, notifications, external API access, ORCID login, profile claiming, or broad scientific coverage.

These may be reconsidered only after the editorial workflow and Claim model have been used successfully on the launch catalog.

## 13. Build gates

Do not start broad application development until:

1. all ten stress tests are represented in the database model;
2. the current frontier can be derived without manually stored conclusions;
3. invalidation and specification changes preserve history;
4. reviewers can explain every public Claim with linked evidence;
5. 25–40 launch Limits have passed the editorial checklist.
