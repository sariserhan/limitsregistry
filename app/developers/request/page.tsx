import type { Metadata } from "next";
import InfoPage from "../../_components/InfoPage";
import { AccessForm } from "./AccessForm";
import "../developers.css";

export const metadata: Metadata = { title: "Request API pilot access — Limits Registry", description: "Tell us about your project to discuss commercial JSON and NDJSON snapshot access." };

export default function Page() {
  return <InfoPage kicker="API & Data · Commercial pilot" title="Build with the registry." intro="Tell us what you need from a bulk snapshot. We’ll discuss fit, pricing, and freshness before issuing a key."><AccessForm /></InfoPage>;
}
