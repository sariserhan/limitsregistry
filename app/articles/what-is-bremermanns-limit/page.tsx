import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-bremermanns-limit")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Physics" title={post.title} intro={post.dek} sponsorRecord="LR-003308">

<p>In 1962, mathematician and biophysicist Hans Bremermann proposed a ceiling on how fast any physical system could process information, based on combining relativity (mass-energy equivalence) with the quantum time-energy uncertainty relation. The <b><Link href="/limits/LR-003308">Bremermann information-processing bound</Link></b> states that a system with energy <i>E</i> cannot process information faster than <i>R</i> &le; 2<i>E</i>/(&pi;&#295; ln 2) bits per second. For one kilogram of mass converted entirely to computing energy, that works out to roughly 1.36 &times; 10<sup>50</sup> bits per second &mdash; a number since cited in arguments about the ultimate limits of brute-force computation and cryptographic key strength.</p>

<h2>A heuristic, not a derivation</h2>
<p>Bremermann&rsquo;s original argument wasn&rsquo;t a rigorous proof from first principles; it was a plausibility estimate, combining two established physical relations in a way that gave a physically reasonable-sounding number. The Registry records it with an epistemic status of <i>literature-asserted</i> rather than independently confirmed, because its universality depends on assumptions about how the bound applies to real computing hardware that the original paper didn&rsquo;t fully justify.</p>

<h2>A rigorous version arrived decades later</h2>
<p>In 1998, Norman Margolus and Lev Levitin derived a closely related bound properly from quantum mechanics: a quantum system with average energy <i>E</i> above its ground state can pass through at most 2<i>E</i>/(&pi;&#295;) mutually distinguishable states per second &mdash; the same structural formula as Bremermann&rsquo;s, without his ln 2 factor, but now with an actual quantum-mechanical proof behind it rather than a heuristic combination. The Margolus&ndash;Levitin theorem is what physicists now treat as the fundamental version of this limit.</p>

<h2>Why it&rsquo;s here</h2>
<p>Bremermann&rsquo;s bound is a useful case study in the Registry&rsquo;s own methodology: an early, widely cited claim that turned out to be an approximation of a later, more rigorously derived result. Both are tracked, with their evidence and epistemic status stated plainly rather than collapsed into a single number.</p>

<h2>Primary source</h2>
<p><a href="https://doi.org/10.1016/S0167-2789(98)00054-2" target="_blank" rel="noreferrer">Margolus &amp; Levitin, “The maximum speed of dynamical evolution,” Physica D 120 (1998) ↗</a></p>

</InfoPage>; }
