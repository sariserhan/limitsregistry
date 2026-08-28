import type { Frontier } from "./frontier";
import type { Claim } from "./types";

export type FrontierPresentation =
  | { mode: "SINGLE_VALUE"; label: string; value: Claim["value"]; note: string }
  | { mode: "ONE_SIDED"; label: string; value: Claim["value"] | null; unknownLabel: string }
  | { mode: "INTERVAL" };

const observedKinds = new Set(["EMPIRICAL_FRONTIER", "OBSERVED_RECORD", "MODEL_DEPENDENT_OR_OBSERVED_FRONTIER", "ENGINEERING_CRITERION"]);

export function deriveFrontierPresentation(kind: string | undefined, claims: Claim[], frontier: Frontier): FrontierPresentation {
  const accepted = claims.filter((claim) => claim.status === "ACCEPTED");
  const equalities = accepted.filter((claim) => claim.relation === "=");
  if (equalities.length === 1 && accepted.length === 1) {
    const claim = equalities[0];
    if (kind === "FUNDAMENTAL_CONSTANT") return { mode: "SINGLE_VALUE", label: claim.epistemicStatus === "PROVEN" || claim.epistemicStatus === "FORMALLY_PROVEN" ? "Exact defined value" : "Recommended reference value", value: claim.value, note: "A published value under the current specification, not two opposing bounds." };
    if (observedKinds.has(kind ?? "") || claim.claimType === "CONSTRUCTION") return { mode: "SINGLE_VALUE", label: "Best demonstrated value", value: claim.value, note: "An observed or demonstrated result; no opposing bound is implied." };
    if (claim.claimType === "ASYMPTOTIC_BOUND") return { mode: "SINGLE_VALUE", label: "Scaling relation", value: claim.value, note: "A parameterized or asymptotic result under the current specification." };
    if (claim.claimType === "COUNTEREXAMPLE") return { mode: "SINGLE_VALUE", label: "Established result", value: claim.value, note: "A theorem result rather than a numeric optimization interval." };
    if (claim.epistemicStatus !== "PROVEN" && claim.epistemicStatus !== "FORMALLY_PROVEN") return { mode: "SINGLE_VALUE", label: "Published reference value", value: claim.value, note: "A source-confirmed value under the current specification; no opposing bound is implied." };
    return { mode: "SINGLE_VALUE", label: "Exact established value", value: claim.value, note: "The accepted equality closes this optimization result." };
  }
  if (frontier.status === "PROVEN" && frontier.gap === "Closed" && frontier.lowerBound) return { mode: "SINGLE_VALUE", label: "Exact established value", value: frontier.lowerBound, note: "Accepted lower and upper Claims meet at this value; the optimization gap is closed." };
  if (!!frontier.lowerBound !== !!frontier.upperBound) return { mode: "ONE_SIDED", label: frontier.lowerBound ? "Known lower bound" : "Known upper bound", value: frontier.lowerBound ?? frontier.upperBound, unknownLabel: frontier.lowerBound ? "Upper bound unknown" : "Lower bound unknown" };
  return { mode: "INTERVAL" };
}
