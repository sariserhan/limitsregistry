import { describe, expect, it } from "vitest";
import { deriveFrontierPresentation } from "./frontier-presentation";
import type { Claim } from "./types";
import type { Frontier } from "./frontier";

const claim = (claimType: Claim["claimType"], relation: Claim["relation"], value: string, epistemicStatus: Claim["epistemicStatus"] = "SOURCE_CONFIRMED"): Claim => ({ id: "CLM-1", specificationVersionId: "SP-1", claimType, relation, value: { kind: "text", value }, status: "ACCEPTED", epistemicStatus, evidenceIds: [], author: "Source", year: 2026, source: "Registry" });
const frontier = (lower: string | null, upper: string | null, status: Frontier["status"] = "OPEN"): Frontier => ({ lowerBound: lower ? { kind: "text", value: lower } : null, upperBound: upper ? { kind: "text", value: upper } : null, achievable: null, gap: status === "PROVEN" ? "Closed" : "Unknown", status, explanation: [], issues: [] });

describe("frontier presentation", () => {
  it("shows a fundamental constant once instead of as duplicate bounds", () => expect(deriveFrontierPresentation("FUNDAMENTAL_CONSTANT", [claim("EXACT_VALUE", "=", "299792458 m/s", "PROVEN")], frontier("299792458 m/s", "299792458 m/s", "PROVEN"))).toMatchObject({ mode: "SINGLE_VALUE", label: "Exact defined value" }));
  it("shows a measured constant as a recommended value", () => expect(deriveFrontierPresentation("FUNDAMENTAL_CONSTANT", [claim("EXACT_VALUE", "=", "1.23")], frontier("1.23", "1.23", "PROVEN"))).toMatchObject({ mode: "SINGLE_VALUE", label: "Recommended reference value" }));
  it("uses a neutral label for a source-confirmed equality without a kind", () => expect(deriveFrontierPresentation(undefined, [claim("EXACT_VALUE", "=", "4.6%")], frontier("4.6%", "4.6%", "PROVEN"))).toMatchObject({ mode: "SINGLE_VALUE", label: "Published reference value" }));
  it("shows an observed construction as demonstrated rather than exact", () => expect(deriveFrontierPresentation("EMPIRICAL_FRONTIER", [claim("CONSTRUCTION", "=", "473 genes")], frontier("473 genes", "473 genes", "PROVEN"))).toMatchObject({ mode: "SINGLE_VALUE", label: "Best demonstrated value" }));
  it("collapses independently meeting bounds to an exact optimum", () => expect(deriveFrontierPresentation("OPTIMIZATION", [claim("LOWER_BOUND", ">=", "6"), { ...claim("UPPER_BOUND", "<=", "6"), id: "CLM-2" }], frontier("6", "6", "PROVEN"))).toMatchObject({ mode: "SINGLE_VALUE", label: "Exact established value" }));
  it("preserves a genuine open interval", () => expect(deriveFrontierPresentation("OPTIMIZATION", [claim("LOWER_BOUND", ">=", "5"), { ...claim("UPPER_BOUND", "<=", "7"), id: "CLM-2" }], frontier("5", "7"))).toEqual({ mode: "INTERVAL" }));
  it("shows a one-sided result with the missing side explicit", () => expect(deriveFrontierPresentation("THEORETICAL_BOUND", [claim("LOWER_BOUND", ">=", "5")], frontier("5", null))).toMatchObject({ mode: "ONE_SIDED", unknownLabel: "Upper bound unknown" }));
});
