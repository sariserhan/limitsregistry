import type { Metadata } from "next";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";
const post = getBlogPost("what-is-channel-capacity")!;
export const metadata: Metadata = { title: `What Is Channel Capacity? — Limits Registry`, description: post.dek, alternates: { canonical: `/articles/${post.slug}` }, openGraph: { title: `What Is Channel Capacity? — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" }, twitter: { card: "summary_large_image", title: `What Is Channel Capacity? — Limits Registry`, description: post.dek } };
export default function Page() { return <InfoPage kicker="Articles · Information theory" title={post.title} intro={post.dek}><p>Every communication channel introduces uncertainty: a radio signal picks up noise, a storage device flips bits, and a fiber link loses or distorts light. Channel capacity is the sharp boundary between rates that can be made reliable and rates that cannot, under a stated channel model.</p>
<h2>More redundancy, not magic</h2>
<p>Sending the same message repeatedly is one simple error-correction strategy, but it wastes bandwidth. Shannon&rsquo;s insight was that carefully designed codes can spread information across a long block so that the receiver can correct typical noise while the overhead approaches a precise limit.</p>
<h2>The threshold</h2>
<p>Below capacity, the probability of decoding error can be driven arbitrarily close to zero as block length grows. Above capacity, no coding scheme can make reliable communication possible under the same assumptions. Capacity is therefore both an achievability statement and a converse: a lower-side construction and an upper-side impossibility bound meet.</p>
<h2>Assumptions are the point</h2>
<p>There is no single capacity for “the internet” or “a radio.” The value depends on the channel law, bandwidth, power, alphabet, memory, and error criterion. Change those assumptions and the frontier changes too. A meaningful record must say which channel it describes.</p>
<h2>Primary source</h2>
<p><a href="https://doi.org/10.1002/j.1538-7305.1948.tb01338.x" target="_blank" rel="noreferrer">Shannon, “A Mathematical Theory of Communication,” Bell System Technical Journal ↗</a></p></InfoPage>; }
