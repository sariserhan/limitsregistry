export type BoundClaim = { relation: "<" | "<=" | "=" | ">=" | ">"; valueNumeric: number };

/**
 * Cheap numeric check used by the Research Console to warn editors before a
 * candidate claim is promoted. It is not the authoritative frontier
 * computation (see domain/frontier.ts, which runs on accepted Claims only).
 */
export function detectContradiction(existingAccepted: BoundClaim[], candidate: BoundClaim): string | null {
  const isLower = (r: BoundClaim["relation"]) => r === ">=" || r === ">";
  const isUpper = (r: BoundClaim["relation"]) => r === "<=" || r === "<";

  if (candidate.relation === "=") {
    const conflict = existingAccepted.find((c) => c.relation === "=" && c.valueNumeric !== candidate.valueNumeric);
    if (conflict) return `Conflicts with an existing accepted exact value (${conflict.valueNumeric}).`;
  }

  if (isLower(candidate.relation)) {
    const conflict = existingAccepted.find((c) => isUpper(c.relation) && c.valueNumeric < candidate.valueNumeric);
    if (conflict) return `Exceeds an existing accepted upper bound (${conflict.valueNumeric}).`;
  }

  if (isUpper(candidate.relation)) {
    const conflict = existingAccepted.find((c) => isLower(c.relation) && c.valueNumeric > candidate.valueNumeric);
    if (conflict) return `Falls below an existing accepted lower bound (${conflict.valueNumeric}).`;
  }

  return null;
}
