import { pageMetadata } from "../../src/domain/seo";
import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = pageMetadata({ path: "/terms", title: "Use the Registry as a research reference. — Limits Registry", description: "These terms describe the expectations for using Limits Registry and its public records." });

export default function Page() { return <InfoPage kicker="Terms of use" title="Use the Registry as a research reference." intro="These terms describe the expectations for using Limits Registry and its public records."><h2>Acceptable use</h2><p>Do not misuse the service, attempt unauthorized access, overload the APIs, or submit material that infringes another person’s rights.</p>
<h2>Research use</h2><p>You may link to and cite public records. Check the specification, evidence, and status before relying on a Claim. Records can change as research develops.</p>
<h2>Automated page access</h2><p>From publication of the updated policy on October 24, 2026 (UTC), automated page access, including AI training collection, search indexing and assistant retrieval, requires enrollment and an active crawler credential. The monthly option costs USD $0.01 per successful HTML page GET, collected monthly or at $100 outstanding, whichever comes first. There is no fixed monthly access fee. Billing requires explicit authorization; this notice does not retroactively charge earlier requests.</p>
<p>Ordinary human browsing, linking and citation remain free. Read the <a href="/crawl-policy">automated access policy</a> for enrollment, exclusions, payment and retry details, or the <a href="/license.xml">machine-readable license</a>. These policy documents are free to access. Cited third-party material retains its own licenses and rights; this policy does not grant rights we do not control or limit rights provided by applicable law.</p>
<h2>Availability</h2><p>The service is provided on an evolving basis. We may correct, suspend, or retire records and service features.</p>
<h2>Contact</h2><p>Questions about these terms belong at <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a>.</p>
</InfoPage>; }
