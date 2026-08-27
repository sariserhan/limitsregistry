import { compareExact, deriveFrontier } from "./frontier";
import type { Claim, Direction, ExactValue, SpecificationVersion } from "./types";

export type BreakthroughEventType = "STRONGER_BOUND" | "FRONTIER_CLOSED";
export type BreakthroughDetection = { eventType: BreakthroughEventType; detail: string };

function display(value: ExactValue | null): string {
  if (!value) return "?";
  if (value.kind === "integer") return value.value.toString();
  if (value.kind === "rational") return `${value.numerator}/${value.denominator}`;
  return value.value;
}

// after is an improvement over before when it's strictly better in the wanted direction, or
// when there was no prior bound at all (new information). Non-numeric (text/asymptotic) bounds
// can't be compared, so they never register as an improvement here.
function improved(before: ExactValue | null, after: ExactValue | null, wantHigher: boolean): boolean {
  if (!after) return false;
  if (!before) return true;
  const cmp = compareExact(after, before);
  if (cmp === null) return false;
  return wantHigher ? cmp === 1 : cmp === -1;
}

/**
 * Detects breakthrough events caused by a single Claim's transition into ACCEPTED, by comparing
 * the frontier with and without it. Only ever called for a Claim already in `allClaims` with
 * status "ACCEPTED" — draft/under-review/rejected/disputed/invalidated Claims can't trigger
 * anything (deriveFrontier already excludes non-ACCEPTED claims from both computations, and the
 * explicit status guard below is a second, cheaper line of defense against a caller mistake).
 * A frontier that comes out DISPUTED is a contradiction requiring editorial review, never a
 * breakthrough, even if some individual bound technically "improved" on paper.
 */
export function detectBreakthroughs(direction: Direction, specification: SpecificationVersion, allClaims: Claim[], acceptedClaim: Claim): BreakthroughDetection[] {
  if (acceptedClaim.status !== "ACCEPTED") return [];

  const priorClaims = allClaims.filter((c) => c.id !== acceptedClaim.id);
  const priorFrontier = deriveFrontier(direction, specification, priorClaims);
  const newFrontier = deriveFrontier(direction, specification, allClaims);
  if (newFrontier.status === "DISPUTED") return [];

  const events: BreakthroughDetection[] = [];

  if (improved(priorFrontier.lowerBound, newFrontier.lowerBound, true)) events.push({ eventType: "STRONGER_BOUND", detail: `Lower bound tightened to ${display(newFrontier.lowerBound)}.` });
  if (improved(priorFrontier.upperBound, newFrontier.upperBound, false)) events.push({ eventType: "STRONGER_BOUND", detail: `Upper bound tightened to ${display(newFrontier.upperBound)}.` });
  // achievable direction mirrors deriveFrontier's own betterLower/betterUpper choice by direction.
  if (improved(priorFrontier.achievable, newFrontier.achievable, direction === "MAXIMIZE")) events.push({ eventType: "STRONGER_BOUND", detail: `New construction achieves ${display(newFrontier.achievable)}.` });

  if (priorFrontier.status !== "PROVEN" && newFrontier.status === "PROVEN") events.push({ eventType: "FRONTIER_CLOSED", detail: `Frontier closed at ${newFrontier.gap}.` });

  return events;
}
