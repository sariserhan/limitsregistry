export type Direction = "MINIMIZE" | "MAXIMIZE";
export type LimitStatus = "DRAFT" | "OPEN" | "PROVEN" | "DISPUTED" | "RETIRED";
export type ClaimRelation = "<" | "<=" | "=" | ">=" | ">";
export type ClaimStatus = "DRAFT" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "DISPUTED" | "INVALIDATED";
export type ClaimType = "UPPER_BOUND" | "LOWER_BOUND" | "EXACT_VALUE" | "CONSTRUCTION" | "COUNTEREXAMPLE" | "ASYMPTOTIC_BOUND" | "COMPUTATIONAL_BOUND";
export type EpistemicStatus = "LITERATURE_ASSERTED" | "SOURCE_CONFIRMED" | "REPRODUCED" | "PROVEN" | "FORMALLY_PROVEN" | "EMPIRICALLY_SUPPORTED" | "DISPUTED" | "INVALIDATED";

export type ExactValue = { kind: "integer"; value: bigint } | { kind: "rational"; numerator: bigint; denominator: bigint } | { kind: "text"; value: string };

export type Limit = { id: string; title: string; category: string; status: LimitStatus; direction: Direction; summary: string };
export type SpecificationVersion = { id: string; limitId: string; version: number; formalStatement: string; constraints: Record<string, string>; asymptotic: boolean; probabilistic: boolean };
export type Claim = { id: string; specificationVersionId: string; claimType: ClaimType; relation: ClaimRelation; value: ExactValue; status: ClaimStatus; epistemicStatus: EpistemicStatus; evidenceIds: string[]; methodSummary?: string; author: string; year: number; source: string };
export type Evidence = { id: string; type: "PAPER" | "FORMAL_PROOF" | "SOURCE_CODE" | "EXHAUSTIVE_COMPUTATION" | "EXPERIMENT" | "REPRODUCTION"; label: string; location?: string };
export type Review = { id: string; claimId: string; decision: "ACCEPTED" | "REJECTED" | "NEEDS_REVISION"; rationale: string; reviewer: string };
