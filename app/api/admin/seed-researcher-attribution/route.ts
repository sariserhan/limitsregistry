import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../src/db/client";
import { claims, people, claimPeople, institutions, personInstitutions } from "../../../../src/db/schema";
import { RESEARCHER_CREDITS } from "../../../../src/catalog/researcher-attribution";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!expected || !provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let linked = 0, skipped = 0;
  const missingClaims: string[] = [];
  for (const credit of RESEARCHER_CREDITS) {
    const [claim] = await db.select({ id: claims.id }).from(claims).where(eq(claims.claimNumber, credit.claimNumber)).limit(1);
    if (!claim) { missingClaims.push(credit.claimNumber); continue; }

    let personId: string;
    const existingPerson = await db.select({ id: people.id }).from(people).where(eq(people.normalizedName, normalize(credit.displayName))).limit(1);
    if (existingPerson.length) { personId = existingPerson[0].id; } else {
      const [person] = await db.insert(people).values({ displayName: credit.displayName, normalizedName: normalize(credit.displayName) }).returning({ id: people.id });
      personId = person.id;
    }

    if (credit.institution) {
      let institutionId: string;
      const existingInstitution = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.name, credit.institution)).limit(1);
      if (existingInstitution.length) { institutionId = existingInstitution[0].id; } else {
        const [institution] = await db.insert(institutions).values({ name: credit.institution, type: "ACADEMIC" }).returning({ id: institutions.id });
        institutionId = institution.id;
      }
      await db.insert(personInstitutions).values({ personId, institutionId }).onConflictDoNothing();
    }

    const inserted = await db.insert(claimPeople).values({ claimId: claim.id, personId, contributorRole: credit.contributorRole }).onConflictDoNothing().returning({ claimId: claimPeople.claimId });
    if (inserted.length) linked++; else skipped++;
  }

  return NextResponse.json({ linked, skipped, missingClaims, total: RESEARCHER_CREDITS.length });
}
