import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { SiteFooter } from "../../../src/components/site-footer";
import { getClaimsForPerson, getInstitutionsForPerson, getPerson } from "../../../src/db/repository.entities";

type PageProps = { params: Promise<{ id: string }> };

export default async function ResearcherPage({ params }: PageProps) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();
  const [claims, affiliations] = await Promise.all([getClaimsForPerson(person.id), getInstitutionsForPerson(person.id)]);

  return <main className="canonical-page">
    <PublicHeader />
    <section className="canonical-intro">
      <div className="canonical-category">{person.profileStatus.replaceAll("_", " ")}</div>
      <h1>{person.displayName}</h1>
      <div className="researcher-reputation"><div><strong>{claims.filter(({ claim }) => claim.status === "ACCEPTED").length}</strong><span>accepted Claims</span></div><div><strong>{claims.length}</strong><span>linked Claims</span></div><div><strong>{affiliations.length}</strong><span>institutions</span></div></div><div className="intro-foot">
        {person.orcid && <span>ORCID: {person.orcid}</span>}
        {person.website && <a href={person.website} target="_blank" rel="noreferrer">Website ↗</a>}
        {affiliations.map(({ institution }) => <Link key={institution.id} href={`/institutions/${institution.id}`}>{institution.name}</Link>)}
      </div>
    </section>
    <section className="canonical-columns"><div className="canonical-main">
      <div className="section-title"><span>01</span><h2>Contributions</h2></div>
      <div className="claims-table">
        {claims.map(({ claim, limit, contributorRole }) => <article className="public-claim" key={`${claim.id}-${contributorRole}`}>
          <div className="claim-year">{claim.createdAt ? new Date(claim.createdAt).getFullYear() : ""}</div>
          <div className="public-claim-copy">
            <span className="public-claim-id">{claim.claimNumber}</span>
            <strong>{claim.relation} {claim.valueText ?? claim.valueExact}</strong>
            <span><Link href={`/limits/${limit.registryNumber}`}>{limit.registryNumber} — {limit.title}</Link></span>
            <small>Role: {contributorRole.replaceAll("_", " ")}</small>
          </div>
          <span className={`public-status ${claim.status.toLowerCase()}`}>{claim.status.replaceAll("_", " ")}</span>
        </article>)}
        {claims.length === 0 && <p>No linked Claims yet.</p>}
      </div>
    </div></section>
    <SiteFooter />
  </main>;
}
