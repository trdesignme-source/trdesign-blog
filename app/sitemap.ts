import type { MetadataRoute } from "next"
import { BLOG_URL, getAllArticles } from "@/lib/supabase"

export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles()

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BLOG_URL}/${article.slug}`,
    lastModified: article.created_at ? new Date(article.created_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: BLOG_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...articleEntries,
  ]
}