import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-beal-conjecture")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Mathematics" title={post.title} intro={post.dek}>

<h2>The statement</h2>
<p>If A<sup>x</sup> + B<sup>y</sup> = C<sup>z</sup>, where A, B, C, x, y, and z are positive integers and x, y, z are all greater than 2, then A, B, and C must share a common prime factor.</p>
<p>Turned around: if A, B, and C are <i>pairwise coprime</i> (no two of them share a prime factor), the conjecture says there&rsquo;s no solution at all once every exponent is above 2. It&rsquo;s tracked in the Registry as <Link href="/limits/LR-BEAL">LR-BEAL</Link>.</p>

<h2>Where it comes from</h2>
<p>Texas banker and mathematician Andrew Beal formulated the conjecture in 1993 while investigating generalizations of Fermat&rsquo;s Last Theorem &mdash; the famous statement that A<sup>n</sup> + B<sup>n</sup> = C<sup>n</sup> has no positive integer solutions for n &gt; 2, proved by Andrew Wiles in 1995. Beal&rsquo;s question asks what happens once you let the three exponents differ. Fermat&rsquo;s theorem is the special case where x = y = z; Beal&rsquo;s conjecture is the much broader claim covering every combination of exponents above 2.</p>

<h2>The prize</h2>
<p>Beal has personally funded a prize for a proof or a disproof, administered by the American Mathematical Society. Offered since 1997 and raised in stages, it now stands at <b>$1,000,000</b>, held in trust by the AMS rather than paid directly by Beal &mdash; a structure meant to guarantee the money is there regardless of what happens to the sponsor. It remains unclaimed.</p>

<h2>Why it&rsquo;s still open</h2>
<p>Fermat&rsquo;s Last Theorem took over 350 years and a genuinely new branch of mathematics (the modularity theorem for elliptic curves) to prove for its single, fixed exponent pattern. Beal&rsquo;s conjecture asks for a proof covering every combination of exponents at once &mdash; an infinite family of Fermat-like statements bundled into one claim. Partial results exist for specific small exponent combinations, but no general proof, and no counterexample, has been found despite extensive computational search.</p>

<h2>Why it matters here</h2>
<p>The Beal conjecture is exactly the kind of record this Registry exists to track precisely: a single, formally stated open question, with a real, currently unclaimed monetary incentive behind it. <Link href="/limits/LR-BEAL">The record</Link> links directly to the AMS&rsquo;s own prize page, so the terms are never secondhand.</p>

</InfoPage>; }
