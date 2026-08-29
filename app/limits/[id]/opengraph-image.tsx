import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { getCanonicalRecord } from "../../../src/domain/canonical";
import { getPublishedLimit } from "../../../src/domain/published";
import { getPublishedLimitWithFrontier } from "../../../src/db/repository";

export const alt = "Limits Registry record";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const INK = "#121820";
const MUTED = "#687585";
const PAPER = "#f7f5f0";
const BLUE = "#2457ff";
const LINE = "#ddd6c7";
const LOGO_FILE = new URL("../../../public/favicon-64.png", import.meta.url);

function formatValue(value: { kind: "integer"; value: bigint } | { kind: "rational"; numerator: bigint; denominator: bigint } | { kind: "text"; value: string } | null | undefined) {
  if (!value) return "Unknown";
  if (value.kind === "integer") return value.value.toString();
  if (value.kind === "rational") return `${value.numerator}/${value.denominator}`;
  return value.value;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const logoBytes = await readFile(LOGO_FILE);
  const logo = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const launch = getPublishedLimit(id);
  const database = await getPublishedLimitWithFrontier(id).catch(() => null);
  const fallback = launch ?? getCanonicalRecord(id);
  const record = database
    ? { id: database.limit.registryNumber, title: database.limit.title, summary: database.limit.summary, category: database.limit.category, status: database.limit.status, lower: formatValue(database.frontier?.lowerBound), upper: formatValue(database.frontier?.upperBound) }
    : fallback
      ? { id: fallback.id, title: fallback.title, summary: fallback.summary, category: fallback.category, status: "OPEN", lower: "Unknown", upper: "Unknown" }
      : { id: "LR-000000", title: "Record not found", summary: "No published record matches this identifier.", category: "Limits Registry", status: "OPEN", lower: "Unknown", upper: "Unknown" };
  const summary = record.summary.length > 180 ? `${record.summary.slice(0, 177).trimEnd()}…` : record.summary;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, padding: "64px 72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 600, color: INK, letterSpacing: -1 }}><img src={logo} width="34" height="34" alt="" style={{ objectFit: "contain" }} />Limits Registry</div>
          <div style={{ display: "flex", fontSize: 18, color: BLUE, fontFamily: "monospace" }}>{record.id}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 16, textTransform: "uppercase", letterSpacing: 2, color: BLUE }}>{record.category}</div>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 600, color: INK, letterSpacing: -2, lineHeight: 1.05, maxWidth: 980 }}>{record.title}</div>
          <div style={{ display: "flex", fontSize: 20, color: MUTED, lineHeight: 1.35, maxWidth: 900 }}>{summary}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: `1px solid ${LINE}`, paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontFamily: "monospace" }}>
            <span style={{ display: "flex", color: BLUE }}>Lower bound: {record.lower}</span>
            <span style={{ display: "flex", color: BLUE }}>Upper bound: {record.upper}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 14, color: MUTED }}>The verified boundaries of what is possible</div>
            <div style={{ display: "flex", fontSize: 14, color: MUTED, fontFamily: "monospace", textTransform: "uppercase" }}>{record.status}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
