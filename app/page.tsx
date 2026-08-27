import BrowseClient from "./browse-client";
import { listPublishedLimitsWithFrontiers } from "../src/db/repository";
import { formatExact, publishedLimits, type PublishedLimit } from "../src/domain/published";
import { browseClaims } from "../src/domain/registry";
import type { ExactValue } from "../src/domain/types";

export const dynamic = "force-dynamic";
const displayValue = (value: Parameters<typeof formatExact>[0]): ExactValue | null => value ? { kind: "text", value: formatExact(value) } : null;

export default async function Home() {
  let databaseRows: Awaited<ReturnType<typeof listPublishedLimitsWithFrontiers>> = [];
  try { databaseRows = await listPublishedLimitsWithFrontiers(); } catch { databaseRows = []; }
  const limits: PublishedLimit[] = databaseRows.length ? databaseRows.map(({ limit, specification, claims, frontier }) => {
    const fallback = publishedLimits.find((item) => item.id === limit.registryNumber) ?? publishedLimits[0];
    const safeFrontier = { ...frontier, lowerBound: displayValue(frontier.lowerBound), upperBound: displayValue(frontier.upperBound), achievable: displayValue(frontier.achievable) };
    return { ...fallback, publishedAt: limit.publishedAt?.toISOString(), id: limit.registryNumber, title: limit.title, category: limit.category, summary: limit.summary, direction: limit.direction, status: limit.status === "DRAFT" ? "OPEN" : limit.status, achievable: formatExact(frontier.lowerBound), bound: formatExact(frontier.upperBound), gap: frontier.gap, claims: claims.length, papers: 0, specification, claimsData: [], frontier: safeFrontier };
  }) : publishedLimits;
  return <BrowseClient initialLimits={limits} initialClaims={browseClaims} />;
}
