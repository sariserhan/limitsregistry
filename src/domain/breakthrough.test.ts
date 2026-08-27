import { describe, expect, it } from "vitest";
import { detectBreakthroughs } from "./breakthrough";
import type { Claim, SpecificationVersion } from "./types";

const spec: SpecificationVersion = { id: "SP-BT", limitId: "LR-BT", version: 1, formalStatement: "Breakthrough fixture", constraints: {}, asymptotic: false, probabilistic: false };

const makeClaim = (id: string, relation: Claim["relation"], value: bigint, status: Claim["status"], claimType: Claim["claimType"] = "UPPER_BOUND"): Claim => ({
  id, specificationVersionId: spec.id, claimType, relation, value: { kind: "integer", value }, status, epistemicStatus: "PROVEN", evidenceIds: [], author: "Fixture", year: 2025, source: "Fixture",
});

describe("detectBreakthroughs", () => {
  it("a tighter accepted upper bound is a stronger-bound event", () => {
    const prior = makeClaim("A", ">=", 5n, "ACCEPTED", "LOWER_BOUND");
    const next = makeClaim("B", "<=", 6n, "ACCEPTED");
    const events = detectBreakthroughs("MAXIMIZE", spec, [prior, next], next);
    expect(events.some((e) => e.eventType === "STRONGER_BOUND")).toBe(true);
  });

  it("bounds meeting exactly is a frontier-closed event", () => {
    const prior = makeClaim("A", ">=", 5n, "ACCEPTED", "LOWER_BOUND");
    const next = makeClaim("B", "<=", 5n, "ACCEPTED");
    const events = detectBreakthroughs("MAXIMIZE", spec, [prior, next], next);
    expect(events.some((e) => e.eventType === "FRONTIER_CLOSED")).toBe(true);
  });

  it("a DRAFT claim never triggers an event, even if it would otherwise tighten the frontier", () => {
    const prior = makeClaim("A", ">=", 5n, "ACCEPTED", "LOWER_BOUND");
    const next = makeClaim("B", "<=", 6n, "DRAFT");
    expect(detectBreakthroughs("MAXIMIZE", spec, [prior, next], next)).toEqual([]);
  });

  it("an UNDER_REVIEW claim never triggers an event", () => {
    const prior = makeClaim("A", ">=", 5n, "ACCEPTED", "LOWER_BOUND");
    const next = makeClaim("B", "<=", 6n, "UNDER_REVIEW");
    expect(detectBreakthroughs("MAXIMIZE", spec, [prior, next], next)).toEqual([]);
  });

  it("an accepted claim that produces a contradictory (DISPUTED) frontier never triggers an event", () => {
    const prior = makeClaim("A", ">=", 10n, "ACCEPTED", "LOWER_BOUND");
    const next = makeClaim("B", "<=", 4n, "ACCEPTED");
    expect(detectBreakthroughs("MAXIMIZE", spec, [prior, next], next)).toEqual([]);
  });

  it("a weaker accepted bound is not a breakthrough", () => {
    const prior = makeClaim("A", "<=", 5n, "ACCEPTED");
    const next = makeClaim("B", "<=", 9n, "ACCEPTED");
    expect(detectBreakthroughs("MAXIMIZE", spec, [prior, next], next)).toEqual([]);
  });

  it("a new construction improving the achievable value is a stronger-bound event", () => {
    const next = makeClaim("A", ">=", 4n, "ACCEPTED", "CONSTRUCTION");
    const events = detectBreakthroughs("MAXIMIZE", spec, [next], next);
    expect(events.some((e) => e.eventType === "STRONGER_BOUND" && e.detail.includes("construction"))).toBe(true);
  });
});
