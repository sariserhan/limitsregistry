export function categorySlug(category: string) {
  return category.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function categoryForSlug(categories: string[], slug: string) {
  return categories.find((category) => categorySlug(category) === slug);
}
