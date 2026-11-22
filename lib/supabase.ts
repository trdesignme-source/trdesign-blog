export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content_html: string
  target_keyword: string
  word_count: number
  cta_title?: string | null
  cta_url?: string | null
  cover_image?: string | null
  cover_image_alt?: string | null
  status?: string
  created_at?: string
}

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://xyfwdagzwtncwsdjlcdm.supabase.co"
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ""

export const BLOG_URL = "https://blog.trdesign.studio"
export const MAIN_URL = "https://trdesign.studio"
export const PRODUCTS_URL = "https://trdesign.studio/products"
export const FREE_URL = "https://trdesign.studio/free-mockups"

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
  }
  if (SUPABASE_ANON_KEY.startsWith("eyJ")) {
    headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`
  }
  return headers
}

export function resolveCoverImage(article: Article): string | null {
  if (article.cover_image && article.cover_image.startsWith("http")) {
    return article.cover_image.replace(/&amp;/gi, "&")
  }
  const match = (article.content_html || "").match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1].replace(/&amp;/gi, "&") : null
}

export async function getAllArticles(): Promise<Article[]> {
  if (!SUPABASE_ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/seo_articles?select=*&order=created_at.desc`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  )
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!SUPABASE_ANON_KEY || !slug) return null
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/seo_articles?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}