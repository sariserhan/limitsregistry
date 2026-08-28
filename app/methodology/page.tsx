import type { Metadata } from "next";
import InfoPage from "../_components/InfoPage";
import { StatusGuide } from "../../src/components/status-guide";

export const metadata: Metadata = { title: "How a record earns its place. — Limits Registry", description: "How to propose a result, how Claims get accepted, what verification tiers mean, and how a Claim earns a signed certificate." };

export default function Page() { return <InfoPage kicker="Methodology" title="How a record earns its place." intro="How to propose a result, how Claims get accepted, what verification tiers mean, and how a Claim earns a signed certificate.">

<h2>What belongs in the Registry</h2>
<p>A Limit is a permanent Registry ID attached to a versioned specification — the exact formal question, its constraints, and whether the goal is a maximum or a minimum. A Claim asserts something against that specification: an upper bound, a lower bound, an exact value, a construction, a counterexample, or an asymptotic or computational bound. Nothing is published as a Claim until it names a specific relation (&lt;, &le;, =, &ge;, &gt;) and a value.</p>

<StatusGuide />

<h2>Evidence and verification tiers</h2>
<p>Every Claim needs Evidence — a paper, a formal proof, source code, an exhaustive computation, an experiment, a reproduction, a dataset, or a direct observation. Evidence carries one of four verification levels, and a Claim is only as strong as its weakest linked Evidence:</p>
<ul>
<li><b>Reported</b> &mdash; the source&rsquo;s own stated result, not yet independently checked.</li>
<li><b>Source-confirmed</b> &mdash; checked directly against the original paper, proof, or dataset.</li>
<li><b>Independently reproduced</b> &mdash; a separate party reran the construction or experiment and got the same result.</li>
<li><b>Machine-checked</b> &mdash; a formal proof artifact in Lean&nbsp;4, Coq, Isabelle, or a SAT solver, tied to a real 40-character commit hash and verified to build.</li>
</ul>

<h2>How to apply</h2>
<p>Anyone with an account can propose a change to a published Limit from <a href="/submit">/submit</a>:</p>
<ol>
<li>Sign in &mdash; <a href="/signup">create an account</a> if you don&rsquo;t have one.</li>
<li>Pick the Limit and what you&rsquo;re proposing: a better achievable result, a stronger proven bound, a proof, an independent reproduction, or a correction.</li>
<li>Describe the proposal, and where relevant, the proposed relation and value.</li>
<li>Attach an evidence URL &mdash; a paper, proof, or repository &mdash; wherever possible.</li>
<li>Submit. It enters the queue as <b>submitted</b>; nothing publishes automatically.</li>
</ol>
<p>Your own submissions stay visible on the same page as their status moves to <b>under review</b>, then <b>accepted</b>, <b>rejected</b>, or <b>needs revision</b> with a reviewer note.</p>

<h2>How we decide</h2>
<p>A Claim only becomes accepted once its scope is explicit against the current specification, at least one piece of Evidence is attached, and independent editorial review is recorded. Claims that are later disputed or invalidated stay visible as history rather than disappearing &mdash; the Registry doesn&rsquo;t silently overwrite a published record.</p>

<h2>Certification</h2>
<p>An accepted Claim can be issued an integrity certificate once it has Evidence and has cleared independent review.</p>
<div className="info-note"><p>Exact rule: a certificate requires at least one linked piece of Evidence <b>and</b> two accepted independent reviews. Fewer than that, and no certificate can be issued.</p></div>
<p>Issuing a certificate takes an immutable snapshot of the Claim, its specification version, and its evidence, hashes it with SHA-256, and &mdash; where the issuer key is available &mdash; signs it with Ed25519. The result is a public, permanent record at <code>/certificates/CERT-&lt;claim number&gt;</code>, downloadable as a PDF, that anyone can use to verify the Claim hasn&rsquo;t changed since it was certified.</p>

<h2>Status badges</h2>
<p>Every published record exposes an embeddable status badge at <code>/api/badge/&#123;registryNumber&#125;</code>, colored by whether it&rsquo;s proven, disputed, or open &mdash; for citing a Limit&rsquo;s current state from outside the Registry.</p>

<h2>What stays fixed</h2>
<p>Three things the Registry won&rsquo;t do, by design: render a draft or nonexistent record as if it were published; silently overwrite a disputed or invalidated Claim instead of keeping it in the visible history; or issue a machine-checked verification without a real, resolvable commit hash behind it.</p>

<h2>Corrections</h2>
<p>Submit a correction through <a href="/submit">/submit</a> with the relevant Registry ID, source, and precise proposed change &mdash; it goes through the same review queue as any other proposal. For anything you&rsquo;d rather not post publicly first, email <a href="mailto:support@limitsregistry.com">support@limitsregistry.com</a>.</p>

</InfoPage>; }
