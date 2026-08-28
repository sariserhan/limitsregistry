import type { Claim, Direction, ExactValue, LimitStatus, SpecificationVersion } from "./types";

export type Frontier = { lowerBound: ExactValue | null; upperBound: ExactValue | null; achievable: ExactValue | null; gap: string; status: LimitStatus; explanation: string[]; issues: string[] };

export function compareExact(left: ExactValue, right: ExactValue): -1 | 0 | 1 | null {
  if (left.kind === "text" || right.kind === "text") return null;
  const ln = left.kind === "integer" ? left.value : left.numerator;
  const ld = left.kind === "integer" ? 1n : left.denominator;
  const rn = right.kind === "integer" ? right.value : right.numerator;
  const rd = right.kind === "integer" ? 1n : right.denominator;
  const difference = ln * rd - rn * ld;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

export function relationSatisfied(value: ExactValue, relation: Claim["relation"], bound: ExactValue): boolean | null {
  const comparison = compareExact(value, bound);
  if (comparison === null) return null;
  if (relation === "<") return comparison < 0;
  if (relation === "<=") return comparison <= 0;
  if (relation === ">") return comparison > 0;
  if (relation === ">=") return comparison >= 0;
  return comparison === 0;
}

// compareExact can't order two text-kind bounds (asymptotic notation, algebraic formulas aren't
// numerically comparable without symbolic math), so it always returns null for them — which meant
// a ">=" and "<=" claim asserting the identical formula could never close the frontier, even though
// string-identical bounds obviously meet. This only ever reports equality, never a mismatch as
// DISPUTED: two differently-written formulas could still be mathematically equivalent, so a string
// mismatch is "unknown", not "impossible".
function textBoundsEqual(left: ExactValue, right: ExactValue): boolean {
  return left.kind === "text" && right.kind === "text" && left.value.trim() === right.value.trim();
}

function toNumber(value: ExactValue | null): number | null {
  if (!value) return null;
  if (value.kind === "integer") return Number(value.value);
  if (value.kind === "rational") return Number(value.numerator) / Number(value.denominator);
  return null;
}

function display(value: ExactValue | null): string { if (!value) return "?"; if (value.kind === "integer") return value.value.toString(); if (value.kind === "rational") return `${value.numerator}/${value.denominator}`; return value.value; }

function betterLower(current: ExactValue | null, next: ExactValue): ExactValue { if (!current) return next; return compareExact(next, current) === 1 ? next : current; }
function betterUpper(current: ExactValue | null, next: ExactValue): ExactValue { if (!current) return next; return compareExact(next, current) === -1 ? next : current; }

export function deriveFrontier(direction: Direction, specification: SpecificationVersion, claims: Claim[]): Frontier {
  const active = claims.filter((claim) => claim.specificationVersionId === specification.id && claim.status === "ACCEPTED" && claim.scientificStatus !== "UNCERTAIN");
  let lowerBound: ExactValue | null = null;
  let upperBound: ExactValue | null = null;
  let achievable: ExactValue | null = null;
  const explanation: string[] = [];
  const issues: string[] = [];

  for (const claim of active) {
    if (claim.relation === ">=" || claim.relation === ">") lowerBound = betterLower(lowerBound, claim.value);
    if (claim.relation === "<=" || claim.relation === "<") upperBound = betterUpper(upperBound, claim.value);
    // An exact-value claim ("=") is simultaneously its own tightest lower and upper bound — without
    // this, a limit whose only claim is EXACT_VALUE never closes its frontier and displays "?" for
    // both bounds despite genuinely being a proven, exact record.
    if (claim.relation === "=") { lowerBound = betterLower(lowerBound, claim.value); upperBound = betterUpper(upperBound, claim.value); }
    if (claim.claimType === "CONSTRUCTION" || claim.claimType === "EXACT_VALUE") achievable = direction === "MAXIMIZE" ? betterLower(achievable, claim.value) : betterUpper(achievable, claim.value);
  }

  const lower = toNumber(lowerBound);
  const upper = toNumber(upperBound);
  const comparison = lowerBound && upperBound ? compareExact(lowerBound, upperBound) : null;
  const textClosed = comparison === null && !!lowerBound && !!upperBound && textBoundsEqual(lowerBound, upperBound);
  const inconsistent = comparison === 1;
  if (inconsistent) {
    issues.push("LOWER_BOUND_EXCEEDS_UPPER_BOUND");
    explanation.push("Accepted Claims produce an impossible frontier and require editorial review.");
  }
  const closed = !inconsistent && (comparison === 0 || textClosed);
  if (lowerBound) explanation.push(`Strongest accepted lower bound: ${display(lowerBound)}.`);
  if (upperBound) explanation.push(`Strongest accepted upper bound: ${display(upperBound)}.`);
  if (!lowerBound && !upperBound) explanation.push("No accepted numeric bounds exist for this specification.");
  return { lowerBound, upperBound, achievable, gap: closed ? "Closed" : lower !== null && upper !== null ? `${display(lowerBound)} to ${display(upperBound)}` : "Unknown", status: inconsistent ? "DISPUTED" : closed ? "PROVEN" : "OPEN", explanation, issues };
}
