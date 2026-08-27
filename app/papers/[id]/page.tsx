import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaimsForPaper, getPaper } from "../../../src/db/repository.entities";

type PageProps = { params: Promise<{ id: string }> };

export default async function PaperPage({ params }: PageProps) {
  const { id } = await params;
  const paper = await getPaper(id);
  if (!paper) notFound();
  const claims = await getClaimsForPaper(paper.id);

  return <main className="canonical-page">
    <header className="canonical-header"><Link className="brand" href="/"><span className="brand-mark"><i /><i /><i /></span><span>Limits Registry</span></Link><nav><Link href="/">Browse</Link></nav><span className="header-tag">PAPER</span></header>
    <section className="canonical-intro">
      <div className="canonical-category">{paper.venue ?? "Unpublished venue"}</div>
      <h1>{paper.title}</h1>
      {paper.abstract && <p>{paper.abstract}</p>}
      <div className="intro-foot">
        {paper.doi && <span>DOI: {paper.doi}</span>}
        {paper.arxivId && <span>arXiv: {paper.arxivId}</span>}
        {paper.publicationDate && <span>{new Date(paper.publicationDate).getFullYear()}</span>}
        {paper.publisherUrl && <a href={paper.publisherUrl} target="_blank" rel="noreferrer">Source ↗</a>}
      </div>
    </section>
    <section className="canonical-columns"><div className="canonical-main">
      <div className="section-title"><span>01</span><h2>Limits established by this paper</h2></div>
      <div className="claims-table">
        {claims.map(({ claim, limit }) => <article className="public-claim" key={claim.id}>
          <div className="claim-year">{claim.createdAt ? new Date(claim.createdAt).getFullYear() : ""}</div>
          <div className="public-claim-copy">
            <span className="public-claim-id">{claim.claimNumber}</span>
            <strong>{claim.relation} {claim.valueText ?? claim.valueExact}</strong>
            <span><Link href={`/limits/${limit.registryNumber}`}>{limit.registryNumber} — {limit.title}</Link></span>
          </div>
          <span className={`public-status ${claim.status.toLowerCase()}`}>{claim.status.replaceAll("_", " ")}</span>
        </article>)}
        {claims.length === 0 && <p>No Claims are linked to this paper yet.</p>}
      </div>
    </div></section>
    <footer><span>LR / 2026</span><span>Evidence before assertion.</span><Link href="/">Back to Browse ↗</Link></footer>
  </main>;
}
