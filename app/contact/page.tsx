import { pageMetadata } from "../../src/domain/seo";
import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";
import { Suspense } from "react";
import { ContactForm, ContactFormFromQuery } from "./ContactForm";

export const metadata: Metadata = pageMetadata({ path: "/contact", title: "Contact — Limits Registry", description: "Get in touch with the Limits Registry team." });

export default function ContactPage() {
  return <InfoPage kicker="Contact" title="Get in touch." intro="Questions, feedback, or partnership inquiries — send a message and we'll reply by email.">
    <Suspense fallback={<ContactForm channel="CONTACT" />}><ContactFormFromQuery channel="CONTACT" /></Suspense>
  </InfoPage>;
}
