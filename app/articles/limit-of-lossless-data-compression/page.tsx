import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("limit-of-lossless-data-compression")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Information theory" title={post.title} intro={post.dek}>

<p>Every lossless compression algorithm &mdash; zip, gzip, the codec behind a PNG &mdash; is bounded by a limit that was proven mathematically in 1948, decades before any of them existed. No amount of cleverness in the algorithm can beat it, because the limit isn&rsquo;t about the algorithm. It&rsquo;s about the information itself.</p>

<h2>Shannon&rsquo;s source-coding theorem</h2>
<p>Claude Shannon&rsquo;s 1948 paper <i>A Mathematical Theory of Communication</i> defined a quantity called <b>entropy</b>: given a source that produces symbols with certain probabilities, entropy measures the average number of bits genuinely needed to represent each symbol, given how predictable or surprising it is. A source that&rsquo;s highly predictable (say, English text, where &ldquo;e&rdquo; is far more common than &ldquo;z&rdquo;) has low entropy per symbol; a source of true coin flips has the maximum possible entropy, one bit per flip.</p>
<p>The source-coding theorem states that no lossless encoding scheme can, on average, use fewer bits per symbol than the source&rsquo;s entropy &mdash; and, just as importantly, that schemes getting arbitrarily close to that limit actually exist. It&rsquo;s tracked in the Registry as <Link href="/limits/LR-DRAFT-SHANNON">Shannon channel capacity and source-coding limits</Link>.</p>

<h2>Why real compressors don&rsquo;t hit it exactly</h2>
<p>Practical formats trade a little efficiency for speed and simplicity. Huffman coding, used inside many common formats, is provably optimal only when every symbol&rsquo;s probability happens to be a power of two; arithmetic coding and modern range coders get much closer to true entropy for arbitrary distributions, at some extra computational cost. The gap between a real-world compressor and the Shannon limit is a genuine, measurable inefficiency &mdash; and it&rsquo;s also why compression research hasn&rsquo;t stopped: better <i>modeling</i> of a source&rsquo;s true statistics (what real files actually look like) still yields real gains, even though the entropy floor itself hasn&rsquo;t moved since 1948.</p>

<h2>What the limit doesn&rsquo;t cover</h2>
<p>Entropy is defined relative to a specific probabilistic model of the source. Two different files with identical byte content can have different achievable compressed sizes if you&rsquo;re allowed a smarter model of what &ldquo;normal&rdquo; data looks like for that context &mdash; general-purpose compressors like gzip use a fairly generic model, while a specialized compressor built for, say, DNA sequences or a specific image format can do meaningfully better precisely because it encodes stronger prior assumptions about the data. The theorem isn&rsquo;t violated either way; the achievable limit just depends on what you&rsquo;re allowed to assume in advance.</p>

<h2>Why it&rsquo;s here</h2>
<p>The source-coding theorem is one of the oldest and most thoroughly settled entries in the Registry &mdash; a hard mathematical limit, not an engineering target, established the same year the field of information theory itself was founded.</p>

</InfoPage>; }
