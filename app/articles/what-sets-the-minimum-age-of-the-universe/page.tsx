import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-sets-the-minimum-age-of-the-universe")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Cosmology" title={post.title} intro={post.dek}>

<p>The standard estimate for the age of the universe &mdash; about 13.8 billion years &mdash; comes from fitting a cosmological model to measurements of the cosmic microwave background. That&rsquo;s a model-dependent number: change the assumptions in the model, and the estimate shifts. The <b><Link href="/limits/LR-003520">cosmic-age lower bound from oldest dated stars</Link></b> is a completely different, model-independent kind of argument: whatever the universe&rsquo;s true age turns out to be, it cannot be younger than the oldest object found inside it.</p>

<h2>Reading a star&rsquo;s age from its light</h2>
<p>Astronomers estimate stellar ages several ways: fitting a globular cluster&rsquo;s stars to theoretical models of how stars evolve (isochrone fitting), or using the cooling rate of white dwarfs, whose interiors stop generating energy and simply radiate away their residual heat on a well-understood physical timescale. Both methods carry real uncertainty from stellar-model assumptions, but they don&rsquo;t depend on the cosmological model being tested &mdash; which is exactly what makes them useful as an independent check.</p>

<h2>A famous case where the two didn&rsquo;t agree</h2>
<p>In the 1990s, this cross-check produced a genuine crisis: some globular-cluster age estimates came in older than the universe&rsquo;s age as calculated from the Hubble constant at the time, which is a logical contradiction &mdash; the whole cannot be younger than one of its parts. The resolution came from multiple directions at once: better stellar-distance calibrations lowered the cluster age estimates, and the discovery of the universe&rsquo;s accelerating expansion (attributed to dark energy) revised the cosmological age estimate upward, bringing the two back into agreement.</p>

<h2>Why the logic still matters today</h2>
<p>Even with that historical tension resolved, the underlying argument remains a standing, permanent constraint: any future refinement of the universe&rsquo;s age &mdash; from new cosmic microwave background data, a revised Hubble constant, or a modified cosmological model &mdash; still has to stay above the age of the oldest reliably dated stars, whatever the currently favored value happens to be. It&rsquo;s a floor, not a moving target.</p>

<h2>Why it&rsquo;s here</h2>
<p>This is a rare kind of lower bound in the Registry: not a mathematical proof or a physical limit, but a straightforward logical consequence (a whole is at least as old as its parts) applied to real, dated astrophysical objects &mdash; independent of whichever cosmological model happens to be current.</p>

<h2>Primary source</h2>
<p><a href="https://arxiv.org/abs/1807.06209" target="_blank" rel="noreferrer">Planck Collaboration, “Planck 2018 results. VI. Cosmological parameters” ↗</a></p>

</InfoPage>; }
