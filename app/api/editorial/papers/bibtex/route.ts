import { NextResponse } from "next/server";
import { requireRole } from "../../../../../src/auth/session";
import { getPaper } from "../../../../../src/db/repository.entities";
import { toBibtex } from "../../../../../src/domain/research-infrastructure";
export const runtime = "nodejs";
export async function GET(request: Request) {
  await requireRole("RESEARCHER");
  const ids = new URL(request.url).searchParams.getAll("id").slice(0, 100);
  if (!ids.length) return NextResponse.json({ error: "Provide at least one paper id." }, { status: 400 });
  const entries: string[] = [];
  for (const id of ids) { const paper = await getPaper(id); if (!paper) continue; const year = paper.publicationDate?.getUTCFullYear(); const key = `${(paper.title.split(/\s+/)[0] ?? "paper").replace(/[^a-z0-9]/gi, "").toLowerCase()}${year ?? ""}`; entries.push(toBibtex({ citeKey: key, title: paper.title, year, venue: paper.venue ?? undefined, doi: paper.doi ?? undefined, arxivId: paper.arxivId ?? undefined, url: paper.publisherUrl ?? undefined })); }
  return new NextResponse(entries.join("\n\n"), { headers: { "content-type": "application/x-bibtex; charset=utf-8", "content-disposition": "attachment; filename=limits-registry-papers.bib" } });
}
