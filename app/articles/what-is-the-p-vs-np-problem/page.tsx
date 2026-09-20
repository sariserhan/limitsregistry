import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-p-vs-np-problem")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Computational complexity" title={post.title} intro={post.dek} sponsorRecord="LR-P-VS-NP">

<p>Some problems are hard to solve but easy to check. Given a proposed route through a hundred cities, verifying it&rsquo;s under some target length is quick; finding the shortest route from scratch might take far longer. <b><Link href="/limits/LR-P-VS-NP">P versus NP</Link></b> asks whether that gap is real &mdash; whether every problem whose solution can be verified quickly (in polynomial time, the class NP) can also be solved quickly from scratch (the class P). Stephen Cook and Leonid Levin formulated the question independently in 1971.</p>

<h2>Why almost everyone believes P &ne; NP</h2>
<p>Thousands of problems &mdash; from scheduling to protein folding to circuit design &mdash; have been shown to be &ldquo;NP-complete,&rdquo; meaning a fast algorithm for any one of them would give a fast algorithm for all of them. Decades of trying and failing to find such an algorithm for even one NP-complete problem is the main evidence behind the near-universal (but unproven) belief that P &ne; NP.</p>

<h2>What a &ldquo;yes&rdquo; would break</h2>
<p>Modern public-key cryptography leans on problems believed to be hard to solve but is built on complexity assumptions weaker than P = NP specifically. Still, a constructive proof that P = NP would very likely make those hardness assumptions collapse too, since it would generally imply fast algorithms for the underlying hard problems themselves.</p>

<h2>Why it&rsquo;s here</h2>
<p>P versus NP is one of the seven <Link href="/articles/millennium-prize-problems-list">Millennium Prize Problems</Link>, each carrying a $1,000,000 award from the Clay Mathematics Institute for a correct proof either way. The Registry tracks it as an open record with its formal statement, distinct from the roundup of all seven, because the complexity-theory backstory is worth its own explanation.</p>

<h2>Primary source</h2>
<p><a href="https://www.claymath.org/millennium/p-vs-np/" target="_blank" rel="noreferrer">Clay Mathematics Institute, “P vs NP Problem” ↗</a></p>

</InfoPage>; }
