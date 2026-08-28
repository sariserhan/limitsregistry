import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-chromatic-number-of-the-plane")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Mathematics" title={post.title} intro={post.dek}>

<p>Take every point in the infinite flat plane. Color each point so that no two points exactly one unit apart share the same color. How few colors do you need?</p>

<p>That&rsquo;s the Hadwiger&ndash;Nelson problem, first posed in the 1950s. It sounds like a puzzle, but it&rsquo;s a real open question in combinatorics with a precise, currently unresolved answer &mdash; tracked in the Registry as <Link href="/limits/LR-000072">LR-000072, chromatic number of the plane</Link>.</p>

<h2>What we actually know</h2>
<p>The answer is squeezed between two hard bounds:</p>
<ul>
<li><b>At least 5.</b> In 2018, retired biologist and mathematician Aubrey de Grey found a specific 1,581-point unit-distance graph that provably cannot be colored with only 4 colors &mdash; the first improvement to the lower bound since the 1950s. Others have since found smaller graphs with the same property, down to 509 vertices, but the bound itself is still 5.</li>
<li><b>At most 7.</b> This comes from a simple, decades-old construction: tile the plane with hexagons sized just under one unit across, and 7 colors are always enough to avoid same-color points at unit distance.</li>
</ul>
<p>So the true answer is 5, 6, or 7 &mdash; and nobody knows which. The Polymath16 collaborative research project has spent years hunting for a graph that would rule out 5 or 6, without success so far.</p>

<h2>Why it&rsquo;s hard</h2>
<p>Unlike a finite graph-coloring problem you could brute-force on a computer, the plane has infinitely many points. Progress happens by finding finite unit-distance graphs &mdash; specific, checkable arrangements of points and unit-length edges &mdash; whose coloring requirements force a bound on the whole infinite plane. Finding the right finite graph is the entire difficulty: de Grey&rsquo;s original graph took real computational search to construct, and every subsequent improvement has been a search for a smaller, cleaner witness of the same fact.</p>

<h2>Why it matters here</h2>
<p>The chromatic number of the plane is a clean example of what this Registry tracks: not &ldquo;the answer,&rdquo; but the current, evidence-backed frontier of what&rsquo;s proven. <Link href="/limits/LR-000072">The record</Link> shows the known lower and upper bounds, the Claims establishing each, and the papers behind them &mdash; updated the moment either bound tightens, not when someone gets around to rewriting a textbook.</p>

</InfoPage>; }
