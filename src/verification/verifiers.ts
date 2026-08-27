export type VerifierType = "EXACT_VALUE" | "BOUNDED_INTEGER_SEARCH";
export type VerificationResult = { status: "PASSED" | "FAILED" | "REJECTED"; verifierType: VerifierType; message: string; checkedAt: string };

/** V3 verifier boundary: only deterministic built-ins are permitted; no user code is executed. */
export function verify(type: VerifierType, input: Record<string, unknown>): VerificationResult {
  const checkedAt = new Date().toISOString();
  if (type === "EXACT_VALUE") { const expected = input.expected; const actual = input.actual; return { status: expected === actual ? "PASSED" : "FAILED", verifierType: type, message: expected === actual ? "Values match exactly." : "Values do not match.", checkedAt }; }
  if (type === "BOUNDED_INTEGER_SEARCH") { const lower = input.lower; const upper = input.upper; const valid = typeof lower === "number" && typeof upper === "number" && Number.isInteger(lower) && Number.isInteger(upper) && lower <= upper && upper - lower <= 1000000; return { status: valid ? "PASSED" : "REJECTED", verifierType: type, message: valid ? "Bounded search input accepted." : "Search must be an integer interval of at most one million values.", checkedAt }; }
  return { status: "REJECTED", verifierType: type, message: "Verifier type is not approved.", checkedAt };
}
