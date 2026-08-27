import type { Claim, Direction, ExactValue, LimitStatus, SpecificationVersion } from "./types";

export type Frontier = { lowerBound: ExactValue | null; upperBound: ExactValue | null; achievable: ExactValue | null; gap: string; status: LimitStatus; explanation: string[] };

function toNumber(value: ExactValue | null): number | null {
  if (!value) return null;
  if (value.kind === "integer") return Number(value.value);
  if (value.kind === "rational") return Number(value.numerator) / Number(value.denominator);
  return null;
}

function display(value: ExactValue | null): string { if (!value) return "?"; if (value.kind === "integer") return value.value.toString(); if (value.kind === "rational") return `${value.numerator}/${value.denominator}`; return value.value; }

function betterLower(current: ExactValue | null, next: ExactValue): ExactValue { if (!current) return next; return (toNumber(next) ?? -Infinity) > (toNumber(current) ?? -Infinity) ? next : current; }
function betterUpper(current: ExactValue | null, next: ExactValue): ExactValue { if (!current) return next; return (toNumber(next) ?? Infinity) < (toNumber(current) ?? Infinity) ? next : current; }

export function deriveFrontier(direction: Direction, specification: SpecificationVersion, claims: Claim[]): Frontier {
  const active = claims.filter((claim) => claim.specificationVersionId === specification.id && claim.status === "ACCEPTED");
  let lowerBound: ExactValue | null = null;
  let upperBound: ExactValue | null = null;
  let achievable: ExactValue | null = null;
  const explanation: string[] = [];

  for (const claim of active) {
    if (claim.relation === ">=" || claim.relation === ">") lowerBound = betterLower(lowerBound, claim.value);
    if (claim.relation === "<=" || claim.relation === "<") upperBound = betterUpper(upperBound, claim.value);
    if (claim.claimType === "CONSTRUCTION" || claim.claimType === "EXACT_VALUE") achievable = direction === "MAXIMIZE" ? betterLower(achievable, claim.value) : betterUpper(achievable, claim.value);
  }

  const lower = toNumber(lowerBound); const upper = toNumber(upperBound);
  const closed = lower !== null && upper !== null && lower === upper;
  if (lowerBound) explanation.push(`Strongest accepted lower bound: ${display(lowerBound)}.`);
  if (upperBound) explanation.push(`Strongest accepted upper bound: ${display(upperBound)}.`);
  if (!lowerBound && !upperBound) explanation.push("No accepted numeric bounds exist for this specification.");
  return { lowerBound, upperBound, achievable, gap: closed ? "Closed" : lower !== null && upper !== null ? `${display(lowerBound)} to ${display(upperBound)}` : "Unknown", status: closed ? "PROVEN" : "OPEN", explanation };
}
