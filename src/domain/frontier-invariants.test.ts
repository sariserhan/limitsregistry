import { describe, expect, it } from "vitest";
import { deriveFrontier } from "./frontier";
import type { Claim, SpecificationVersion } from "./types";

const spec: SpecificationVersion = { id: "SP-INVARIANT", limitId: "LR-INVARIANT", version: 1, formalStatement: "Invariant fixture", constraints: {}, asymptotic: false, probabilistic: false };
const numericClaim = (id: string, relation: Claim["relation"], value: bigint): Claim => ({ id, specificationVersionId: spec.id, claimType: "UPPER_BOUND", relation, value: { kind: "integer", value }, status: "ACCEPTED", epistemicStatus: "PROVEN", evidenceIds: ["EVIDENCE-1"], author: "Fixture", year: 2025, source: "Fixture" });

describe("frontier invariants", () => {
  it("marks contradictory accepted bounds as disputed", () => {
    const frontier = deriveFrontier("MAXIMIZE", spec, [numericClaim("LOW", ">=", 10n), numericClaim("HIGH", "<=", 4n)]);
    expect(frontier.status).toBe("DISPUTED");
    expect(frontier.issues).toContain("LOWER_BOUND_EXCEEDS_UPPER_BOUND");
  });
});
