import "server-only";
import { generateObject } from "ai";
import { z } from "zod";

export const EXTRACTION_MODEL = "anthropic/claude-sonnet-5";
export const EXTRACTION_PROMPT_VERSION = "candidate-claims-v1";

export const candidateClaimSchema = z.object({
  claims: z.array(z.object({
    claimType: z.enum(["UPPER_BOUND", "LOWER_BOUND", "EXACT_VALUE", "CONSTRUCTION", "COUNTEREXAMPLE", "ASYMPTOTIC_BOUND", "COMPUTATIONAL_BOUND"]),
    relation: z.enum(["<", "<=", "=", ">=", ">"]),
    valueText: z.string().describe("The value as stated in the source, e.g. '5' or 'O(log n)'."),
    unit: z.string().nullable(),
    quantityDescription: z.string().describe("Plain-language description of what is being bounded."),
    methodSummary: z.string().nullable(),
    confidence: z.number().min(0).max(1),
  })),
});
export type CandidateClaimExtraction = z.infer<typeof candidateClaimSchema>;

/**
 * Draft-only extraction. Per AGENTS/spec: AI may draft candidate Claims but
 * never publishes them directly — callers must store the result as a
 * candidate_claims row for human review, never insert into `claims`.
 */
export async function extractCandidateClaims(paper: { title: string; abstract: string }): Promise<CandidateClaimExtraction> {
  const { object } = await generateObject({
    model: EXTRACTION_MODEL,
    schema: candidateClaimSchema,
    prompt: `Extract candidate quantitative claims (bounds, exact values, constructions) from this paper's title and abstract. Only extract claims the abstract actually states; do not invent numbers.\n\nTitle: ${paper.title}\n\nAbstract: ${paper.abstract}`,
  });
  return object;
}
