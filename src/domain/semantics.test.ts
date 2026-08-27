import { describe, expect, it } from "vitest";
import { compareExact, relationSatisfied } from "./frontier";
import { formatGap } from "./semantics";
import type { Claim } from "./types";
const integer = (value: bigint): Claim["value"] => ({ kind: "integer", value });
const rational = (numerator: bigint, denominator: bigint): Claim["value"] => ({ kind: "rational", numerator, denominator });
const claim = (relation: Claim["relation"], value: Claim["value"]): Claim => ({ id: relation, specificationVersionId: "SP", claimType: "UPPER_BOUND", relation, value, status: "ACCEPTED", epistemicStatus: "PROVEN", evidenceIds: ["E"], author: "Fixture", year: 2025, source: "Fixture" });
describe("exact bound semantics", () => {
  it("compares rationals exactly", () => expect(compareExact(rational(1n, 3n), rational(2n, 6n))).toBe(0));
  it("compares scientific-notation values normalized as rationals", () => expect(compareExact(rational(15n, 10n), integer(1n))).toBe(1));
  it("keeps strict inequalities open", () => { expect(relationSatisfied(integer(5n), "<", integer(5n))).toBe(false); expect(relationSatisfied(integer(5n), "<=", integer(5n))).toBe(true); });
  it("renders strict integer gaps distinctly", () => expect(formatGap(claim(">", integer(5n)), claim("<", integer(8n)))).toBe("> 5 to < 8"));
});
