import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-a-ramsey-number")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Combinatorics" title={post.title} intro={post.dek}>

<p>Invite enough people to a party, and among any group that large, you&rsquo;re guaranteed to find either a clique of mutual acquaintances or a clique of mutual strangers of a certain size &mdash; no matter how the acquaintances happen to be arranged. The Ramsey number R(m, n) is the exact smallest party size where that guarantee kicks in for a clique of m acquaintances or n strangers.</p>

<h2>A concrete, solved example</h2>
<p>R(3, 3) = 6 is the classic version: at any party of 6 people, there must be either 3 mutual acquaintances or 3 mutual strangers. At a party of only 5, you can arrange things to avoid both &mdash; so 6 is exact, not just an upper bound.</p>
<p>Two other exact values are known: <Link href="/limits/LR-RAMSEY-4-4">R(4,4) = 18</Link>, proved by Greenwood and Gleason in 1955, and <Link href="/limits/LR-RAMSEY-4-5">R(4,5) = 25</Link>, proved by McKay and Radziszowski in 1995 and, in 2024, independently re-verified inside the HOL4 formal proof assistant &mdash; a machine-checked confirmation of a decades-old human proof.</p>

<h2>Why R(5,5) is the famous unknown one</h2>
<p>R(5,5) is not known exactly. The best current bounds, from the standard reference (Radziszowski&rsquo;s dynamic survey <i>Small Ramsey Numbers</i>), are <b>43 &le; R(5,5) &le; 46</b>. The lower bound of 43 has stood since 1989; the upper bound was 49 as of 1997, tightened to 48 in 2016, and tightened again to 46 in a 2024 paper by Angeltveit and McKay. There&rsquo;s a standing conjecture &mdash; not a proof &mdash; that the true value is exactly 43. See the full record at <Link href="/limits/LR-RAMSEY-5-5">LR-RAMSEY-5-5</Link>.</p>
<p>Paul Erdős is often quoted describing the difficulty: even with every computer on Earth working on it, determining R(5,5) exactly might be beyond reach before an alien invasion forces a faster answer by less peaceful means &mdash; humorous, but a genuine reflection of how badly brute-force search scales here. The number of ways to 2-color the edges of a graph on just 45 vertices vastly exceeds the number of atoms in the observable universe.</p>

<h2>Why it&rsquo;s hard</h2>
<p>Ramsey numbers grow explosively, and there&rsquo;s no known formula &mdash; each one has essentially had to be pinned down by a combination of clever combinatorial constructions (for the lower bound) and increasingly heavy computer search (for the upper bound). Proving an exact value means closing the gap from both directions at once, and for R(5,5), that gap has taken 35 years to shrink from 7 to 3.</p>

<h2>Why it&rsquo;s here</h2>
<p>Ramsey numbers are a case where &ldquo;we don&rsquo;t know the exact answer&rdquo; is itself a precise, well-defined, actively narrowing fact &mdash; exactly what a bound frontier is supposed to capture, rather than a vague open question with no measurable progress.</p>

</InfoPage>; }
