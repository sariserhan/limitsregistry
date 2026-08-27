import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "Evidence before assertion. — Limits Registry", description: "Our editorial system separates a mathematical Claim from the evidence, specification, attribution, and review that support it." };

export default function Page() { return <InfoPage kicker="Editorial policy" title="Evidence before assertion." intro="Our editorial system separates a mathematical Claim from the evidence, specification, attribution, and review that support it."><h2>Record structure</h2><p>A Limit has a permanent Registry ID, a versioned specification, Claims, evidence, people, papers, reviews, and a timeline.</p>
<h2>Publication standard</h2><p>A Claim is not published as accepted until its scope is explicit, evidence is attached, and independent editorial review is recorded. Contradictory or invalidated Claims remain visible as history rather than silently disappearing.</p>
<h2>Corrections</h2><p>Send corrections to support@limitsregistry.com with the relevant Registry ID, source, and precise proposed change.</p>
</InfoPage>; }
