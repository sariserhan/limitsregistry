import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-the-vesuvius-challenge")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Computer vision" title={post.title} intro={post.dek} sponsorRecord="LR-VESUVIUS">

<p>When Mount Vesuvius buried the Roman town of Herculaneum in 79 AD, it carbonized an entire library of papyrus scrolls into blocks of fragile black carbon. Unrolling one by hand crumbles it. For over two centuries, that left a real library of ancient text that nobody could read. The <b><Link href="/limits/LR-VESUVIUS">Vesuvius Challenge</Link></b>, founded by Nat Friedman and Daniel Gross, offers a $1,000,000 Grand Prize &mdash; part of a $2.14M total prize pool &mdash; to the first team that reads a complete scroll without ever physically opening it.</p>

<h2>Scanning what you can&rsquo;t touch</h2>
<p>The approach builds on years of prior work by classicist and computer scientist Brent Seales: scan a sealed, carbonized scroll with a CT scanner to capture its internal geometry in three dimensions, then use machine learning to trace the scroll&rsquo;s layered surface through that scan (&ldquo;virtual unrolling&rdquo;) and detect the faint textural signature that carbon-based ink leaves on carbonized papyrus, even where there is no visible contrast to the eye.</p>

<h2>Progress before the Grand Prize</h2>
<p>Rather than waiting for a single team to solve the entire problem at once, the Challenge staged smaller prizes along the way to reward incremental progress &mdash; letters, then passages, recovered from real scroll scans by competitors building on each other&rsquo;s published techniques. That structure turned a decades-old, seemingly frozen problem into a fast-moving public competition within about a year of launch.</p>

<h2>What&rsquo;s still open</h2>
<p>The full Grand Prize &mdash; reading the substantial majority of an entire scroll, not just a passage &mdash; remained unclaimed as of the most recent published update, with a competition deadline of June 25, 2027. The gap between reading a passage and reading a whole scroll is significant: longer stretches accumulate more damage, more ambiguous ink signal, and more places for a virtual-unrolling model to lose track of the surface.</p>

<h2>Why it&rsquo;s here</h2>
<p>The Vesuvius Challenge is an unusually direct example of the Registry&rsquo;s core idea applied outside math and physics: a precisely defined, publicly verifiable target (readable text, from a specific unopened scroll, by a specific date) with a real record of how far current methods have actually gotten.</p>

<h2>Primary source</h2>
<p><a href="https://scrollprize.org/" target="_blank" rel="noreferrer">Vesuvius Challenge, official site ↗</a></p>

</InfoPage>; }
