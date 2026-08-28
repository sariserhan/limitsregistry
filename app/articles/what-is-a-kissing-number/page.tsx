import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";
const post = getBlogPost("what-is-a-kissing-number")!;
export const metadata: Metadata = { title: `What Is a Kissing Number? — Limits Registry`, description: post.dek, alternates: { canonical: `/articles/${post.slug}` }, openGraph: { title: `What Is a Kissing Number? — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" }, twitter: { card: "summary_large_image", title: `What Is a Kissing Number? — Limits Registry`, description: post.dek } };
export default function Page() { return <InfoPage kicker="Articles · Geometry" title={post.title} intro={post.dek}><p>Imagine placing identical billiard balls around one central ball. How many can touch it at once without any two outer balls overlapping? That maximum is the <i>kissing number</i> of the space, written <i>k(n)</i> in n-dimensional Euclidean space.</p>
<h2>Three dimensions is not obvious</h2>
<p>In two dimensions, six equal circles fit around a central circle. In three dimensions, the answer is 12. The picture looks familiar, but proving that 13 cannot fit is much harder than arranging 12. The three-dimensional case was settled in 1953 after a long history of competing constructions and arguments.</p>
<h2>Four dimensions: exactly 24</h2>
<p>The four-dimensional problem is a useful reminder that a construction is only half a result. It is easy to show that 24 spheres can touch a central sphere using a highly symmetric arrangement. The difficult part is proving that a 25th sphere is impossible. Oleg Musin&rsquo;s proof established <b>k(4) = 24</b> using a strengthened version of Delsarte&rsquo;s method.</p>
<h2>Why the Registry cares</h2>
<p>A kissing number is a clean frontier: a precise object, a precise metric, and a number that can move only when a construction or an impossibility proof improves. Browse the Registry&rsquo;s related <Link href="/limits/LR-000141">discrete-geometry records</Link> for the same distinction between an achieved arrangement and a proven optimum.</p>
<h2>Primary source</h2>
<p><a href="https://annals.math.princeton.edu/2008/168-1/p01" target="_blank" rel="noreferrer">Musin, “The kissing number in four dimensions,” Annals of Mathematics ↗</a></p></InfoPage>; }
