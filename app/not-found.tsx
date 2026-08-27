import Link from "next/link";
import "./status.css";

export default function NotFound() {
  return <main className="status-page">
    <span className="status-code">404</span>
    <h1>Not found</h1>
    <p>The record, page, or resource you&rsquo;re looking for doesn&rsquo;t exist or hasn&rsquo;t been published yet.</p>
    <div className="status-actions">
      <Link href="/">Back to Registry</Link>
      <Link className="secondary" href="/console">Research Console</Link>
    </div>
  </main>;
}
