import { compareExact, type Frontier } from "./frontier";
import type { ClaimRelation, ExactValue } from "./types";

export type HypothesisVerdict = "would_tighten" | "matches_known" | "not_novel" | "contradicts" | "not_comparable";

export type HypothesisResult = { verdict: HypothesisVerdict; explanation: string };

function display(value: ExactValue): string {
  if (value.kind === "integer") return value.value.toString();
  if (value.kind === "rational") return `${value.numerator}/${value.denominator}`;
  return value.value;
}

/**
 * Checks a hypothetical bound against a Limit's current ACCEPTED frontier — never against
 * DRAFT or candidate claims, since those aren't facts yet. Used by the MCP verify_claim tool
 * so an external AI gets "would tighten / already known / contradicts", not a guess.
 */
export function evaluateHypothesis(frontier: Frontier, relation: ClaimRelation, value: ExactValue): HypothesisResult {
  const isUpperClaim = relation === "<=" || relation === "<";
  const isLowerClaim = relation === ">=" || relation === ">";

  if (isUpperClaim) {
    if (frontier.lowerBound) {
      const cmpLower = compareExact(value, frontier.lowerBound);
      if (cmpLower === -1) return { verdict: "contradicts", explanation: `Below the accepted lower bound (${display(frontier.lowerBound)}) — impossible under the current specification.` };
    }
    if (!frontier.upperBound) return { verdict: "would_tighten", explanation: "No accepted upper bound exists yet for this specification — this would be a new result." };
    const cmp = compareExact(value, frontier.upperBound);
    if (cmp === null) return { verdict: "not_comparable", explanation: "The current upper bound is non-numeric (asymptotic/text) — cannot compare automatically." };
    if (cmp < 0) return { verdict: "would_tighten", explanation: `Would tighten the current upper bound (${display(frontier.upperBound)}).` };
    if (cmp === 0) return { verdict: "matches_known", explanation: `Matches the current best known upper bound (${display(frontier.upperBound)}).` };
    return { verdict: "not_novel", explanation: `Weaker than the current known upper bound (${display(frontier.upperBound)}) — not novel.` };
  }

  if (isLowerClaim) {
    if (frontier.upperBound) {
      const cmpUpper = compareExact(value, frontier.upperBound);
      if (cmpUpper === 1) return { verdict: "contradicts", explanation: `Above the accepted upper bound (${display(frontier.upperBound)}) — impossible under the current specification.` };
    }
    if (!frontier.lowerBound) return { verdict: "would_tighten", explanation: "No accepted lower bound exists yet for this specification — this would be a new result." };
    const cmp = compareExact(value, frontier.lowerBound);
    if (cmp === null) return { verdict: "not_comparable", explanation: "The current lower bound is non-numeric (asymptotic/text) — cannot compare automatically." };
    if (cmp > 0) return { verdict: "would_tighten", explanation: `Would tighten the current lower bound (${display(frontier.lowerBound)}).` };
    if (cmp === 0) return { verdict: "matches_known", explanation: `Matches the current best known lower bound (${display(frontier.lowerBound)}).` };
    return { verdict: "not_novel", explanation: `Weaker than the current known lower bound (${display(frontier.lowerBound)}) — not novel.` };
  }

  // relation === "="
  if (frontier.lowerBound) {
    const cmpLower = compareExact(value, frontier.lowerBound);
    if (cmpLower !== null && cmpLower < 0) return { verdict: "contradicts", explanation: `Below the accepted lower bound (${display(frontier.lowerBound)}) — impossible.` };
  }
  if (frontier.upperBound) {
    const cmpUpper = compareExact(value, frontier.upperBound);
    if (cmpUpper !== null && cmpUpper > 0) return { verdict: "contradicts", explanation: `Above the accepted upper bound (${display(frontier.upperBound)}) — impossible.` };
  }
  if (frontier.status === "PROVEN") return { verdict: "not_novel", explanation: `The frontier is already closed at ${frontier.gap} — this doesn't add new information.` };
  return { verdict: "would_tighten", explanation: "Consistent with current accepted bounds and would close or narrow the frontier if proven." };
}
