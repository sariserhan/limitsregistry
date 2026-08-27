import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "../../../src/components/public-header";
import { getInstitution, getPeopleForInstitution } from "../../../src/db/repository.entities";

type PageProps = { params: Promise<{ id: string }> };

export default async function InstitutionPage({ params }: PageProps) {
  const { id } = await params;
  const institution = await getInstitution(id);
  if (!institution) notFound();
  const affiliated = await getPeopleForInstitution(institution.id);

  return <main className="canonical-page">
    <PublicHeader />
    <section className="canonical-intro">
      <div className="canonical-category">{institution.type ?? "Institution"}</div>
      <h1>{institution.name}</h1>
      <div className="intro-foot">
        {institution.country && <span>{institution.country}</span>}
        {institution.website && <a href={institution.website} target="_blank" rel="noreferrer">Website ↗</a>}
      </div>
    </section>
    <section className="canonical-columns"><div className="canonical-main">
      <div className="section-title"><span>01</span><h2>Affiliated researchers</h2></div>
      <div className="claims-table">
        {affiliated.map(({ person, roleLabel }) => <article className="public-claim" key={person.id}>
          <div className="public-claim-copy">
            <strong><Link href={`/researchers/${person.id}`}>{person.displayName}</Link></strong>
            {roleLabel && <span>{roleLabel}</span>}
          </div>
        </article>)}
        {affiliated.length === 0 && <p>No affiliated researchers on record yet.</p>}
      </div>
    </div></section>
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><Link href="/">Back to Browse ↗</Link></footer>
  </main>;
}
