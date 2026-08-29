import { ImageResponse } from "next/og";
import { getPublicBreakthroughEvent } from "../../../src/db/repository.breakthrough-detail";

export const alt = "Limits Registry breakthrough";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const event = await getPublicBreakthroughEvent((await params).id);
  const label = event?.event.eventType === "FRONTIER_CLOSED" ? "FRONTIER CLOSED" : "BOUND IMPROVED";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1e2925", color: "#f5f1e8", padding: "64px 72px", fontFamily: "sans-serif" }}><div style={{ display: "flex", justifyContent: "space-between", color: "#d7ef62", fontSize: 22, letterSpacing: 2 }}><span>LIMITS REGISTRY</span><span>{event?.limit.registryNumber ?? "BREAKTHROUGH"}</span></div><div style={{ display: "flex", flexDirection: "column", gap: 18 }}><div style={{ display: "flex", color: "#d7ef62", fontSize: 22, letterSpacing: 4 }}>{label}</div><div style={{ display: "flex", fontSize: 56, fontWeight: 600, lineHeight: 1.05, maxWidth: 1000 }}>{event?.limit.title ?? "Accepted frontier change"}</div></div><div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #56645d", paddingTop: 24, color: "#b5c2b7", fontSize: 18 }}><span>Previous: {event?.previousValue ?? "?"}</span><span>New: {event?.newValue ?? "?"}</span></div></div>, { ...size });
}
