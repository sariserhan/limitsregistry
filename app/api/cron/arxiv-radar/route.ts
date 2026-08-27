import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { fetchRecentArxivPapers } from "../../../../src/lib/ingestion/arxiv";
import { extractCandidateClaims, EXTRACTION_MODEL, EXTRACTION_PROMPT_VERSION } from "../../../../src/lib/ai/extract-claims";
import { listPapers, insertPaper, listAllLimits, insertCandidateClaim } from "../../../../src/db/repository.console";
import { findDuplicatePaper } from "../../../../src/domain/duplicate-detection";
import { matchLimitForPaper } from "../../../../src/domain/limit-matching";

// The categories this registry actually covers today (combinatorics, complexity, algorithms,
// quantum) — not a general arXiv firehose. Widen this list only alongside an actual editorial
// scope decision, not as a default.
const CATEGORIES = ["cs.CC", "cs.DS", "math.CO", "quant-ph"];
const MAX_PAPERS_PER_RUN = 25;

// Same constant-time comparison pattern as app/api/cron/weekly-digest/route.ts.
function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [knownPapers, limits, recent] = await Promise.all([listPapers(), listAllLimits(), fetchRecentArxivPapers(CATEGORIES, MAX_PAPERS_PER_RUN)]);

  let ingested = 0;
  let flagged = 0;
  for (const meta of recent) {
    if (!meta.abstract) continue;
    if (findDuplicatePaper(knownPapers, meta)) continue; // already known — extraction already ran on it, if any
    const paper = await insertPaper(meta);
    ingested++;

    // Draft-only, same as manual extraction in app/console/actions.ts's runExtraction — this
    // never writes to `claims` or `limits`, only proposes a candidate_claims row for editorial
    // review. The AI never publishes anything on its own (see AGENTS.md / master spec).
    const extraction = await extractCandidateClaims({ title: meta.title, abstract: meta.abstract });
    if (extraction.claims.length === 0) continue;

    const limitId = matchLimitForPaper(meta, limits);
    await insertCandidateClaim({ paperId: paper.id, limitId, extraction, model: EXTRACTION_MODEL, promptVersion: EXTRACTION_PROMPT_VERSION });
    flagged++;
  }

  return NextResponse.json({ scanned: recent.length, ingested, flagged });
}
