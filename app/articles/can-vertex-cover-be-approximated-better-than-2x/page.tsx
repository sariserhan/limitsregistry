import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("can-vertex-cover-be-approximated-better-than-2x")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Algorithms" title={post.title} intro={post.dek} sponsorRecord="LR-DRAFT-ALG-26">

<p>A vertex cover of a graph is a set of vertices that touches every edge. Finding the smallest one is NP-hard, but a startlingly simple algorithm gets within a factor of two of optimal: take any <i>maximal matching</i> &mdash; a set of edges that share no endpoints and can&rsquo;t be extended &mdash; and include both endpoints of every matched edge. Since the optimal cover must include at least one endpoint from each matching edge (they share no vertices, so no single vertex can cover two of them), and this construction uses both endpoints of each, the result is at most twice the true optimum. The <b><Link href="/limits/LR-DRAFT-ALG-26">vertex-cover approximation</Link></b> record tracks whether that factor of two can ever be beaten.</p>

<h2>A bound nobody has improved on</h2>
<p>The 2-approximation for vertex cover has been known since the early days of approximation algorithms, and despite it being one of the most studied problems in the field, no polynomial-time algorithm with a better worst-case guarantee &mdash; 1.99, say, or anything below 2 &mdash; has ever been found for general graphs.</p>

<h2>Tied to a bigger open conjecture</h2>
<p>In 2008, Subhash Khot and Oded Regev showed that if the <b>Unique Games Conjecture (UGC)</b> is true, then no polynomial-time algorithm can approximate vertex cover to better than a factor of 2 &minus; &epsilon; for any &epsilon; &gt; 0 &mdash; meaning 2 would be provably optimal. UGC is itself a major unresolved conjecture in complexity theory, believed by many researchers but unproven either way. So the fate of the vertex-cover approximation frontier is now tied directly to the fate of a separate, actively studied open problem.</p>

<h2>Why this matters beyond one problem</h2>
<p>The Unique Games Conjecture has this same relationship to the best-known approximation ratio for a whole family of problems, not just vertex cover &mdash; it&rsquo;s become a kind of master key for proving inapproximability results. Resolving UGC either way would immediately settle several open approximation frontiers at once, vertex cover among them.</p>

<h2>Why it&rsquo;s here</h2>
<p>Vertex cover is a case where the achievable side of the frontier (2, via a one-line algorithm) hasn&rsquo;t moved in decades, and the impossibility side is conditional on a conjecture that itself has no proof either way &mdash; a genuinely open two-sided gap, just built out of a chain of open problems rather than a single one.</p>

<h2>Primary source</h2>
<p><a href="https://doi.org/10.1016/j.jcss.2007.06.019" target="_blank" rel="noreferrer">Khot &amp; Regev, “Vertex cover might be hard to approximate to within 2−ε,” Journal of Computer and System Sciences 74 (2008) ↗</a></p>

</InfoPage>; }
