import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("why-are-physical-constants-known-so-precisely")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Physics" title={post.title} intro={post.dek}>

<p>Look up the mass of a proton and you&rsquo;ll get a number with ten significant figures and an explicit uncertainty on the last two. That precision isn&rsquo;t a rounding trick &mdash; it&rsquo;s the output of a formal, internationally coordinated process called CODATA, and it&rsquo;s the reason two labs on opposite sides of the world can agree on what &ldquo;one kilogram&rdquo; means without ever comparing physical objects.</p>

<h2>What CODATA actually does</h2>
<p>CODATA &mdash; the Committee on Data of the International Science Council &mdash; periodically publishes an <i>adjustment</i>: a single, internally consistent set of values for the fundamental physical constants, produced by a least-squares fit across every relevant published measurement worldwide. The 2022 adjustment (released in 2024) is the current reference; the Registry catalogs it as roughly 200 individual records, one per constant, each linked to the official NIST reference table &mdash; browse them under <Link href="/categories/physics">Physics</Link>.</p>

<h2>Exact vs. measured</h2>
<p>Since the 2019 redefinition of the SI system, a handful of constants aren&rsquo;t measured at all &mdash; they&rsquo;re <i>defined</i>. The Planck constant, the elementary charge, the Boltzmann constant, and the Avogadro constant now have exact, fixed values by international agreement (the speed of light was fixed earlier, in 1983). Every other SI unit is now built from these fixed anchors.</p>
<p>Everything else &mdash; the mass of the proton, the fine-structure constant, the gravitational constant &mdash; is still genuinely measured, and CODATA&rsquo;s job is to reconcile potentially conflicting experiments into one recommended value with an honest uncertainty. Some, like the electron mass, are known to 11 significant figures. Others, notably the gravitational constant G, are notorious for barely budging in precision across a century of experiments &mdash; different labs&rsquo; best measurements of G still disagree beyond their stated uncertainties, which is itself an open problem in experimental physics.</p>

<h2>Why record both value and uncertainty</h2>
<p>A constant reported without its uncertainty is only half a fact. The Registry stores each CODATA value alongside its stated standard uncertainty exactly as NIST publishes it &mdash; not rounded off for readability &mdash; because the uncertainty is what tells you whether a future measurement that differs is a contradiction or just noise.</p>

<h2>Why they&rsquo;re here</h2>
<p>Physical constants are as close as science gets to a settled fact, but &ldquo;settled&rdquo; still means &ldquo;measured to a stated precision by a stated method,&rdquo; not &ldquo;assumed.&rdquo; Cataloging them the same way as an open conjecture &mdash; with a source, a status, and a reviewable record &mdash; is the point.</p>

</InfoPage>; }
