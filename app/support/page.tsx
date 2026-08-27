import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "Found an error or need help? — Limits Registry", description: "Tell us what you found, include the Registry ID or URL, and provide enough context for an editor to reproduce the issue." };

export default function Page() { return <InfoPage kicker="Support" title="Found an error or need help?" intro="Tell us what you found, include the Registry ID or URL, and provide enough context for an editor to reproduce the issue."><h2>Report a record issue</h2><p>Email support@limitsregistry.com with the Registry ID, a link to the source, the incorrect statement, and your proposed correction.</p>
<h2>Technical help</h2><p>Include the page URL, approximate time, browser/device, and request ID if one is visible. Never send passwords, database URLs, or secret tokens.</p>
<h2>Editorial submissions</h2><p>The Research Console is an internal editorial tool. Public submissions will be introduced only after authentication, abuse controls, and review workflows are ready.</p>
</InfoPage>; }
