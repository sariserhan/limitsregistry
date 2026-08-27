import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "A small, deliberate data footprint. — Limits Registry", description: "Limits Registry is designed to publish research records, not to build an advertising profile of its visitors." };

export default function Page() { return <InfoPage kicker="Privacy" title="A small, deliberate data footprint." intro="Limits Registry is designed to publish research records, not to build an advertising profile of its visitors."><h2>What we collect</h2><p>The public site does not require an account. Server logs may contain ordinary technical data such as IP address, user agent, request path, and request ID for security and reliability.</p>
<h2>How we use it</h2><p>We use operational data to protect the service, diagnose failures, and understand aggregate usage. We do not sell personal information or use advertising trackers.</p>
<h2>Contact and retention</h2><p>Support messages are retained only as long as needed to respond and maintain an editorial record. For privacy requests, contact support@limitsregistry.com.</p>
<h2>Important note</h2><p>This is a project policy, not legal advice. Have counsel review it before production launch in each jurisdiction where the service operates.</p>
</InfoPage>; }
