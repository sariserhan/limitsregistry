import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-rsa-factoring")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/blog/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/blog/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Blog · Cryptography" title={post.title} intro={post.dek}>

<p>RSA encryption &mdash; the algorithm behind a large share of internet security &mdash; relies on one asymmetry: multiplying two large prime numbers together is fast, but recovering those two primes from their product is, as far as anyone has proven, extremely slow. There&rsquo;s no proof that factoring is fundamentally hard in the mathematical sense (that&rsquo;s an open question in complexity theory), but decades of attempts have never found a fast general method &mdash; and that empirical track record is what the RSA Factoring Challenge was built to keep testing.</p>

<h2>The challenge numbers</h2>
<p>Starting in 1991, RSA Laboratories published a series of large numbers, each the product of exactly two large primes, and invited the public to factor them. Each number is named for its length in decimal digits &mdash; RSA-100, RSA-576, RSA-2048, and so on. The challenge officially ended in 2007, but the numbers, and the standing question of whether each has been factored, remain a de facto benchmark for how far factoring techniques have actually progressed.</p>

<h2>Where the record stands</h2>
<p>The largest challenge number factored to date is <Link href="/limits/LR-RSA-250">RSA-250</Link>, a 250-digit (829-bit) number, factored in February 2020 by a team &mdash; Fabrice Boudot, Pierrick Gaudry, Aurore Guillevic, Nadia Heninger, Emmanuel Thom&eacute;, and Paul Zimmermann &mdash; using the General Number Field Sieve, at a cost estimated around 2,700 CPU-core-years. <Link href="/limits/LR-RSA-260">RSA-260</Link>, the next number in the series, remains unfactored; estimates put it well beyond 10,000 core-years with current techniques.</p>

<h2>Why the gap matters</h2>
<p>The jump in difficulty from RSA-250 to RSA-260 isn&rsquo;t small. The General Number Field Sieve&rsquo;s running time grows sub-exponentially but still very steeply with the number of digits, which is exactly why RSA key sizes are chosen with a comfortable safety margin above the current factoring record rather than just above zero. Real-world RSA keys in use today (2048 bits and up) are dramatically larger than anything that&rsquo;s ever been factored.</p>

<h2>Why it&rsquo;s here</h2>
<p>Unlike a pure math conjecture, RSA factoring is a running, falsifiable benchmark: someone either publishes a factorization with a checkable certificate, or they don&rsquo;t. That makes it an unusually clean thing to track &mdash; every RSA challenge number in the Registry carries its exact factoring status and, where it&rsquo;s been broken, the paper and method that did it.</p>

</InfoPage>; }
