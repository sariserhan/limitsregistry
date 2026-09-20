import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("how-much-data-can-dna-actually-store")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Data storage" title={post.title} intro={post.dek}>

<p>DNA encodes information using four bases &mdash; A, C, G, and T &mdash; which means each base can in principle carry up to 2 bits, and the molecule packs those bases at molecular density. That combination makes DNA, in theory, the densest data-storage medium anyone knows of. The <b><Link href="/limits/LR-DRAFT-DNA">DNA information density</Link></b> record tracks two very different numbers that shouldn&rsquo;t be conflated: a theoretical raw ceiling near <b>455 exabytes per gram</b>, and what&rsquo;s actually been demonstrated with a real, working, error-corrected encoding scheme.</p>

<h2>Theory versus a working system</h2>
<p>The theoretical figure assumes every base stores its full 2 bits with no redundancy at all &mdash; a limit, not a design. Real systems can&rsquo;t operate anywhere near it, because DNA synthesis and sequencing both introduce errors, and a storage scheme with zero redundancy has no way to detect or correct a single flipped base. Closing that gap is entirely a question of coding theory: how much redundancy is the minimum needed to make the data recoverable in practice.</p>

<h2>DNA Fountain</h2>
<p>In 2017, Yaniv Erlich and Dina Zielinski published <b>DNA Fountain</b>, an encoding scheme built on fountain codes (the same family of erasure-correcting codes used in some real-world data broadcasting) adapted to DNA&rsquo;s specific constraints &mdash; avoiding repetitive sequences and extreme GC-content that synthesis and sequencing handle poorly. Their demonstrated <b><Link href="/limits/LR-003724">density of 215 petabytes per gram</Link></b> came with a working proof of concept: they encoded a full computer operating system, a computer virus, a 1895 film, and other files into synthesized DNA and recovered every byte perfectly after sequencing.</p>

<h2>Why the gap is still enormous</h2>
<p>215 petabytes per gram sounds enormous next to any conventional storage medium, and it is &mdash; but it&rsquo;s still roughly three orders of magnitude below the theoretical ceiling. That gap reflects a genuinely hard practical constraint, not sloppiness: DNA synthesis and sequencing costs and error rates are the real bottleneck, not the coding theory, so closing the gap further depends on progress in wet-lab chemistry as much as in algorithms.</p>

<h2>Why it&rsquo;s here</h2>
<p>DNA storage is a clean example of the Registry&rsquo;s distinction between a theoretical bound and an actually-achieved record &mdash; tracked as two separate, clearly labeled numbers rather than one blended figure that would misrepresent either the theory or the engineering.</p>

<h2>Primary source</h2>
<p><a href="https://www.science.org/doi/10.1126/science.aaj2038" target="_blank" rel="noreferrer">Erlich &amp; Zielinski, “DNA Fountain enables a robust and efficient storage architecture,” Science (2017) ↗</a></p>

</InfoPage>; }
