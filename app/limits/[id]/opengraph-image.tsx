import { ImageResponse } from "next/og";
import { getCanonicalRecord } from "../../../src/domain/canonical";
import { getPublishedLimit } from "../../../src/domain/published";
import { getPublishedLimitWithFrontier } from "../../../src/db/repository";

export const alt = "Limits Registry record";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#121820";
const MUTED = "#687585";
const PAPER = "#f7f5f0";
const BLUE = "#2457ff";
const LINE = "#ddd6c7";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const launch = getPublishedLimit(id);
  const database = await getPublishedLimitWithFrontier(id).catch(() => null);
  const fallback = launch ?? getCanonicalRecord(id);
  const record = database
    ? { id: database.limit.registryNumber, title: database.limit.title, category: database.limit.category, status: database.limit.status }
    : fallback
      ? { id: fallback.id, title: fallback.title, category: fallback.category, status: "OPEN" }
      : { id: "LR-000000", title: "Record not found", category: "Limits Registry", status: "OPEN" };

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, padding: "64px 72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: INK, letterSpacing: -1 }}>Limits Registry</div>
          <div style={{ display: "flex", fontSize: 18, color: BLUE, fontFamily: "monospace" }}>{record.id}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 16, textTransform: "uppercase", letterSpacing: 2, color: BLUE }}>{record.category}</div>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 600, color: INK, letterSpacing: -2, lineHeight: 1.05, maxWidth: 980 }}>{record.title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${LINE}`, paddingTop: 24 }}>
          <div style={{ display: "flex", fontSize: 15, color: MUTED }}>The verified boundaries of what is possible</div>
          <div style={{ display: "flex", fontSize: 14, color: MUTED, fontFamily: "monospace", textTransform: "uppercase" }}>{record.status}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
