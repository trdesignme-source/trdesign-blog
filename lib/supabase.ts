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

const SUPABASE_URL = (
  process.env.SUPABASE_URL || "https://xyfwdagzwtncwsdjlcdm.supabase.co"
)
  .trim()
  .replace(/\/+$/, "")

const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || "").trim()

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
  if (!SUPABASE_ANON_KEY) {
    console.error("[BLOG] SUPABASE_ANON_KEY manquante")
    return []
  }
  const url = `${SUPABASE_URL}/rest/v1/seo_articles?select=*&order=created_at.desc`
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    console.error("[BLOG] Erreur Supabase:", res.status, await res.text())
    return []
  }
  const data = await res.json()
  console.log("[BLOG] Articles trouves:", Array.isArray(data) ? data.length : 0)
  return Array.isArray(data) ? data : []
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!SUPABASE_ANON_KEY || !slug) return null
  const url = `${SUPABASE_URL}/rest/v1/seo_articles?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    console.error("[BLOG] Erreur slug:", res.status, await res.text())
    return null
  }
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}