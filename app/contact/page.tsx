import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact — Limits Registry", description: "Get in touch with the Limits Registry team." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  return <InfoPage kicker="Contact" title="Get in touch." intro="Questions, feedback, or partnership inquiries — send a message and we'll reply by email.">
    <ContactForm channel="CONTACT" sent={sent === "1"} />
  </InfoPage>;
}
