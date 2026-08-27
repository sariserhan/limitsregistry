import BrowseClient from "./browse-client";
import { listPublishedLimits } from "../src/db/repository";
import { publishedLimits } from "../src/domain/published";
import { browseClaims } from "../src/domain/registry";

export const dynamic = "force-dynamic";

export default async function Home() {
  let databaseRows: Awaited<ReturnType<typeof listPublishedLimits>> = [];
  try { databaseRows = await listPublishedLimits(); } catch { databaseRows = []; }
  const limits = databaseRows.length ? databaseRows.map((row) => {
    const fallback = publishedLimits.find((limit) => limit.id === row.registryNumber) ?? publishedLimits[0];
    return { ...fallback, id: row.registryNumber, title: row.title, category: row.category, summary: row.summary, direction: row.direction, status: fallback.status };
  }) : publishedLimits;
  return <BrowseClient initialLimits={limits} initialClaims={browseClaims} />;
}
