import Link from "next/link";
import { requireRole } from "../../../../src/auth/session";
import { listVerificationArtifacts } from "../../../../src/db/repository.research";
import "../../console.css";
export default async function ArtifactPage({ searchParams }: { searchParams: Promise<{ claimId?: string }> }) {
  await requireRole("RESEARCHER"); const { claimId } = await searchParams; const artifacts = claimId ? await listVerificationArtifacts(claimId) : [];
  return <main className="console-page"><header><Link className="brand" href="/console/research">← Research Infrastructure</Link></header><p className="section-kicker">Reproducibility</p><h1>Verification artifacts</h1><p className="lede">Linked artifacts are evidence records. They do not grant machine-checked status automatically.</p><form className="intake-form" method="get"><input name="claimId" placeholder="Claim UUID" defaultValue={claimId ?? ""} required /><button type="submit">Load artifacts</button></form><section><h2>Artifacts ({artifacts.length})</h2>{artifacts.length ? artifacts.map(a => <article className="candidate-card" key={a.id}><strong>{a.verifier} · {a.verificationLevel}</strong><div>Build: {a.buildResult} · Commit: <code>{a.commitHash}</code></div><a href={a.repositoryUrl} target="_blank" rel="noreferrer">Repository ↗</a></article>) : <p>No artifacts loaded.</p>}</section></main>;
}
