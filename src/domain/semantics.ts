import type { Claim, ExactValue } from "./types";
import { compareExact } from "./frontier";

export function formatBound(relation: Claim["relation"], value: ExactValue): string {
  const rendered = value.kind === "integer" ? value.value.toString() : value.kind === "rational" ? `${value.numerator}/${value.denominator}` : value.value;
  return `${relation} ${rendered}`;
}

export function formatGap(lower: Claim | null, upper: Claim | null): string {
  if (!lower || !upper) return "Unknown";
  if (compareExact(lower.value, upper.value) === 0 && lower.relation === ">=" && upper.relation === "<=") return "Closed";
  return `${formatBound(lower.relation, lower.value)} to ${formatBound(upper.relation, upper.value)}`;
}
