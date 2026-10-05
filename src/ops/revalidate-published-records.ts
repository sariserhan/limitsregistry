import { revalidatePath, revalidateTag } from "next/cache";

// Called by seed routes after inserting records. sitemap.ts is a static route handler, and its
// time-based revalidate was not reliably rebuilding it after seeding (batch 10 sat out of the
// sitemap well past its hour), so publishing invalidates it — and the data caches behind it,
// the homepage stats and the category pages — directly.
export function revalidatePublishedRecords() {
  revalidateTag("published-limits", { expire: 0 });
  revalidateTag("registry-stats", { expire: 0 });
  revalidatePath("/sitemap.xml");
  revalidatePath("/");
  revalidatePath("/categories/[slug]", "page");
}
