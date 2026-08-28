import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("millennium-prize-problems-list")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Mathematics" title={post.title} intro={post.dek}>

<p>In May 2000, the Clay Mathematics Institute named seven problems it considered the most important unsolved questions in mathematics, and put a <b>$1,000,000</b> prize on each. Twenty-five years later, six are still open.</p>

<h2>The one that&rsquo;s solved</h2>
<p>The <b>Poincar&eacute; conjecture</b> &mdash; a statement about which shapes can be continuously deformed into a sphere &mdash; was proved by Grigori Perelman in a series of papers posted between 2002 and 2003, building on Richard Hamilton&rsquo;s Ricci flow program. The Clay Institute verified the proof and awarded Perelman the prize in 2010. He declined it, as he had earlier declined the Fields Medal for the same work.</p>

<h2>The six that are open</h2>
<ul>
<li><b><Link href="/limits/LR-P-VS-NP">P versus NP</Link></b> &mdash; Can every problem whose solution is quickly checkable also be quickly solved? Almost certainly the most consequential of the seven for computing, since a &ldquo;yes&rdquo; would upend cryptography as it currently exists.</li>
<li><b><Link href="/limits/LR-RIEMANN">The Riemann hypothesis</Link></b> &mdash; A precise claim about where the zeros of the Riemann zeta function lie, with deep implications for the distribution of prime numbers. First conjectured by Bernhard Riemann in 1859.</li>
<li><b><Link href="/limits/LR-YANG-MILLS">Yang&ndash;Mills existence and mass gap</Link></b> &mdash; Asks for a rigorous mathematical construction of Yang&ndash;Mills quantum field theory, and a proof that it has a &ldquo;mass gap&rdquo; &mdash; physicists use the theory successfully, but a mathematically complete foundation for it doesn&rsquo;t yet exist.</li>
<li><b><Link href="/limits/LR-NAVIER-STOKES">Navier&ndash;Stokes existence and smoothness</Link></b> &mdash; The Navier&ndash;Stokes equations describe how fluids flow, and are used constantly in engineering. Nobody has proven that solutions to them always exist and stay well-behaved (rather than blowing up) in three dimensions.</li>
<li><b><Link href="/limits/LR-HODGE">The Hodge conjecture</Link></b> &mdash; A question in algebraic geometry about whether certain topological features of complex algebraic varieties can always be built from simpler algebraic pieces.</li>
<li><b><Link href="/limits/LR-BSD">The Birch and Swinnerton-Dyer conjecture</Link></b> &mdash; Relates the number of rational points on an elliptic curve to the behavior of an associated L-function. Named for the two mathematicians who found the pattern computationally at Cambridge in the early 1960s.</li>
</ul>

<h2>Why they&rsquo;ve stayed open this long</h2>
<p>Each problem sits at the edge of a mature field &mdash; number theory, geometry, fluid dynamics, computational complexity, quantum field theory &mdash; where the basic tools are well developed but this specific question has resisted them. That&rsquo;s part of why the Clay Institute picked these seven: not obscure curiosities, but load-bearing questions whose resolution would ripple through the rest of the field.</p>

<h2>Why they&rsquo;re here</h2>
<p>Each of the six open problems is tracked as its own record, with its formal statement, its current status, and links to the Clay Institute&rsquo;s own official problem description &mdash; so nothing here is secondhand or paraphrased from memory.</p>

</InfoPage>; }
