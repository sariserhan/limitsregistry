import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-navier-stokes-problem")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Fluid dynamics" title={post.title} intro={post.dek} sponsorRecord="LR-NAVIER-STOKES">

<p>The Navier&ndash;Stokes equations, worked out in the 19th century, describe how a fluid&rsquo;s velocity and pressure change over time and space. Engineers solve approximations of them constantly &mdash; to design aircraft wings, model weather systems, and simulate blood flow &mdash; almost always numerically, on a computer, rather than exactly. The <b><Link href="/limits/LR-NAVIER-STOKES">Navier&ndash;Stokes existence and smoothness</Link></b> problem asks a more basic mathematical question that all that engineering practice quietly assumes: in three dimensions, given reasonable starting conditions, do exact solutions always exist for all future time and stay smooth &mdash; or can they blow up into a singularity in finite time?</p>

<h2>A gap between using a tool and understanding it</h2>
<p>This is an unusual kind of open problem: it&rsquo;s not that Navier&ndash;Stokes solutions are hard to compute in practice, it&rsquo;s that nobody has proven they always behave well in principle. A blow-up &mdash; velocity or some derivative becoming infinite in finite time &mdash; has never been observed in a real proof or a rigorous simulation, but no one has ruled it out either. Both a full existence-and-smoothness proof and a single constructed counterexample would resolve the problem; either is currently out of reach.</p>

<h2>Why it&rsquo;s hard</h2>
<p>The equations are nonlinear, and the nonlinear term is exactly what makes fluids turbulent &mdash; the same feature that produces the rich, chaotic behavior fluids actually show. Related simplified or modified versions of the equations have been fully solved in some cases, which is part of why this specific three-dimensional, full-generality version has become the benchmark question in the field.</p>

<h2>Why it&rsquo;s here</h2>
<p>Navier&ndash;Stokes is one of the seven <Link href="/articles/millennium-prize-problems-list">Millennium Prize Problems</Link>, carrying a $1,000,000 award from the Clay Mathematics Institute. It sits in the Registry as its own record with the precise formal statement, since &ldquo;do the equations that run every weather model actually always make sense&rdquo; deserves more than a one-line summary.</p>

<h2>Primary source</h2>
<p><a href="https://www.claymath.org/millennium/navier-stokes-equation/" target="_blank" rel="noreferrer">Clay Mathematics Institute, “Navier–Stokes Equation” ↗</a></p>

</InfoPage>; }
