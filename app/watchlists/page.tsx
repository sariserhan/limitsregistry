import Link from "next/link";
import { PublicHeader } from "../../src/components/public-header";
import { SiteFooter } from "../../src/components/site-footer";
import { requireRole } from "../../src/auth/session";
import { listPublicCategories } from "../../src/db/repository";
import { listPublicLimitPage } from "../../src/db/repository.public-limits";
import { listUserFollows } from "../../src/db/repository.watchlists";
import { subscribeAction, unsubscribeAction, updatePreferenceAction } from "./actions";
import "../submit/submit.css";
import "./watchlists.css";

type Props = { searchParams: Promise<{ success?: string; error?: string; q?: string; category?: string; page?: string }> };

export default async function WatchlistsPage({ searchParams }: Props) {
  const session = await requireRole("USER");
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = params.category?.trim() ?? "";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const [pageData, followed, categories] = await Promise.all([
    listPublicLimitPage({ page: Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1, pageSize: 50, query: q, category }),
    listUserFollows(session.user.id),
    listPublicCategories(),
  ]);
  const followedIds = new Set(followed.filter(({ follow }) => follow.enabled).map(({ follow }) => follow.limitId));
  const { rows: visibleLimits, total, page, pageCount } = pageData;
  const pageHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    qs.set("page", String(targetPage));
    return `/watchlists?${qs.toString()}`;
  };

  return <main className="watchlists-page">
    <PublicHeader />
    <Link className="submit-back" href="/account">Your account &rarr;</Link>
    <section className="watchlists-intro">
      <p className="section-kicker">Frontier watchlists</p>
      <h1>Follow accepted changes.</h1>
      <p>Get email only when an editorial change is accepted and published. Draft, disputed, and rejected work never generates a notification.</p>
      <small>Delivery address: {session.user.email}</small>
    </section>
    {(params.success || params.error) ? <p className={params.error ? "watchlist-message error" : "watchlist-message"} role="status">{params.error ?? params.success}</p> : null}
    <section className="watchlist-grid">
      <div>
        <h2>Your watchlist ({followedIds.size})</h2>
        {followed.length ? followed.map(({ follow, limit }) => <article className={`watchlist-row ${follow.enabled ? "" : "disabled"}`} key={follow.id}>
          <div><span>{limit.registryNumber}</span><strong>{limit.title}</strong><small>{follow.enabled ? `${follow.frequency.toLowerCase()} email` : "Unsubscribed"}</small></div>
          {follow.enabled ? <div className="watchlist-actions">
            <form action={updatePreferenceAction}><input type="hidden" name="id" value={follow.id} /><select name="frequency" defaultValue={follow.frequency}><option value="INSTANT">Immediate</option><option value="WEEKLY">Weekly digest</option></select><button>Save</button></form>
            <form action={unsubscribeAction}><input type="hidden" name="id" value={follow.id} /><button className="quiet">Unsubscribe</button></form>
          </div> : null}
        </article>) : <p className="watchlist-empty">You are not following any Limits yet.</p>}
      </div>
      <div>
        <h2>Published Limits ({total})</h2>
        <form className="watchlist-filter-form" method="get">
          <input type="search" name="q" defaultValue={q} placeholder="Search title, registry number…" aria-label="Search published Limits" />
          <select name="category" defaultValue={category} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <button type="submit">Filter</button>
        </form>
        {visibleLimits.length ? visibleLimits.map((limit) => <article className="watchlist-row" key={limit.id}>
          <div><span>{limit.registryNumber}</span><strong>{limit.title}</strong><small>{limit.status}</small></div>
          {followedIds.has(limit.id) ? <span className="following-label">Following</span> : <form className="subscribe-form" action={subscribeAction}><input type="hidden" name="limitId" value={limit.id} /><select name="frequency" defaultValue="WEEKLY"><option value="INSTANT">Immediate</option><option value="WEEKLY">Weekly digest</option></select><button>Follow</button></form>}
        </article>) : <p className="watchlist-empty">No Limits match this search.</p>}
        {pageCount > 1 ? <nav className="watchlist-pagination" aria-label="Published Limits pages">
          <Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))}>Previous</Link>
          <span>Page {page} of {pageCount}</span>
          <Link aria-disabled={page === pageCount} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link>
        </nav> : null}
      </div>
    </section>
    <SiteFooter />
  </main>;
}
