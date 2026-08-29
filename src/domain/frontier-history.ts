import type { Claim } from "./types";

export type FrontierHistoryPoint = { year: number; value: number };
export type FrontierHistory = { lower: FrontierHistoryPoint[]; upper: FrontierHistoryPoint[] };

// ExactValue text can carry CODATA-style digit grouping ("6.644 657 3450 e-27") or non-numeric
// prose ("2 of 3 (Consistency, ...)", "1:59:30") — strip whitespace and try a straight parse
// first, then fall back to the leading numeric token; genuinely non-numeric values return null.
function parseNumericValue(value: Claim["value"]): number | null {
  if (!value) return null;
  if (value.kind === "integer") { const n = Number(value.value); return Number.isFinite(n) ? n : null; }
  if (value.kind === "rational") { const n = Number(value.numerator) / Number(value.denominator); return Number.isFinite(n) ? n : null; }
  const cleaned = value.value.replace(/\s+/g, "");
  const direct = Number(cleaned);
  if (Number.isFinite(direct)) return direct;
  const match = cleaned.match(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i);
  if (!match) return null;
  const fallback = Number(match[0]);
  return Number.isFinite(fallback) ? fallback : null;
}

// Builds two chronological series (achievable/lower and impossibility/upper) from a Limit's
// accepted Claims, for the frontier-history chart on the canonical record page. An "=" claim
// contributes to both series (the point where they coincide). Returns null when there aren't at
// least 2 distinct numeric points to plot — most records only ever get one accepted Claim, and a
// single dot isn't a history worth charting.
export function buildFrontierHistory(claims: Claim[]): FrontierHistory | null {
  const lower: FrontierHistoryPoint[] = [];
  const upper: FrontierHistoryPoint[] = [];
  for (const claim of claims) {
    const value = parseNumericValue(claim.value);
    if (value === null) continue;
    const point = { year: claim.year, value };
    if (claim.relation === ">=" || claim.relation === ">" || claim.relation === "=") lower.push(point);
    if (claim.relation === "<=" || claim.relation === "<" || claim.relation === "=") upper.push(point);
  }
  lower.sort((a, b) => a.year - b.year);
  upper.sort((a, b) => a.year - b.year);
  if (lower.length + upper.length < 2) return null;
  return { lower, upper };
}
