import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-landauers-principle")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Information theory" title={post.title} intro={post.dek} sponsorRecord="LR-DRAFT-LANDAUER">

<p>Computation feels abstract, but it happens in physical hardware, and physics has an opinion about it. In 1961, IBM physicist Rolf Landauer showed that any <i>logically irreversible</i> operation &mdash; one where you can&rsquo;t work backward from the output to recover the input, like overwriting a bit or erasing a memory cell &mdash; must dissipate a minimum amount of heat into the environment. The <b><Link href="/limits/LR-DRAFT-LANDAUER">Landauer bit-erasure limit</Link></b> puts a number on it: erasing one bit at temperature <i>T</i> dissipates at least <i>Q</i> = <i>k</i><sub>B</sub><i>T</i> ln(2) of energy, where <i>k</i><sub>B</sub> is Boltzmann&rsquo;s constant.</p>

<h2>Information and entropy are the same currency</h2>
<p>Landauer&rsquo;s insight connects two things that don&rsquo;t obviously belong together: information theory and thermodynamics. Erasing a bit destroys information about its prior state, which reduces the system&rsquo;s entropy — and the second law of thermodynamics demands that entropy show up somewhere, so it&rsquo;s expelled as heat into the surroundings. Reversible operations, ones where the output determines the input uniquely, are exempt: in principle they can be done with no minimum energy cost at all, which is the whole motivation behind reversible-computing research.</p>

<h2>Confirmed in the lab, not just on paper</h2>
<p>For half a century the bound was a theoretical argument. In 2012, a team led by Antoine B&eacute;rut and Sergio Ciliberto experimentally measured the heat dissipated by erasing a single bit stored in a colloidal particle trapped by a laser, and found it matched the <i>k</i><sub>B</sub><i>T</i> ln(2) prediction.</p>

<h2>Why it matters for real computers</h2>
<p>Today&rsquo;s transistors dissipate many orders of magnitude more energy per bit-erasure than the Landauer limit — the bound isn&rsquo;t yet the practical bottleneck. But as chips keep shrinking and energy efficiency keeps mattering more, it sets the theoretical floor that conventional (irreversible) digital computation can never beat, no matter how good the engineering gets.</p>

<h2>Primary source</h2>
<p><a href="https://www.nature.com/articles/nature10872" target="_blank" rel="noreferrer">Bérut et al., “Experimental verification of Landauer’s principle linking information and thermodynamics,” Nature (2012) ↗</a></p>

</InfoPage>; }
