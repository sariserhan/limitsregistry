import Link from "next/link";

const SITE_URL = "https://www.limitsregistry.com";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  const elements = items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}) }));
  return <><nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}{index < items.length - 1 ? <span aria-hidden="true">/</span> : null}</li>)}</ol></nav><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: elements }).replace(/</g, "\\u003c") }} /></>;
}
