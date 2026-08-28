import type { Metadata } from "next";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";
const post = getBlogPost("what-is-the-no-cloning-theorem")!;
export const metadata: Metadata = { title: `What Is the No-Cloning Theorem? — Limits Registry`, description: post.dek, alternates: { canonical: `/articles/${post.slug}` }, openGraph: { title: `What Is the No-Cloning Theorem? — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" }, twitter: { card: "summary_large_image", title: `What Is the No-Cloning Theorem? — Limits Registry`, description: post.dek } };
export default function Page() { return <InfoPage kicker="Articles · Quantum information" title={post.title} intro={post.dek}><p>Classical information can be copied freely: duplicate a file, and the new file can be identical to the old one. Quantum information is different. The no-cloning theorem says there is no universal process that takes an arbitrary unknown quantum state and produces two perfect copies of it.</p>
<h2>The short proof idea</h2>
<p>Suppose a machine could clone both states |a&gt; and |b&gt;. Quantum operations are linear, so the machine would also have to clone every superposition of those states. But the inner product between two states would then be squared by the copying operation, while a physical evolution must preserve that inner product. Those requirements agree only in special cases, not for arbitrary unknown states.</p>
<h2>What it does not say</h2>
<p>It does not say quantum information can never be copied. Known basis states can be prepared again, and classical measurement results can be duplicated. The prohibition applies to a <i>universal perfect copier</i> acting on an unknown state. Approximate cloning and state-dependent operations are possible, but they are different claims with different limits.</p>
<h2>Why it matters</h2>
<p>No-cloning is not merely a philosophical oddity. It is part of why quantum key distribution can detect interception: an eavesdropper cannot silently make perfect backups of unknown quantum states. It is also a model example of how a rigorous impossibility result can define a boundary more sharply than a record of successful experiments.</p>
<h2>Primary source</h2>
<p><a href="https://www.nature.com/articles/299802a0" target="_blank" rel="noreferrer">Wootters and Zurek, “A single quantum cannot be cloned,” Nature ↗</a></p></InfoPage>; }
