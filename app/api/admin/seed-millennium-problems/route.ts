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

const SPONSOR = "Clay Mathematics Institute";

type Problem = { id: string; title: string; category: string; subcategory: string; formalStatement: string; summary: string; sourceUrl: string };

// Mirrors scripts/seed-millennium-problems.ts — run at request time so it reaches production's
// Sensitive DATABASE_URL. The seventh Millennium Problem, the Poincaré conjecture, is solved
// (Perelman, 2003) and is deliberately excluded — no unclaimed prize exists for it.
const PROBLEMS: Problem[] = [
  {
    id: "LR-RIEMANN",
    title: "Riemann hypothesis",
    category: "Mathematics",
    subcategory: "Number Theory",
    formalStatement: "All non-trivial zeros of the Riemann zeta function ζ(s) have real part equal to 1/2.",
    summary: "Bernhard Riemann conjectured this in 1859 while studying the distribution of prime numbers. The zeta function's zeros away from the 'trivial' negative even integers all appear to sit exactly on the critical line Re(s) = 1/2 — a pattern verified for the first many trillion zeros but never proven in general. A proof would sharpen almost everything known about how primes are distributed.",
    sourceUrl: "https://www.claymath.org/millennium/riemann-hypothesis/",
  },
  {
    id: "LR-P-VS-NP",
    title: "P versus NP",
    category: "Mathematics",
    subcategory: "Computational Complexity",
    formalStatement: "Does P = NP? That is, does every decision problem whose solution can be verified in polynomial time also admit a solution that can be found in polynomial time?",
    summary: "Formulated independently by Stephen Cook and Leonid Levin in 1971, this asks whether every problem whose solution is easy to check is also easy to solve. If P = NP, most modern cryptography would become breakable in principle; if P ≠ NP, it would confirm that whole classes of problems (from optimal scheduling to protein folding) are inherently intractable to solve exactly at scale. Almost all computer scientists believe P ≠ NP, but no proof exists.",
    sourceUrl: "https://www.claymath.org/millennium/p-vs-np/",
  },
  {
    id: "LR-NAVIER-STOKES",
    title: "Navier–Stokes existence and smoothness",
    category: "Physics",
    subcategory: "Fluid Dynamics",
    formalStatement: "In three spatial dimensions, given smooth, physically reasonable initial velocity data, do smooth solutions to the Navier–Stokes equations exist for all time — or can a singularity (blow-up) occur in finite time?",
    summary: "The Navier–Stokes equations, formulated in the 19th century, describe how fluids like air and water move and are the basis of weather prediction, aircraft design, and blood-flow modeling. Despite how thoroughly they're used in practice, nobody has proven that their solutions in three dimensions stay smooth (well-behaved) for all time rather than developing a singularity — or found a case where one does.",
    sourceUrl: "https://www.claymath.org/millennium/navier-stokes-equation/",
  },
  {
    id: "LR-YANG-MILLS",
    title: "Yang–Mills existence and mass gap",
    category: "Physics",
    subcategory: "Quantum Field Theory",
    formalStatement: "For any compact simple gauge group G, prove that a non-trivial quantum Yang–Mills theory exists on R⁴ and has a mass gap Δ > 0.",
    summary: "Yang–Mills theory underlies the Standard Model's description of the strong nuclear force, and its predictions have been repeatedly confirmed in particle accelerators. Physicists have observed empirically that the theory's particles behave as if they have positive mass (a 'mass gap'), even though the classical fields it's built from travel at the speed of light — but no one has constructed the theory with full mathematical rigor or proven the mass gap exists.",
    sourceUrl: "https://www.claymath.org/millennium/yang-mills-the-maths-gap/",
  },
  {
    id: "LR-HODGE",
    title: "Hodge conjecture",
    category: "Mathematics",
    subcategory: "Algebraic Geometry",
    formalStatement: "On a non-singular complex projective algebraic variety, every Hodge class is a rational linear combination of classes of algebraic cycles.",
    summary: "For certain well-behaved geometric spaces called projective algebraic varieties, this asks whether every 'Hodge cycle' — a topological feature identified through the space's structure — can always be built out of actual algebraic (equation-defined) pieces. It is a question about how far topology and algebra can be identified with each other, central to how mathematicians reason about the shape of solution sets to polynomial equations.",
    sourceUrl: "https://www.claymath.org/millennium/hodge-conjecture/",
  },
  {
    id: "LR-BSD",
    title: "Birch and Swinnerton-Dyer conjecture",
    category: "Mathematics",
    subcategory: "Number Theory",
    formalStatement: "For an elliptic curve E over ℚ, the rank of the group of rational points E(ℚ) equals the order of vanishing of the associated L-function L(E, s) at s = 1.",
    summary: "Elliptic curves are central to number theory — they were key to Andrew Wiles' proof of Fermat's Last Theorem and underpin widely used cryptographic systems. This conjecture, formulated in the 1960s from numerical experiments, predicts a precise link between how many rational-number solutions an elliptic curve has and the behavior of a related complex analytic function at a single point. It remains one of the deepest open questions about when polynomial equations have rational solutions.",
    sourceUrl: "https://www.claymath.org/millennium/birch-and-swinnerton-dyer-conjecture/",
  },
];

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let published = 0, updated = 0, bountiesPublished = 0, bountiesSkipped = 0;
  for (const p of PROBLEMS) {
    const existing = await db.execute<{ id: string }>(sql`select id from limits where registry_number = ${p.id} limit 1`);
    let limitId: string;
    if (existing.length) {
      limitId = existing[0].id;
      await db.execute(sql`update limits set summary = ${p.summary}, updated_at = now() where id = ${limitId}`);
      updated++;
    } else {
      const [limit] = await db.execute<{ id: string }>(sql`
        insert into limits (registry_number, slug, title, summary, category, subcategory, direction, metric_name, status)
        values (${p.id}, ${p.id.toLowerCase().replace("lr-", "")}, ${p.title}, ${p.summary}, ${p.category}, ${p.subcategory}, ${"MAXIMIZE"}, ${"Resolution status"}, ${"OPEN"})
        returning id
      `);
      limitId = limit.id;
      await db.execute(sql`
        insert into limit_spec_versions (limit_id, version_number, formal_statement, constraints, assumptions)
        values (${limitId}, 1, ${p.formalStatement}, ${JSON.stringify({})}::jsonb, ${JSON.stringify({ publicationProcess: "FOUNDING_CATALOG_IMPORT" })}::jsonb)
      `);
      await db.execute(sql`
        insert into evidence (type, label, url, limit_id, metadata)
        values (${"PAPER"}, ${`${p.title} — official problem description`}, ${p.sourceUrl}, ${limitId}, ${JSON.stringify({ verificationLevel: "SOURCE_CONFIRMED" })}::jsonb)
      `);
      published++;
    }

    const existingBounty = await db.execute<{ id: string }>(sql`select id from research_bounties where limit_id = ${limitId} and sponsor = ${SPONSOR} limit 1`);
    if (existingBounty.length) { bountiesSkipped++; continue; }
    await db.execute(sql`
      insert into research_bounties (limit_id, title, sponsor, description, source_url, status, amount, currency, moderation_note, verified_at)
      values (
        ${limitId}, ${"Millennium Prize"}, ${SPONSOR},
        ${`A $1,000,000 prize for a correct solution to the ${p.title} problem, funded and administered by the Clay Mathematics Institute as one of its seven Millennium Prize Problems (announced 2000). Still unclaimed.`},
        ${p.sourceUrl}, ${"VERIFIED"}, ${"1000000.00"}, ${"USD"},
        ${"Verified against the Clay Mathematics Institute's own Millennium Problems program page."},
        now()
      )
    `);
    bountiesPublished++;
  }

  const [{ verifiedBountyCount }] = await db.execute<{ verifiedBountyCount: number }>(sql`select count(*)::int as "verifiedBountyCount" from research_bounties where status = 'VERIFIED'`);
  return NextResponse.json({ status: "ok", published, updated, bountiesPublished, bountiesSkipped, verifiedBountyCount });
}
