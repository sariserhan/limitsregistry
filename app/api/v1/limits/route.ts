import { NextResponse } from "next/server";
import { listPublicLimitPage } from "../../../../src/db/repository.public-limits";
import { API_V1_PAUSED, pausedApiResponse } from "../../../../src/api/v1-paused";

export const runtime = "nodejs";

// Read-only public API — same published data the site itself renders (listPublishedLimits is
// already OPEN/PROVEN/DISPUTED/RETIRED only), just as JSON for programmatic use. See /developers.
export async function GET(request: Request) {
  if (API_V1_PAUSED) return pausedApiResponse();
  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const pageSize = Math.min(Math.max(parseInt(params.get("pageSize") ?? "50", 10) || 50, 1), 100);
  const page = Math.max(parseInt(params.get("page") ?? "1", 10) || 1, 1);

  const pageData = await listPublicLimitPage({ page, pageSize, category: category ?? undefined });
  const data = pageData.rows.map((limit) => ({
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
    url: `https://www.limitsregistry.com/limits/${limit.registryNumber}`,
  }));

  return NextResponse.json({ data, page: pageData.page, pageSize, total: pageData.total }, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
