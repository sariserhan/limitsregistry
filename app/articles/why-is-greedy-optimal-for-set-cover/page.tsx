import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("why-is-greedy-optimal-for-set-cover")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Algorithms" title={post.title} intro={post.dek}>

<p>Set cover asks for the fewest subsets, drawn from a given collection, whose union covers every element of a universe. It&rsquo;s NP-hard, and it generalizes cleanly recognizable problems like scheduling and facility placement. The obvious heuristic is <b>greedy</b>: at each step, pick whichever remaining subset covers the most elements not yet covered, and repeat until done. The <b><Link href="/limits/LR-DRAFT-ALG-25">set-cover greedy approximation</Link></b> record tracks exactly how good that simple idea provably is &mdash; and how it compares to the best any algorithm could do.</p>

<h2>A bound proven in the 1970s</h2>
<p>Greedy&rsquo;s worst-case performance was pinned down by Va&scaron;ek Chv&aacute;tal in 1979 (building on earlier work by David Johnson and L&aacute;szl&oacute; Lov&aacute;sz): it always finds a cover of size at most H(n) &asymp; ln n + 1 times the true optimum, where n is the number of elements and H(n) is the n-th harmonic number. That&rsquo;s a solid guarantee, but for decades it was an open question whether some cleverer, more sophisticated algorithm could do meaningfully better in the worst case.</p>

<h2>The matching hardness result</h2>
<p>In 2014, Irit Dinur and David Steurer proved that approximating set cover to within (1 &minus; o(1))&middot;ln n is NP-hard. That closes the gap almost exactly: greedy&rsquo;s ln n + 1 upper bound and Dinur&ndash;Steurer&rsquo;s (1&minus;o(1))ln n hardness result pin the true worst-case approximation ratio to essentially ln n, with no room left for a smarter algorithm to meaningfully improve on the decades-old greedy heuristic.</p>

<h2>Why that&rsquo;s a satisfying kind of answer</h2>
<p>Most approximation-algorithm stories in the Registry involve an open gap: a known achievable ratio and a weaker proven hardness bound, with room in between for either side to move. Set cover is one of the rarer cases where the gap has actually closed &mdash; the simplest possible algorithm turned out to already be optimal, and a matching hardness proof confirms there was never a better one to find.</p>

<h2>Why it&rsquo;s here</h2>
<p>The Registry tracks both directions of this problem &mdash; what an algorithm can guarantee, and what no algorithm can beat &mdash; as a single frontier, exactly the way it tracks open problems in mathematics and physics. Here the frontier happens to be closed.</p>

<h2>Primary source</h2>
<p><a href="https://arxiv.org/abs/1305.1979" target="_blank" rel="noreferrer">Dinur &amp; Steurer, “Analytical Approach to Parallel Repetition,” STOC (2014) ↗</a></p>

</InfoPage>; }
