import { describe, expect, it } from "vitest";
import { buildFrontierHistory } from "./frontier-history";
import type { Claim } from "./types";

const claim = (overrides: Partial<Claim>): Claim => ({
  id: "c", specificationVersionId: "s", claimType: "EXACT_VALUE", relation: "=",
  value: { kind: "text", value: "0" }, status: "ACCEPTED", epistemicStatus: "SOURCE_CONFIRMED",
  evidenceIds: [], author: "test", year: 2020, source: "test", ...overrides,
});

describe("buildFrontierHistory", () => {
  it("returns null for a single equality claim (no real history)", () => {
    expect(buildFrontierHistory([claim({ relation: "=", value: { kind: "text", value: "9.58" }, year: 2009 })])).toBeNull();
  });

  it("returns null when two claims share the exact same year and value (e.g. MIPLIB's matching lower/upper bound)", () => {
    const points = [
      claim({ relation: ">=", value: { kind: "text", value: "302" }, year: 2026 }),
      claim({ relation: "<=", value: { kind: "text", value: "302" }, year: 2026 }),
    ];
    expect(buildFrontierHistory(points)).toBeNull();
  });

  it("rejects prose values with trailing digits instead of misreading a leading number (CAP theorem's '2 of 3 (...)')", () => {
    expect(buildFrontierHistory([claim({ relation: "=", value: { kind: "text", value: "2 of 3 (Consistency, Availability, Partition tolerance)" } })])).toBeNull();
  });

  it("parses CODATA-style whitespace-grouped digits", () => {
    const points = [
      claim({ relation: ">=", value: { kind: "text", value: "6.644 657 3450 e-27" }, year: 2018 }),
      claim({ relation: ">=", value: { kind: "text", value: "6.644 657 3449 e-27" }, year: 2022 }),
    ];
    const history = buildFrontierHistory(points);
    expect(history?.lower).toHaveLength(2);
    expect(history?.lower[0].value).toBeCloseTo(6.6446573450e-27);
  });

  it("accepts a numeric value with a trailing unit as long as no further digits follow", () => {
    const points = [
      claim({ relation: ">=", value: { kind: "text", value: "300 km/h" }, year: 1990 }),
      claim({ relation: ">=", value: { kind: "text", value: "389.5 km/h" }, year: 1999 }),
    ];
    expect(buildFrontierHistory(points)?.lower.map((p) => p.value)).toEqual([300, 389.5]);
  });

  it("builds a real two-point history and sorts chronologically", () => {
    const points = [
      claim({ relation: ">=", value: { kind: "text", value: "43" }, year: 2020 }),
      claim({ relation: ">=", value: { kind: "text", value: "48" }, year: 1997 }),
    ];
    const history = buildFrontierHistory(points);
    expect(history?.lower.map((p) => p.year)).toEqual([1997, 2020]);
  });
});
