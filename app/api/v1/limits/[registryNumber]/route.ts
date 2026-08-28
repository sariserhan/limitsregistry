import { NextResponse } from "next/server";
import { getLimitResearchData, getPublishedLimit } from "../../../../../src/db/repository";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ registryNumber: string }> }) {
  const { registryNumber } = await params;
  const limit = await getPublishedLimit(registryNumber);
  if (!limit) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const research = await getLimitResearchData(limit.id);
  return NextResponse.json({
    registryNumber: limit.registryNumber,
    title: limit.title,
    summary: limit.summary,
    category: limit.category,
    subcategory: limit.subcategory,
    direction: limit.direction,
    metricName: limit.metricName,
    unit: limit.unit,
    status: limit.status,
    publishedAt: limit.publishedAt,
    specification: research.specification,
    claims: research.claims.filter((claim) => claim.status === "ACCEPTED"),
    evidence: research.evidence,
    url: `https://www.limitsregistry.com/limits/${limit.registryNumber}`,
  }, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
