import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";

export const metadata: Metadata = { title: "Access required — Limits Registry", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string; required?: string }> };

export default async function AccessRequiredPage({ searchParams }: Props) {
  const params = await searchParams;
  const required = params.required === "EDITOR" ? "Editor" : params.required === "REVIEWER" ? "Reviewer" : params.required === "ADMIN" ? "Admin" : "Researcher";
  const consoleRequest = params.next?.startsWith("/console");
  return <main className="info-page">
    <PublicHeader />
    <section className="info-content">
      <p className="section-kicker">Access required</p>
      <h1>{consoleRequest ? "The Research Console is for contributors." : "This area needs additional access."}</h1>
      <div className="info-body">
        <p>You are signed in as a regular account. This area requires {required} access, which is granted after an editorial application is reviewed.</p>
        <p>Public records, search, comparisons, challenges, and your account remain available while you wait.</p>
        <p><Link href="/account/apply">Apply for editorial access</Link></p>
        <p><Link href="/account">Return to your account</Link> or <Link href="/">return to the Registry</Link>.</p>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
