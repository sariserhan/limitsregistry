import { getPublishedLimit, getLimitResearchData } from "../../../../src/db/repository";
import { deriveFrontier } from "../../../../src/domain/frontier";

type PageProps = { params: Promise<{ registryNumber: string }> };

const COLORS: Record<string, string> = { PROVEN: "#2d7952", DISPUTED: "#b3261e", OPEN: "#2457ff" };
const GRAY = "#9aa5b3";

function escapeXml(text: string) {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

// Shields.io-style two-segment badge, sized by estimated character width (no font-metrics
// dependency — close enough for a small sans-serif label at 11px, same tradeoff shields.io
// itself made before it had a server-side font-measurement service).
function renderBadge(label: string, value: string, color: string): string {
  const charWidth = 6.2;
  const pad = 20;
  const labelWidth = Math.round(label.length * charWidth) + pad;
  const valueWidth = Math.round(value.length * charWidth) + pad;
  const width = labelWidth + valueWidth;
  const height = 20;
  const escapedLabel = escapeXml(label);
  const escapedValue = escapeXml(value);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapedLabel}: ${escapedValue}">
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-opacity=".05"/></linearGradient>
<clipPath id="r"><rect width="${width}" height="${height}" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)">
<rect width="${labelWidth}" height="${height}" fill="#121820"/>
<rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${color}"/>
<rect width="${width}" height="${height}" fill="url(#s)"/>
</g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${labelWidth / 2}" y="14">${escapedLabel}</text>
<text x="${labelWidth + valueWidth / 2}" y="14">${escapedValue}</text>
</g>
</svg>`;
}

function svgResponse(svg: string) {
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}

export async function GET(_request: Request, { params }: PageProps) {
  const { registryNumber: rawParam } = await params;
  const registryNumber = rawParam.replace(/\.svg$/i, "");

  const limit = await getPublishedLimit(registryNumber);
  // Always 200 with a valid SVG, even for "not found" — an <img> in a README should never
  // render as a broken-image icon just because some fetchers only render 2xx bodies.
  if (!limit) return svgResponse(renderBadge("limits registry", "not found", GRAY));

  const { specification, claims } = await getLimitResearchData(limit.id);
  if (!specification) return svgResponse(renderBadge(limit.registryNumber, "no specification", GRAY));

  const frontier = deriveFrontier(limit.direction, specification, claims);
  return svgResponse(renderBadge(limit.registryNumber, frontier.gap, COLORS[frontier.status] ?? GRAY));
}
