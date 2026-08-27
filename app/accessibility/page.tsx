import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";

export const metadata: Metadata = { title: "A registry that remains usable. — Limits Registry", description: "We aim to make Limits Registry readable and operable across devices, input methods, and assistive technologies." };

export default function Page() { return <InfoPage kicker="Accessibility" title="A registry that remains usable." intro="We aim to make Limits Registry readable and operable across devices, input methods, and assistive technologies."><h2>Our approach</h2><p>We use semantic headings, labeled controls, visible keyboard focus, readable contrast, responsive layouts, and reduced-motion support.</p>
<h2>Known limitations</h2><p>Some data-dense research views and charts are still being refined for screen readers and narrow screens.</p>
<h2>Feedback</h2><p>Please report an accessibility barrier to support@limitsregistry.com with the page URL and the assistive technology or input method involved.</p>
</InfoPage>; }
