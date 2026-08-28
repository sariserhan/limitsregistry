import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getPublishedLimitWithFrontier, searchPublishedLimits, listPublishedDomainLimits } from "../../../src/db/repository";
import { parseExact } from "../../../src/db/serializers";
import { evaluateHypothesis } from "../../../src/domain/hypothesis";

const SITE_URL = "https://www.limitsregistry.com";

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: "limits-registry", version: "1.0.0" });

  // Every tool here reads only published Limits (status OPEN/PROVEN) and their ACCEPTED claims
  // — the same boundary /api/limits already enforces. A DRAFT limit or a PENDING_REVIEW
  // candidate claim must never reach an external AI through this server as if it were fact;
  // that would be exactly the kind of unverified-claim propagation this registry exists to stop.

  server.registerTool(
    "get_limit",
    {
      description: "Get a published Limit's record: title, category, and its current frontier (best known accepted bounds and gap). Only returns published (OPEN/PROVEN) Limits.",
      inputSchema: z.object({ registryNumber: z.string().describe("e.g. LR-000042") }),
    },
    async ({ registryNumber }) => {
      const result = await getPublishedLimitWithFrontier(registryNumber);
      if (!result) return textResult({ error: `No published Limit found for ${registryNumber}.` });
      return textResult({
        registryNumber: result.limit.registryNumber,
        title: result.limit.title,
        category: result.limit.category,
        direction: result.limit.direction,
        frontier: result.frontier ? { gap: result.frontier.gap, status: result.frontier.status } : null,
        url: `${SITE_URL}/limits/${result.limit.registryNumber}`,
      });
    },
  );

  server.registerTool(
    "search_frontiers",
    {
      description: "Search published Limits by keyword in title, category, or summary.",
      inputSchema: z.object({ query: z.string(), limit: z.number().int().min(1).max(25).optional() }),
    },
    async ({ query, limit }) => {
      const rows = await searchPublishedLimits(query, limit ?? 10);
      return textResult(rows.map((r) => ({ registryNumber: r.registryNumber, title: r.title, category: r.category, status: r.status, url: `${SITE_URL}/limits/${r.registryNumber}` })));
    },
  );

  server.registerTool(
    "list_open_frontiers",
    {
      description: "List published Limits whose frontier is still open (not yet proven/closed) — the highest-leverage unsolved problems currently tracked. Optionally filter by category.",
      inputSchema: z.object({ category: z.string().optional() }),
    },
    async ({ category }) => {
      const rows = await listPublishedDomainLimits();
      const open = rows.filter((r) => r.status === "OPEN" && (!category || r.category.toLowerCase().includes(category.toLowerCase())));
      return textResult(open.map((r) => ({ registryNumber: r.id, title: r.title, category: r.category, url: `${SITE_URL}/limits/${r.id}` })));
    },
  );

  server.registerTool(
    "verify_claim",
    {
      description: "Check a hypothetical bound against a Limit's current ACCEPTED frontier — does it tighten the known bound, does it match what's already known, or does it contradict an accepted result? Never treats DRAFT or candidate claims as fact, only accepted ones.",
      inputSchema: z.object({
        registryNumber: z.string(),
        relation: z.enum(["<", "<=", "=", ">=", ">"]),
        value: z.string().describe("e.g. '5' or '3/2' — asymptotic/text values (e.g. 'O(n log n)') are accepted but not automatically comparable"),
      }),
    },
    async ({ registryNumber, relation, value }) => {
      const result = await getPublishedLimitWithFrontier(registryNumber);
      if (!result) return textResult({ error: `No published Limit found for ${registryNumber}.` });
      if (!result.frontier) return textResult({ error: `No specification exists yet for ${registryNumber}.` });
      const evaluation = evaluateHypothesis(result.frontier, relation, parseExact(value));
      return textResult({ registryNumber, currentFrontier: result.frontier.gap, claimed: `${relation} ${value}`, ...evaluation });
    },
  );

  return server;
});

export async function GET(request: Request) { return handler.fetch(request); }
export async function POST(request: Request) { return handler.fetch(request); }
export async function DELETE(request: Request) { return handler.fetch(request); }
