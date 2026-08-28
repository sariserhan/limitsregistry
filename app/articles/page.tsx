import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { blogPosts } from "../../src/domain/blog-posts";
import "./blog.css";

export const metadata: Metadata = {
  title: "Articles — Limits Registry",
  description: "Explainers on the open problems, proven bounds, and reference constants cataloged in Limits Registry.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesIndexPage() {
  return <main className="blog-page">
    <PublicHeader />
    <section className="blog-intro">
      <p className="section-kicker">Articles</p>
      <h1>Explainers on the boundaries.</h1>
      <p>Plain-language write-ups of the open problems, proven bounds, and reference constants cataloged in the Registry — each tied to a real record with its own evidence trail.</p>
    </section>
    <section className="blog-list">
      {blogPosts.map((post) => <Link className="blog-item" href={`/articles/${post.slug}`} key={post.slug}>
        <strong>{post.title}</strong>
        <p>{post.dek}</p>
        <small>{post.tags.join(" · ")}</small>
      </Link>)}
    </section>
    <SiteFooter />
  </main>;
}
