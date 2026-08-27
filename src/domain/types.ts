export type Direction = "MINIMIZE" | "MAXIMIZE";
export type LimitKind = "OPTIMIZATION" | "FUNDAMENTAL_CONSTANT" | "THEORETICAL_BOUND" | "EMPIRICAL_FRONTIER" | "OBSERVED_RECORD";
export type LimitStatus = "DRAFT" | "OPEN" | "PROVEN" | "DISPUTED" | "RETIRED";
export type ClaimRelation = "<" | "<=" | "=" | ">=" | ">";
export type ClaimStatus = "DRAFT" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "DISPUTED" | "INVALIDATED";
export type ScientificStatus = "ACCEPTED" | "DISPUTED" | "INVALIDATED" | "UNCERTAIN";
export type RegistryReviewStatus = "UNREVIEWED" | "SCREENING" | "ACCEPTED" | "REJECTED" | "NEEDS_EXPERT";
export type VerificationLevel = "REPORTED" | "SOURCE_CONFIRMED" | "INDEPENDENTLY_REPRODUCED" | "MACHINE_CHECKED";
export type ClaimType = "UPPER_BOUND" | "LOWER_BOUND" | "EXACT_VALUE" | "CONSTRUCTION" | "COUNTEREXAMPLE" | "ASYMPTOTIC_BOUND" | "COMPUTATIONAL_BOUND";
export type EpistemicStatus = "LITERATURE_ASSERTED" | "SOURCE_CONFIRMED" | "REPRODUCED" | "PROVEN" | "FORMALLY_PROVEN" | "EMPIRICALLY_SUPPORTED" | "DISPUTED" | "INVALIDATED";

export type ExactValue = { kind: "integer"; value: bigint } | { kind: "rational"; numerator: bigint; denominator: bigint } | { kind: "text"; value: string };

export type Limit = { id: string; title: string; category: string; status: LimitStatus; direction: Direction; summary: string; limitKind?: LimitKind };
export type SpecificationVersion = { id: string; limitId: string; version: number; formalStatement: string; constraints: Record<string, string>; asymptotic: boolean; probabilistic: boolean };
export type Claim = { id: string; specificationVersionId: string; claimType: ClaimType; relation: ClaimRelation; value: ExactValue; status: ClaimStatus; epistemicStatus: EpistemicStatus; scientificStatus?: ScientificStatus; registryReviewStatus?: RegistryReviewStatus; evidenceIds: string[]; methodSummary?: string; author: string; year: number; source: string };
export type EvidenceType = "CONSTRUCTION" | "MATHEMATICAL_PROOF" | "COMPUTATIONAL_PROOF" | "FORMAL_PROOF" | "EXPERIMENT" | "REPRODUCTION" | "DATASET" | "COUNTEREXAMPLE" | "PAPER";
export type Evidence = { id: string; type: EvidenceType; label: string; method?: string; verificationLevel?: VerificationLevel; location?: string; sourceUrl?: string; attribution?: Record<string, string> };
export type Review = { id: string; claimId: string; decision: "ACCEPTED" | "REJECTED" | "NEEDS_REVISION"; rationale: string; reviewer: string };
