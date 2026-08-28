import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyBlogArticlePage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect("/articles/" + slug);
}
