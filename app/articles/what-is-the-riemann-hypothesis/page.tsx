import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-riemann-hypothesis")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Number theory" title={post.title} intro={post.dek} sponsorRecord="LR-RIEMANN">

<p>The Riemann zeta function &zeta;(s) extends the familiar sum 1 + 1/2<sup>s</sup> + 1/3<sup>s</sup> + &hellip; to the entire complex plane. It has infinitely many &ldquo;trivial&rdquo; zeros at the negative even integers, and infinitely many &ldquo;non-trivial&rdquo; zeros elsewhere. Bernhard Riemann conjectured in 1859 that every one of those non-trivial zeros has real part exactly 1/2 &mdash; that they all sit on a single vertical line in the complex plane, the <b>critical line</b>. That is the <b><Link href="/limits/LR-RIEMANN">Riemann hypothesis</Link></b>.</p>

<h2>Why anyone cares where a function&rsquo;s zeros sit</h2>
<p>Riemann showed that the zeta function&rsquo;s zeros are tightly linked to the distribution of prime numbers &mdash; how evenly or unevenly primes are spread out as numbers get large. The Prime Number Theorem describes that distribution on average; the Riemann hypothesis would pin down the size of the error term as tightly as is theoretically possible. A huge amount of modern number theory is already built on the assumption that it&rsquo;s true.</p>

<h2>Checked, not proven</h2>
<p>Computers have verified that the first many trillion non-trivial zeros all lie exactly on the critical line, with no counterexample ever found. That kind of overwhelming numerical evidence is common for open problems in number theory &mdash; it makes the conjecture more credible, but a single zero found off the line anywhere among infinitely many candidates would disprove it, and no amount of checking can rule that out.</p>

<h2>Why it&rsquo;s here</h2>
<p>The Riemann hypothesis is one of the seven <Link href="/articles/millennium-prize-problems-list">Millennium Prize Problems</Link>, with a $1,000,000 award from the Clay Mathematics Institute attached. It&rsquo;s tracked in the Registry as its own record, with the exact formal statement, rather than folded only into the roundup of all seven.</p>

<h2>Primary source</h2>
<p><a href="https://www.claymath.org/millennium/riemann-hypothesis/" target="_blank" rel="noreferrer">Clay Mathematics Institute, “Riemann Hypothesis” ↗</a></p>

</InfoPage>; }
