import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("why-cant-edit-distance-be-computed-faster")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Algorithms" title={post.title} intro={post.dek} sponsorRecord="LR-DRAFT-ALG-07">

<p>The edit distance between two strings is the minimum number of single-character insertions, deletions, or substitutions needed to turn one into the other &mdash; the basis of spell-checkers, DNA sequence alignment, and diff tools. In 1974, Robert Wagner and Michael Fischer described a dynamic-programming algorithm that computes it in O(n<sup>2</sup>) time for strings of length n. For over 40 years afterward, nobody found anything meaningfully faster for the general problem, despite it being one of the most heavily studied problems in algorithms. The <b><Link href="/limits/LR-DRAFT-ALG-07">edit-distance fine-grained barrier</Link></b> is the proof of why.</p>

<h2>A different kind of hardness proof</h2>
<p>In 2015, Arturs Backurs and Piotr Indyk proved that a truly subquadratic algorithm for edit distance &mdash; one running in O(n<sup>2&minus;&delta;</sup>) time for any fixed &delta; &gt; 0 &mdash; would imply a faster algorithm for Boolean satisfiability than is believed to exist under the <b>Strong Exponential Time Hypothesis (SETH)</b>. SETH is a stronger, more specific conjecture than P &ne; NP: it says that satisfiability on n variables genuinely requires close to 2<sup>n</sup> time, not just &ldquo;more than polynomial&rdquo; time. This style of argument &mdash; a conditional lower bound tied to a specific exponent, not just a growth class &mdash; is the signature move of a subfield called fine-grained complexity.</p>

<h2>What the barrier actually says</h2>
<p>The Registry states the result as a conditional lower bound: solving edit distance requires n<sup>2&minus;o(1)</sup> time, assuming SETH. That&rsquo;s deliberately not the same certainty as a proof that P &ne; NP would give &mdash; SETH could in principle be false &mdash; but SETH has resisted refutation for the exact string, satisfiability, and graph problems it&rsquo;s been tested against for just as long as P &ne; NP has, which is why the field treats conditional lower bounds built on it as strong evidence rather than folklore.</p>

<h2>Why it&rsquo;s here</h2>
<p>Most of the open problems in the Registry ask whether a faster algorithm <i>could</i> exist. Fine-grained barriers like this one instead pin down a specific exponent as the likely final answer, conditional on a named, actively studied assumption &mdash; a useful third category alongside &ldquo;proven&rdquo; and &ldquo;unconditionally open.&rdquo;</p>

<h2>Primary source</h2>
<p><a href="https://arxiv.org/abs/1412.0348" target="_blank" rel="noreferrer">Backurs &amp; Indyk, “Edit Distance Cannot Be Computed in Strongly Subquadratic Time (unless SETH is false)” ↗</a></p>

</InfoPage>; }
