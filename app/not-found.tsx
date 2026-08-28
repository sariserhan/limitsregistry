import Link from "next/link";
import { PublicHeader } from "../src/components/public-header";
import { SiteFooter } from "../src/components/site-footer";
import "./status.css";

export default function NotFound() {
  return <main className="status-page">
    <PublicHeader />
    <div className="status-content">
      <span className="status-code">404</span>
      <h1>Not found</h1>
      <p>The record, page, or resource you&rsquo;re looking for doesn&rsquo;t exist or hasn&rsquo;t been published yet.</p>
      <div className="status-actions">
        <Link href="/">Back to Registry</Link>
        <Link className="secondary" href="/console">Research Console</Link>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
