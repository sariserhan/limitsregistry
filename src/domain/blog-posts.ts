export type BlogPost = { slug: string; title: string; dek: string; publishedAt: string; tags: string[] };

// Single source of truth for post metadata — the index page, each post's own generateMetadata,
// and sitemap.ts all read from this instead of duplicating title/dek in three places.
export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-the-chromatic-number-of-the-plane",
    title: "What Is the Chromatic Number of the Plane?",
    dek: "A 70-year-old coloring problem, narrowed to 5, 6, or 7 — and still open.",
    publishedAt: "2026-08-28",
    tags: ["Mathematics", "Open problems"],
  },
  {
    slug: "what-is-the-beal-conjecture",
    title: "What Is the Beal Conjecture?",
    dek: "A $1,000,000 prize for a one-line generalization of Fermat's Last Theorem.",
    publishedAt: "2026-08-28",
    tags: ["Mathematics", "Open problems"],
  },
  {
    slug: "millennium-prize-problems-list",
    title: "What Are the Millennium Prize Problems?",
    dek: "Seven $1,000,000 problems named in 2000. One is solved. Six are still open.",
    publishedAt: "2026-08-28",
    tags: ["Mathematics", "Open problems"],
  },
  {
    slug: "why-are-physical-constants-known-so-precisely",
    title: "Why Are Physical Constants Known to So Many Decimal Places?",
    dek: "Inside CODATA 2022, the internationally adjusted reference values behind every precision measurement.",
    publishedAt: "2026-08-28",
    tags: ["Physics", "Constants"],
  },
  {
    slug: "what-is-rsa-factoring",
    title: "What Is RSA Factoring, and Why Is It Hard?",
    dek: "The factoring challenge that underwrites internet cryptography — and the exact number where the record currently stands.",
    publishedAt: "2026-08-28",
    tags: ["Cryptography", "Computing"],
  },
  {
    slug: "what-is-a-mersenne-prime",
    title: "What Is a Mersenne Prime?",
    dek: "Primes of the form 2^p − 1, and the volunteer computing project still finding new ones.",
    publishedAt: "2026-08-28",
    tags: ["Mathematics", "Number theory"],
  },
  {
    slug: "limit-of-lossless-data-compression",
    title: "What Is the Theoretical Limit of Lossless Data Compression?",
    dek: "Shannon's source-coding theorem sets a hard floor on file size — no cleverer algorithm can beat it.",
    publishedAt: "2026-08-28",
    tags: ["Information theory", "Computing"],
  },
  {
    slug: "what-is-a-ramsey-number",
    title: "What Is a Ramsey Number?",
    dek: "Why R(5,5) — a single unknown integer between 43 and 46 — might never be found by brute force.",
    publishedAt: "2026-08-28",
    tags: ["Mathematics", "Combinatorics"],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
