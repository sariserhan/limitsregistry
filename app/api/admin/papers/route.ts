import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../../../../src/db/client";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

// Read-only inventory of every distinct paper cited by a published limit, plus which limits
// cite it — used to scope the real-abstract research pass without guessing at prod's contents.
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const papers = await db.execute(sql`
    select p.id, p.title, p.doi, p.arxiv_id as "arxivId", p.publisher_url as "publisherUrl", p.abstract,
      array_agg(distinct l.registry_number order by l.registry_number) as "limitRegistryNumbers"
    from papers p
    join claim_papers cp on cp.paper_id = p.id
    join claims c on c.id = cp.claim_id
    join limit_spec_versions v on v.id = c.specification_version_id
    join limits l on l.id = v.limit_id
    where l.status in ('OPEN','PROVEN','DISPUTED','RETIRED')
    group by p.id
    order by p.title
  `);
  const evidenceRows = await db.execute(sql`
    select e.id, e.label, e.url, e.type,
      array_agg(distinct l.registry_number order by l.registry_number) as "limitRegistryNumbers"
    from evidence e
    left join claim_evidence ce on ce.evidence_id = e.id
    left join claims c on c.id = ce.claim_id
    left join limit_spec_versions v on v.id = c.specification_version_id
    left join limits l1 on l1.id = v.limit_id
    left join limits l2 on l2.id = e.limit_id
    join limits l on l.id = coalesce(l1.id, l2.id)
    where l.status in ('OPEN','PROVEN','DISPUTED','RETIRED')
    group by e.id
    order by e.label
  `);
  return NextResponse.json({ paperCount: papers.length, papers, evidenceCount: evidenceRows.length, evidence: evidenceRows });
}
