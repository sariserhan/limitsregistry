import { getLimitResearchData, getPublishedLimit } from "../../../../../src/db/repository";

export const runtime = "nodejs";

function jsonResponse(body: unknown, status = 200) {
  // Integer-valued claims (e.g. Ramsey numbers, Mersenne exponents) carry a BigInt in
  // claim.value — NextResponse.json()/JSON.stringify can't serialize that and throws, so this
  // route needs its own replacer rather than the usual NextResponse.json() helper.
  const text = JSON.stringify(body, (_key, value) => typeof value === "bigint" ? value.toString() : value);
  return new Response(text, { status, headers: { "content-type": "application/json", "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ registryNumber: string }> }) {
  const { registryNumber } = await params;
  const limit = await getPublishedLimit(registryNumber);
  if (!limit) return jsonResponse({ error: "Not found." }, 404);

  const research = await getLimitResearchData(limit.id);
  return jsonResponse({
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
  });
}
