import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listResearchers } from "../../src/db/repository.researchers";

export const revalidate = 60;
export const metadata: Metadata = { title: "Researchers — Limits Registry", description: "People credited on published Registry records — discoverers, proof authors, and record setters.", alternates: { canonical: "/researchers" } };

export default async function ResearchersPage() {
  const researchers = await listResearchers();
  return <main className="directory-page">
    <PublicHeader />
    <section className="directory-intro">
      <p className="section-kicker">Attribution</p>
      <h1>Researchers.</h1>
      <p>People credited on published Registry records. If you&rsquo;re listed here, you can request attribution over your own profile — every request is reviewed by an editor before it takes effect.</p>
      <div className="directory-stats"><span><strong>{researchers.length}</strong> people credited</span></div>
    </section>
    <section className="directory-list" aria-label="Researchers">
      {researchers.length ? researchers.map(({ person, creditedClaims }) => <Link className="directory-row" href={`/researchers/${person.id}`} key={person.id}>
        <span>{person.profileStatus === "CLAIMED" ? "✓" : "—"}</span>
        <div><strong>{person.displayName}</strong><p>{creditedClaims} credited {creditedClaims === 1 ? "claim" : "claims"}{person.orcid ? ` · ORCID ${person.orcid}` : ""}</p></div>
        <small>{person.profileStatus === "CLAIMED" ? "Verified profile" : "Unclaimed"}</small>
        <b aria-hidden="true">→</b>
      </Link>) : <p>No researchers are credited on published records yet.</p>}
    </section>
    <SiteFooter />
  </main>;
}
