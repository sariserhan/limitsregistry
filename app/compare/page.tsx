import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { listPublishedLimits } from "../../src/db/repository";
import "./compare.css";
export const metadata: Metadata = { title: "Compare Limits — Limits Registry" };
type Props = { searchParams: Promise<{ a?: string; b?: string }> };
export default async function ComparePage({ searchParams }: Props) {
  const [limits, params] = await Promise.all([listPublishedLimits(), searchParams]);
  const a = limits.find((limit) => limit.registryNumber === params.a) ?? limits[0];
  const b = limits.find((limit) => limit.registryNumber === params.b) ?? limits[1] ?? limits[0];
  const comparisons: Array<[string, string, string]> = [
    ["Category", a?.category ?? "—", b?.category ?? "—"],
    ["Direction", a?.direction ?? "—", b?.direction ?? "—"],
    ["Status", a?.status ?? "—", b?.status ?? "—"],
    ["Question", a?.summary ?? "—", b?.summary ?? "—"],
  ];
  return <main className="compare-page"><PublicHeader /><section className="compare-intro"><p className="section-kicker">Registry comparison</p><h1>Put two frontiers side by side.</h1><p>Compare the question, direction, publication state, and source trail. Similar-looking numbers often measure entirely different things.</p></section><section className="page-explanation" aria-labelledby="compare-read-title"><div><p className="section-kicker">How to read this page</p><h2 id="compare-read-title">Same frame, different questions.</h2><p>Comparison puts two published Limits in one view. It helps expose differences in scope and status; it does not declare one field, method, or researcher better than another.</p></div><div className="page-explanation-grid"><article><strong>Choose two</strong><p>Use the selectors to place any two published Limits side by side, then use each title to open its canonical record.</p></article><article><strong>Read the fields</strong><p>Category, direction, and status describe the record. The question is the summary of what the Limit actually measures.</p></article><article><strong>Verify the difference</strong><p>When two numbers look comparable, follow both canonical pages and inspect their specifications and evidence before drawing a conclusion.</p></article></div></section><section className="compare-content"><form className="compare-picker" method="get"><label>First Limit<select name="a" defaultValue={a?.registryNumber}>{limits.map((limit) => <option key={limit.id}>${limit.registryNumber}</option>)}</select></label><label>Second Limit<select name="b" defaultValue={b?.registryNumber}>{limits.map((limit) => <option key={limit.id}>${limit.registryNumber}</option>)}</select></label><button type="submit">Compare</button></form>{a && b ? <div className="compare-table"><div className="compare-heading"><div>Field</div><Link href={"/limits/" + a.registryNumber}>${a.registryNumber}<strong>${a.title}</strong></Link><Link href={"/limits/" + b.registryNumber}>${b.registryNumber}<strong>${b.title}</strong></Link></div>{comparisons.map(([label, left, right]) => <div className="compare-row" key={label}><span>${label}</span><p>${left}</p><p>${right}</p></div>)}</div> : <p>No published Limits are available to compare.</p>}</section><SiteFooter /></main>;
}
