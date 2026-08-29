import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../../_components/InfoPage";
import { getBlogPost } from "../../../src/domain/blog-posts";

const post = getBlogPost("what-is-miplib")!;
export const metadata: Metadata = {
  title: `${post.title} — Limits Registry`,
  description: post.dek,
  alternates: { canonical: `/articles/${post.slug}` },
  openGraph: { title: `${post.title} — Limits Registry`, description: post.dek, url: `/articles/${post.slug}`, type: "article" },
  twitter: { card: "summary_large_image", title: `${post.title} — Limits Registry`, description: post.dek },
};

export default function Page() { return <InfoPage kicker="Articles · Optimization" title={post.title} intro={post.dek}>

<p>A mixed-integer program (MIP) is an optimization problem where you&rsquo;re minimizing or maximizing something subject to constraints, and at least some of the variables have to be whole numbers &mdash; you can&rsquo;t assign 2.3 trucks to a delivery route or open 1.7 of a factory. That integer requirement is what makes MIPs hard: relaxing it away turns a problem into ordinary linear programming, solvable efficiently, but putting it back makes the problem NP-hard in general, with no known algorithm that solves every instance quickly.</p>

<h2>Why a shared benchmark matters</h2>
<p>Every commercial and open-source MIP solver &mdash; Gurobi, CPLEX, SCIP, HiGHS, and others &mdash; claims to be fast. Without a shared, fixed set of test problems, that claim is unfalsifiable: a vendor could always benchmark on instances chosen to flatter their own solver. MIPLIB exists to close that gap. Maintained by a research collaboration centered at Zuse Institute Berlin, it&rsquo;s a curated, versioned library of real-world and synthetic MIP instances &mdash; production scheduling, network design, vehicle routing, and more &mdash; with a published, independently checkable optimal (or best known) objective value for each one.</p>

<h2>What &ldquo;optimal&rdquo; actually means here</h2>
<p>MIPLIB&rsquo;s official solution catalog marks each instance with a status: <code>=opt=</code> means a matching lower bound and feasible solution have been found, so the objective is proven optimal with no gap remaining; <code>=best=</code> means only the best feasible solution found so far is known, with no proof that a better one doesn&rsquo;t exist. The Registry only publishes <code>=opt=</code> instances as PROVEN records &mdash; each one carries a matching LOWER_BOUND and UPPER_BOUND Claim that meet at the same value, the same closed-frontier pattern used everywhere else on the site.</p>

<h2>What&rsquo;s in the Registry today</h2>
<p>382 MIPLIB v36 instances are published as individual Limits, each citing the official <a href="https://miplib.zib.de/" target="_blank" rel="noreferrer">MIPLIB solution catalog</a> as evidence. A sample: <Link href="/limits/LR-002000">30n20b8</Link>, a real scheduling-style instance, and <Link href="/limits/LR-002231">wachplan</Link>, whose proven optimal objective happens to be negative. Browse the full set under <Link href="/categories/computing">Computing</Link>, subcategory &ldquo;Mixed-integer optimization / MIPLIB 2017.&rdquo;</p>

<h2>Why it&rsquo;s here</h2>
<p>A MIPLIB optimal objective is exactly the kind of fact this Registry exists to track: a precise, independently verifiable number with a real proof behind it, not a vendor&rsquo;s marketing claim about how fast their solver runs.</p>

</InfoPage>; }
