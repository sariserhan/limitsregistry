import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "How this project is supported. — Limits Registry", description: "Limits Registry is an independent research-infrastructure project. We disclose material relationships that could affect editorial judgment." };

export default function Page() { return <InfoPage kicker="Disclosure" title="How this project is supported." intro="Limits Registry is an independent research-infrastructure project. We disclose material relationships that could affect editorial judgment."><h2>Editorial independence</h2><p>The Registry should disclose grants, sponsorships, institutional relationships, or conflicts that could reasonably affect a record. Editors must recuse themselves where appropriate.</p>
<h2>Technology disclosure</h2><p>Some interface and tooling may use automated assistance. AI-generated suggestions are drafts only and are not sufficient evidence for publication.</p>
<h2>Current status</h2><p>No commercial sponsorship or paid placement is represented by the public Registry.</p>
</InfoPage>; }
