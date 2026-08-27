import { describe, expect, it } from "vitest";
import { validateClaim } from "./validation";
import type { Claim, SpecificationVersion } from "./types";

const specification: SpecificationVersion = { id: "SP-1", limitId: "LR-1", version: 1, formalStatement: "Fixture", constraints: {}, asymptotic: false, probabilistic: false };
const claim: Claim = { id: "CLM-1", specificationVersionId: "SP-1", claimType: "UPPER_BOUND", relation: "<=", value: { kind: "integer", value: BigInt(5) }, status: "ACCEPTED", epistemicStatus: "PROVEN", evidenceIds: [], author: "Fixture", year: 2025, source: "Fixture" };

describe("validateClaim", () => {
  it("requires evidence for accepted claims", () => expect(validateClaim(claim, specification).map((issue) => issue.code)).toContain("MISSING_EVIDENCE"));
  it("rejects claims from another specification", () => expect(validateClaim({ ...claim, specificationVersionId: "SP-2" }, specification).map((issue) => issue.code)).toContain("SPECIFICATION_MISMATCH"));
});
