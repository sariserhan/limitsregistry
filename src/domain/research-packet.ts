import type { Claim, Evidence, Limit, RegistryReviewStatus, ScientificStatus, SpecificationVersion } from "./types";

export type IngestionReadiness = "READY_FOR_EDITORIAL_REVIEW" | "READY_WITH_SPEC_CAVEAT" | "RESEARCH_QUEUE";

export type ResearchPacket = {
  limit: Limit;
  specification: SpecificationVersion;
  claims: Claim[];
  evidence: Evidence[];
  registryReviewStatus: RegistryReviewStatus;
  publicationState?: "DRAFT";
  ingestionReadiness?: IngestionReadiness;
  independentRegistryReviews?: number;
};

const specification: SpecificationVersion = {
  id: "SP-LR-000072-V2",
  limitId: "LR-000072",
  version: 2,
  formalStatement: "χ(R²) is the minimum k such that c:R²→{1,…,k} separates every pair at Euclidean distance 1.",
  constraints: { domain: "R²", distance: "Euclidean", forbiddenDistance: "1", regularity: "none" },
  asymptotic: false,
  probabilistic: false,
};

const claimBase = (id: string, relation: Claim["relation"], value: bigint, claimType: Claim["claimType"], author: string, year: number, source: string, evidenceIds: string[]): Claim => ({
  id, specificationVersionId: specification.id, relation, value: { kind: "integer", value }, claimType, status: "ACCEPTED", epistemicStatus: "SOURCE_CONFIRMED", scientificStatus: "ACCEPTED", registryReviewStatus: "UNREVIEWED", evidenceIds, author, year, source,
});

export const planeColoringResearchPacket: ResearchPacket = {
  limit: { id: "LR-000072", title: "Chromatic Number of the Plane", category: "Discrete Geometry / Graph Theory", status: "OPEN", direction: "MINIMIZE", summary: "The minimum number of colors required to color the Euclidean plane so unit-distance points receive different colors." },
  specification,
  claims: [
    claimBase("CLM-000184", ">=", 5n, "LOWER_BOUND", "Aubrey D. N. J. de Grey", 2018, "The chromatic number of the plane is at least 5", ["EVD-LR072-1"]),
    claimBase("CLM-LR072-UPPER-7", "<=", 7n, "UPPER_BOUND", "John R. Isbell (discovery); Hugo Hadwiger (publication history)", 1950, "Seven-color periodic construction", ["EVD-LR072-2"]),
  ],
  evidence: [
    { id: "EVD-LR072-1", type: "CONSTRUCTION", method: "FINITE_UNIT_DISTANCE_GRAPH", verificationLevel: "SOURCE_CONFIRMED", label: "de Grey 2018 finite non-4-colorable construction", sourceUrl: "https://arxiv.org/abs/1804.02385" },
    { id: "EVD-LR072-2", type: "CONSTRUCTION", method: "PERIODIC_SEVEN_COLORING", verificationLevel: "SOURCE_CONFIRMED", label: "Seven-color periodic hexagonal coloring", attribution: { discoveryAttribution: "John R. Isbell", discoveryYear: "1950", publicationAttribution: "separate", attributionNote: "Isbell's application appears to have been unpublished; later sources establish the historical attribution." } },
  ],
  registryReviewStatus: "UNREVIEWED",
};

export const researchPacketStatuses = { scientific: "ACCEPTED" as ScientificStatus, registry: "UNREVIEWED" as RegistryReviewStatus };
