import { describe, expect, it } from "vitest";
import { evaluateHypothesis } from "./hypothesis";
import type { Frontier } from "./frontier";

const openFrontier: Frontier = { lowerBound: { kind: "integer", value: 5n }, upperBound: { kind: "integer", value: 7n }, achievable: null, gap: "5 to 7", status: "OPEN", explanation: [], issues: [] };
const noBounds: Frontier = { lowerBound: null, upperBound: null, achievable: null, gap: "Unknown", status: "OPEN", explanation: [], issues: [] };
const closedFrontier: Frontier = { lowerBound: { kind: "integer", value: 5n }, upperBound: { kind: "integer", value: 5n }, achievable: null, gap: "Closed", status: "PROVEN", explanation: [], issues: [] };

describe("evaluateHypothesis", () => {
  it("a tighter upper bound would tighten the frontier", () => {
    expect(evaluateHypothesis(openFrontier, "<=", { kind: "integer", value: 6n }).verdict).toBe("would_tighten");
  });
  it("an upper bound matching the current one is 'matches_known'", () => {
    expect(evaluateHypothesis(openFrontier, "<=", { kind: "integer", value: 7n }).verdict).toBe("matches_known");
  });
  it("a weaker upper bound is not novel", () => {
    expect(evaluateHypothesis(openFrontier, "<=", { kind: "integer", value: 9n }).verdict).toBe("not_novel");
  });
  it("an upper bound below the accepted lower bound contradicts", () => {
    expect(evaluateHypothesis(openFrontier, "<=", { kind: "integer", value: 3n }).verdict).toBe("contradicts");
  });
  it("a lower bound above the accepted upper bound contradicts", () => {
    expect(evaluateHypothesis(openFrontier, ">=", { kind: "integer", value: 9n }).verdict).toBe("contradicts");
  });
  it("any bound would tighten when nothing is accepted yet", () => {
    expect(evaluateHypothesis(noBounds, "<=", { kind: "integer", value: 100n }).verdict).toBe("would_tighten");
  });
  it("a non-numeric bound is not comparable", () => {
    expect(evaluateHypothesis(openFrontier, "<=", { kind: "text", value: "O(n log n)" }).verdict).toBe("not_comparable");
  });
  it("restating a proven closed frontier is not novel", () => {
    expect(evaluateHypothesis(closedFrontier, "=", { kind: "integer", value: 5n }).verdict).toBe("not_novel");
  });
});
