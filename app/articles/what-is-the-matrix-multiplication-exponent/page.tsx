import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-matrix-multiplication-exponent")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Algorithms" title={post.title} intro={post.dek} sponsorRecord="LR-DRAFT-OMEGA">

<p>Multiplying two n&times;n matrices the way it&rsquo;s taught in school takes roughly n<sup>3</sup> arithmetic operations. It turns out that&rsquo;s not the fastest possible method &mdash; and how much faster it can go is still an open question. The <b><Link href="/limits/LR-DRAFT-OMEGA">matrix multiplication exponent</Link></b>, written &omega;, is defined as the smallest number such that n&times;n matrices can be multiplied using O(n<sup>&omega;</sup>) operations. Trivially &omega; &ge; 2 &mdash; you at least have to read every entry of both matrices &mdash; but nobody knows whether that lower bound is actually achievable.</p>

<h2>A sequence of surprising improvements</h2>
<p>In 1969, Volker Strassen showed &omega; &le; log<sub>2</sub>7 &asymp; 2.807 with a recursive trick that beats the schoolbook method by avoiding one multiplication per recursive step. Over the following decades, a series of increasingly intricate results &mdash; based on a technique called the laser method, applied to combinatorial objects that have nothing obviously to do with matrices &mdash; pushed the bound steadily down: Coppersmith and Winograd reached 2.376 in 1990, and refinements since have inched it lower still.</p>

<h2>Where the record stands</h2>
<p>The current best proven upper bound is &omega; &lt; 2.371339, from a 2024 paper by Virginia Vassilevska Williams, Yinzhan Xu, Zixuan Xu, and Renfei Zhou. Each improvement in this line of work has gotten smaller &mdash; the gap between successive records is now measured in the fourth or fifth decimal place &mdash; while the lower bound has stayed put at exactly 2 since the question was first posed.</p>

<h2>Why the gap won&rsquo;t obviously close</h2>
<p>Many researchers suspect &omega; = 2 is the true answer &mdash; that matrix multiplication can, in principle, be done almost as fast as just reading the input. But every known technique for proving upper bounds has hit a wall, formalized by results showing the laser method itself cannot get below a certain threshold without new ideas. Closing the gap between 2 and 2.371339 would need a genuinely different approach, not just a sharper version of the current one.</p>

<h2>Why it&rsquo;s here</h2>
<p>Matrix multiplication underlies enough of computing &mdash; graphics, machine learning, scientific simulation &mdash; that even asymptotic improvements attract serious attention, even though the fastest known algorithms are not used in practice due to large constant factors. The Registry tracks the proven bound as a two-sided frontier: 2 as the floor nobody has beaten, 2.371339 as the ceiling nobody has broken through.</p>

<h2>Primary source</h2>
<p><a href="https://arxiv.org/abs/2307.07970" target="_blank" rel="noreferrer">Williams, Xu, Xu &amp; Zhou, “New Bounds for Matrix Multiplication: from Alpha to Omega” ↗</a></p>

</InfoPage>; }
