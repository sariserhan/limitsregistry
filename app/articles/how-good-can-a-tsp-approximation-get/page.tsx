import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("how-good-can-a-tsp-approximation-get")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Optimization" title={post.title} intro={post.dek} sponsorRecord="LR-DRAFT-TSP">

<p>The traveling salesman problem asks for the shortest possible route that visits every city in a list exactly once and returns to the start. It&rsquo;s a classic NP-hard problem: nobody can solve it exactly and efficiently for large instances (unless P = NP), so research instead asks how close a fast algorithm can get to the true optimum. For &ldquo;metric&rdquo; TSP &mdash; where distances satisfy the triangle inequality, as ordinary geographic distances do &mdash; that&rsquo;s exactly what the <b><Link href="/limits/LR-DRAFT-TSP">metric TSP approximation frontier</Link></b> tracks.</p>

<h2>Forty-four years at 3/2</h2>
<p>In 1976, Nicos Christofides described an algorithm &mdash; built from a minimum spanning tree, a minimum-weight perfect matching, and an Eulerian shortcut &mdash; that is guaranteed to find a tour no more than 1.5&times; the length of the optimal tour, for any metric instance. That 3/2 approximation ratio stood as the best proven guarantee for the problem for 44 years, long enough that many in the field suspected it might be the true answer.</p>

<h2>The frontier finally moved</h2>
<p>In 2020, Anna Karlin, Nathan Klein, and Shayan Oveis Gharan gave a randomized algorithm that beats Christofides&rsquo; ratio, guaranteeing a tour of length at most (3/2 &minus; &epsilon;) times optimal for some fixed, tiny &epsilon; &gt; 0. The improvement over 3/2 in the original result is astronomically small &mdash; far too small to matter for any real route-planning problem &mdash; but it proved something Christofides&rsquo; bound alone never could: that 3/2 is not the best possible worst-case guarantee for a polynomial-time algorithm.</p>

<h2>Why a tiny improvement is still a big result</h2>
<p>In complexity theory, the size of an improvement matters far less than whether the barrier moves at all. A 44-year-old bound resisting an enormous amount of effort, then finally breaking by any nonzero margin, tells researchers the wall wasn&rsquo;t fundamental &mdash; there was room to improve, and the gap between the algorithmic upper bound and the P&ne;NP-based theoretical lower bound (below 3/2, but not by much) is not yet closed.</p>

<h2>Why it&rsquo;s here</h2>
<p>TSP approximation is a clean example of the Registry&rsquo;s two-sided-bound format applied to an algorithm rather than a physical quantity: the exact optimum is out of reach for large instances, but the best guaranteed approximation ratio is itself a real, trackable frontier that has already moved once and could move again.</p>

<h2>Primary source</h2>
<p><a href="https://arxiv.org/abs/2007.01409" target="_blank" rel="noreferrer">Karlin, Klein &amp; Oveis Gharan, “A (Slightly) Improved Approximation Algorithm for Metric TSP” ↗</a></p>

</InfoPage>; }
