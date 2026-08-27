import type { Claim, SpecificationVersion } from "./types";

export type ValidationIssue = { code: string; message: string; severity: "ERROR" | "WARNING" };

export function validateClaim(claim: Claim, specification: SpecificationVersion): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (claim.specificationVersionId !== specification.id) issues.push({ code: "SPECIFICATION_MISMATCH", message: "Claim belongs to a different specification version.", severity: "ERROR" });
  if (claim.status === "ACCEPTED" && claim.evidenceIds.length === 0) issues.push({ code: "MISSING_EVIDENCE", message: "Accepted Claims must link to at least one evidence item.", severity: "ERROR" });
  if (specification.asymptotic && claim.claimType !== "ASYMPTOTIC_BOUND" && claim.value.kind === "integer") issues.push({ code: "ASYMPTOTIC_NUMERIC_CLAIM", message: "An asymptotic specification should identify its function or scope.", severity: "WARNING" });
  if (specification.probabilistic && !claim.methodSummary) issues.push({ code: "MISSING_PROBABILITY_SCOPE", message: "Probabilistic Claims must document probability or quantifier scope.", severity: "WARNING" });
  return issues;
}

export function validateClaimSet(claims: Claim[], specification: SpecificationVersion): ValidationIssue[] { return claims.flatMap((claim) => validateClaim(claim, specification)); }
