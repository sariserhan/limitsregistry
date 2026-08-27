import { NextResponse } from "next/server";
import { requireRole } from "../../../../../../src/auth/session";
import { getPaper } from "../../../../../../src/db/repository.entities";
import { toBibtex } from "../../../../../../src/domain/research-infrastructure";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("RESEARCHER");
  const { id } = await params;
  const paper = await getPaper(id);
  if (!paper) return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  const year = paper.publicationDate?.getUTCFullYear();
  const citeKey = `${(paper.title.split(/\s+/)[0] ?? "paper").replace(/[^a-z0-9]/gi, "").toLowerCase()}${year ?? ""}`;
  const bibtex = toBibtex({ citeKey, title: paper.title, year, venue: paper.venue ?? undefined, doi: paper.doi ?? undefined, arxivId: paper.arxivId ?? undefined, url: paper.publisherUrl ?? undefined });
  return new NextResponse(bibtex, { headers: { "content-type": "application/x-bibtex; charset=utf-8" } });
}
