import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "Research information, not professional advice. — Limits Registry", description: "Registry records are curated research references and may contain uncertainty, disputed results, or errors that require expert interpretation." };

export default function Page() { return <InfoPage kicker="Disclaimer" title="Research information, not professional advice." intro="Registry records are curated research references and may contain uncertainty, disputed results, or errors that require expert interpretation."><h2>No guarantee of completeness</h2><p>A missing result does not mean a result is unknown, and a displayed result may later be corrected or disputed.</p>
<h2>No professional advice</h2><p>Do not use Registry records as legal, financial, medical, safety, or engineering advice. For mathematical use, consult the cited source and qualified experts.</p>
<h2>Corrections</h2><p>If you find an error, report the exact record and source to <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a>.</p>
</InfoPage>; }
