import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "Use the Registry as a research reference. — Limits Registry", description: "These terms describe the expectations for using Limits Registry and its public records." };

export default function Page() { return <InfoPage kicker="Terms of use" title="Use the Registry as a research reference." intro="These terms describe the expectations for using Limits Registry and its public records."><h2>Acceptable use</h2><p>Do not misuse the service, attempt unauthorized access, overload the APIs, or submit material that infringes another person’s rights.</p>
<h2>Research use</h2><p>You may link to and cite public records. Check the specification, evidence, and status before relying on a Claim. Records can change as research develops.</p>
<h2>Availability</h2><p>The service is provided on an evolving basis. We may correct, suspend, or retire records and service features.</p>
<h2>Contact</h2><p>Questions about these terms belong at <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a>.</p>
</InfoPage>; }
