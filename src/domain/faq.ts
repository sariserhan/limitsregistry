export type FaqItem = { question: string; answer: string };

// Real answers grounded in how the site actually works (methodology page, editorial workflow,
// bounty verification copy) — not generic placeholder FAQ content.
export const HOMEPAGE_FAQ: FaqItem[] = [
  {
    question: "What does \"PROVEN\" versus \"OPEN\" mean?",
    answer: "PROVEN means the strongest accepted lower bound and upper bound meet — the frontier is closed under the current specification. OPEN means a real gap remains between the best known achievable result and the best known impossibility result.",
  },
  {
    question: "How does a Claim get accepted?",
    answer: "A Claim needs at least one piece of linked evidence and independent editorial review before it's marked ACCEPTED. Nothing publishes automatically from a submission — see /methodology for the full process.",
  },
  {
    question: "Can anyone challenge a published record?",
    answer: "Yes. Anyone with an account can submit a stronger bound, a proof, a reproduction, a correction, or a challenge to a record's stated scope from /submit. Every submission goes through review before anything changes.",
  },
  {
    question: "Does AI write or publish records here?",
    answer: "AI-assisted extraction is used only to help produce draft material — it can never publish directly. A human editor has to review evidence and accept a Claim before it's public.",
  },
  {
    question: "Are the listed bounties and prizes guaranteed by the Registry?",
    answer: "No. A verified bounty listing means an editor confirmed the sponsor, amount, and official source page — not that the Registry administers, guarantees, or pays out the prize. Payment and eligibility remain the sponsor's responsibility.",
  },
  {
    question: "What happens if an accepted Claim turns out to be wrong?",
    answer: "It can be disputed or invalidated through the same review process. Superseded and invalidated Claims stay visible as history rather than being deleted — the record shows how the frontier actually changed over time.",
  },
];
