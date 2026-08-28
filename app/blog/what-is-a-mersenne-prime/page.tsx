import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-a-mersenne-prime")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/blog/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Blog · Number theory" title={post.title} intro={post.dek}>

<p>A Mersenne prime is a prime number of the form 2<sup>p</sup> &minus; 1, named for the 17th-century French friar Marin Mersenne, who studied them. Not every value of p gives a prime &mdash; 2<sup>11</sup> &minus; 1 = 2047 = 23 &times; 89, for instance &mdash; but when it does work out, the result has a special structure that makes it unusually easy to <i>test</i> for primality compared to an arbitrary number of the same size, even though finding candidates in the first place is still a massive computation.</p>

<h2>Why they&rsquo;re the biggest known primes</h2>
<p>The Lucas&ndash;Lehmer test, a primality test specific to numbers of the form 2<sup>p</sup> &minus; 1, is dramatically faster than general-purpose primality testing. That&rsquo;s the entire reason essentially every record for &ldquo;largest known prime&rdquo; for the last several decades has been a Mersenne prime &mdash; it&rsquo;s not that they&rsquo;re more common, it&rsquo;s that they&rsquo;re the only scale at which testing a specific candidate is remotely feasible.</p>

<h2>GIMPS</h2>
<p>Since 1996, the search has been run largely by the Great Internet Mersenne Prime Search (GIMPS), a volunteer distributed-computing project: anyone can download the software and donate spare compute time to testing candidate exponents. The current record, <b>2<sup>136,279,841</sup> &minus; 1</b> &mdash; a number with just over 41 million decimal digits &mdash; was found in October 2024 by GIMPS volunteer Luke Durant, using a GPU-based compute cluster spanning roughly two dozen data centers, ending a 28-year run of CPU-based discoveries.</p>

<h2>What&rsquo;s in the Registry today</h2>
<p>The Registry&rsquo;s Mersenne prime records currently cover the historical catalog up through <Link href="/limits/LR-MERSENNE-132049">2<sup>132049</sup> &minus; 1</Link> &mdash; the record does not yet include Durant&rsquo;s 2024 discovery or any exponent found since. Each record is exact and proven, not estimated: a Mersenne prime is either verified or it isn&rsquo;t, with no partial credit, which makes this one of the cleanest categories in the entire Registry to keep accurate.</p>

<h2>Why they&rsquo;re here</h2>
<p>A &ldquo;largest known prime&rdquo; claim is a specific, checkable assertion, not a matter of opinion &mdash; and that&rsquo;s exactly the kind of claim this Registry is built to track precisely, with the exponent, the discoverer, and the verification method attached to the record rather than repeated from memory.</p>

</InfoPage>; }
