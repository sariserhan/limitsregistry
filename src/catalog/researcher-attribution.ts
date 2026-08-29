export type ContributorRole = "PROBLEM_ORIGINATOR" | "DISCOVERER" | "RECORD_SETTER" | "BOUND_AUTHOR" | "PROOF_AUTHOR" | "FORMALIZER" | "REPRODUCER" | "VERIFIER" | "DATASET_AUTHOR" | "IMPLEMENTER" | "EDITOR";
export type ResearcherCredit = { claimNumber: string; displayName: string; contributorRole: ContributorRole; institution?: string };

// Real people credited on records already published this session — every name, role, and (where
// present) institution matches what was independently verified while researching the underlying
// record itself (see the CAP theorem, sports/animal record, and Vesuvius-adjacent batches).
// claimNumber is the stable join key back to a specific already-published claim.
export const RESEARCHER_CREDITS: ResearcherCredit[] = [
  { claimNumber: "CLM-CAP-THEOREM", displayName: "Eric Brewer", contributorRole: "PROBLEM_ORIGINATOR", institution: "University of California, Berkeley" },
  { claimNumber: "CLM-CAP-THEOREM", displayName: "Seth Gilbert", contributorRole: "PROOF_AUTHOR" },
  { claimNumber: "CLM-CAP-THEOREM", displayName: "Nancy Lynch", contributorRole: "PROOF_AUTHOR", institution: "Massachusetts Institute of Technology" },
  { claimNumber: "CLM-100M-MEN", displayName: "Usain Bolt", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-100M-WOMEN", displayName: "Florence Griffith-Joyner", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-HIGH-JUMP-MEN", displayName: "Javier Sotomayor", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-LONG-JUMP-MEN", displayName: "Mike Powell", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-MARATHON-MEN", displayName: "Sabastian Sawe", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-MARATHON-WOMEN-MIXED", displayName: "Ruth Chepngetich", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-MARATHON-WOMEN-ONLY", displayName: "Tigst Assefa", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-DEEPEST-CREWED-DIVE", displayName: "Victor Vescovo", contributorRole: "RECORD_SETTER" },
  { claimNumber: "CLM-PEREGRINE-FALCON-DIVE", displayName: "Ken Franklin", contributorRole: "DATASET_AUTHOR" },
];
