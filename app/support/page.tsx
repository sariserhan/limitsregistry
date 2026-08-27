import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";
import { ContactForm } from "../contact/ContactForm";

export const metadata: Metadata = { title: "Found an error or need help? — Limits Registry", description: "Tell us what you found, include the Registry ID or URL, and provide enough context for an editor to reproduce the issue." };

export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  return <InfoPage kicker="Support" title="Found an error or need help?" intro="Tell us what you found, include the Registry ID or URL, and provide enough context for an editor to reproduce the issue.">
    <h2>Report a record issue</h2><p>Send the Registry ID, a link to the source, the incorrect statement, and your proposed correction using the form below, or email <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a> directly.</p>
    <h2>Technical help</h2><p>Include the page URL, approximate time, browser/device, and request ID if one is visible. Never send passwords, database URLs, or secret tokens.</p>
    <h2>Send a message</h2>
    <ContactForm channel="SUPPORT" sent={sent === "1"} />
  </InfoPage>;
}
