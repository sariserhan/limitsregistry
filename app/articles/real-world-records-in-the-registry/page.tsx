import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("real-world-records-in-the-registry")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Methodology" title={post.title} intro={post.dek}>

<p>Most of this Registry tracks mathematical and physical limits &mdash; quantities with a proof or a citation behind them, not a stopwatch. But a world record is the same kind of object in a different domain: a precise, dated, source-confirmed claim about the best demonstrated value of something, open to being beaten. That&rsquo;s worth tracking the same way, with the same discipline about sourcing and scope.</p>

<h2>What&rsquo;s published</h2>
<p><Link href="/limits/LR-100M-MEN">Usain Bolt&rsquo;s 9.58-second 100 meters</Link> (Berlin, 2009) and <Link href="/limits/LR-100M-WOMEN">Florence Griffith-Joyner&rsquo;s 10.49 seconds</Link> (Indianapolis, 1988) anchor the sprint records. <Link href="/limits/LR-MARATHON-MEN">Sabastian Sawe&rsquo;s 1:59:30</Link> at the 2026 London Marathon was the first sub-two-hour marathon ever run in official, record-eligible conditions. On the animal side, <Link href="/limits/LR-PEREGRINE-FALCON-DIVE">a peregrine falcon&rsquo;s 389.5 km/h hunting dive</Link> and <Link href="/limits/LR-BLUE-WHALE-MASS">a 190-tonne blue whale</Link> represent the fastest and heaviest confirmed animals on record. <Link href="/limits/LR-DEEPEST-CREWED-DIVE">Victor Vescovo&rsquo;s 10,934-meter dive</Link> to the bottom of Challenger Deep is the deepest a crewed vessel has ever gone.</p>

<h2>Every record gets its edges shown, not smoothed over</h2>
<p>Florence Griffith-Joyner&rsquo;s record carries a real, disclosed caveat: some biomechanists have long argued the official 0.0 m/s wind reading understated an assisting wind, though World Athletics has never annulled it. The largest wind turbine record cites the Guinness-certified 16 MW Mingyang unit rather than a larger, newer prototype that hasn&rsquo;t been independently certified yet &mdash; a real gap between engineering press coverage and formal certification. That&rsquo;s the same posture the Registry takes toward a disputed mathematical bound: state what&rsquo;s actually verified, and say plainly where the dispute or the lag sits.</p>

<h2>Not every record makes the cut</h2>
<p>Two categories that came up while building this batch never got published: a specific manufacturer&rsquo;s claimed robot-arm repeatability, because no independent body tracks it as a comparable record the way sports federations do; and a single &ldquo;packet-loss bound,&rdquo; because the real number varies by which network standard and configuration you mean, with no one figure that fairly represents all of them. A record that can&rsquo;t be pinned to one clean, checkable claim doesn&rsquo;t get published just to fill a category.</p>

<h2>Why it&rsquo;s here</h2>
<p>A registry that only tracks unsolved math problems is a curiosity. One that also tracks the fastest human, the deepest dive, and a 2026 world record still just weeks old is a working demonstration that &ldquo;evidence before assertion&rdquo; isn&rsquo;t a slogan reserved for pure mathematics &mdash; it&rsquo;s how every entry here gets treated.</p>

</InfoPage>; }
