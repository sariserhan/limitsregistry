import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "A public record of mathematical and theoretical computer science limits. — Limits Registry", description: "Limits Registry turns scattered bounds, constructions, proofs, and open gaps into durable records that researchers can inspect and cite." };

export default function Page() { return <InfoPage kicker="About" title="A public record of mathematical and theoretical computer science limits." intro="Limits Registry turns scattered bounds, constructions, proofs, and open gaps into durable records that researchers can inspect and cite."><h2>What we are building</h2><p>The Registry records what is known, what is achievable, what is ruled out, and where the gap remains open. Every published quantitative statement should be scoped to a specification and connected to evidence.</p>
<h2>What we are not</h2><p>We are not a paper publisher, a replacement for peer review, or an authority that settles active disputes by itself.</p>
<h2>Contact</h2><p>For general questions, contact <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a>.</p>
</InfoPage>; }
