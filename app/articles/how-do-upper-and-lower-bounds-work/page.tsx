import type { Metadata } from "next";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";
const post = getBlogPost("how-do-upper-and-lower-bounds-work")!;
export const metadata: Metadata = { title: `How Do Upper and Lower Bounds Work? — Limits Registry`, description: post.dek, alternates: { canonical: `/articles/${post.slug}` }, openGraph: { title: `How Do Upper and Lower Bounds Work? — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" }, twitter: { card: "summary_large_image", title: `How Do Upper and Lower Bounds Work? — Limits Registry`, description: post.dek } };
export default function Page() { return <InfoPage kicker="Articles · Methodology" title={post.title} intro={post.dek}><p>Suppose a problem asks for the smallest possible value of some quantity. A <b>lower bound</b> proves the answer cannot be smaller than a number. An <b>upper bound</b> proves it cannot be larger. Together they create an interval of possibility.</p>
<h2>Two different kinds of evidence</h2>
<p>Lower bounds usually come from a construction: here is an object that achieves value 43, so the optimum is at least 43. Upper bounds usually come from a converse or impossibility argument: every valid object is limited to value 46, so the optimum is at most 46. They are not interchangeable, even when they happen to use similar mathematics.</p>
<h2>The gap is information</h2>
<p>If both bounds agree, the answer is exact. If they do not, the gap is not a failure of the record; it is the record. Saying <b>43 &le; X &le; 46</b> rules out every value outside that interval and makes the next useful contribution obvious: improve one side, or find a proof that closes the interval.</p>
<h2>Why wording matters</h2>
<p>Every bound depends on scope. Change the dimension, allowed operations, error tolerance, or asymptotic regime, and you may be asking a different question. That is why the Registry stores Claims against a versioned specification instead of treating a number as context-free.</p>
<h2>Read the frontier</h2>
<p>On a canonical Limit page, look for the direction symbol, the value, the scope, and the evidence behind it. A construction can show what is achievable. Only a matching upper-bound argument can show that nothing better is possible.</p></InfoPage>; }
