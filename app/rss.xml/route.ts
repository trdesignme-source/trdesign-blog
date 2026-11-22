export const dynamic = "force-dynamic"

const BLOG_URL = "https://blog.trdesign.studio"
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://xyfwdagzwtncwsdjlcdm.supabase.co"
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""

interface SeoArticle {
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  content_html?: string | null
  cover_image?: string | null
  created_at?: string | null
  published_at?: string | null
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function extractFirstImage(html: string | null | undefined): string {
  if (!html) return ""
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1].replace(/&amp;/gi, "&").trim() : ""
}

function getMimeType(url: string): string {
  const clean = url.toLowerCase().split("?")[0]
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg"
  if (clean.endsWith(".webp")) return "image/webp"
  if (clean.endsWith(".gif")) return "image/gif"
  return "image/png"
}

export async function GET() {
  let articles: SeoArticle[] = []

  if (SUPABASE_KEY) {
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    }

    try {
      let res = await fetch(
        `${SUPABASE_URL}/rest/v1/seo_articles?select=*&status=eq.published&order=created_at.desc&limit=50`,
        { headers, cache: "no-store" }
      )

      if (!res.ok) {
        res = await fetch(
          `${SUPABASE_URL}/rest/v1/seo_articles?select=*&status=eq.published&limit=50`,
          { headers, cache: "no-store" }
        )
      }

      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) articles = data
      }
    } catch (err) {
      console.error("RSS fetch error:", err)
    }
  }

  const itemsXml = articles
    .filter((a) => a.slug && a.title)
    .map((article) => {
      const slug = String(article.slug).trim()
      const link = `${BLOG_URL}/${slug}`
      const title = String(article.title).trim()
      const baseDesc = String(article.excerpt || title).trim()
      const description = `${baseDesc} #3DMockup #StreetwearDesign #PhotoshopMockup #TRDesignStudio`
      const rawDate = article.published_at || article.created_at
      const pubDate = rawDate
        ? new Date(rawDate).toUTCString()
        : new Date().toUTCString()

      const imageUrl = String(
        article.cover_image || extractFirstImage(article.content_html) || ""
      )
        .replace(/&amp;/gi, "&")
        .trim()

      const mediaBlock = imageUrl
        ? `
      <enclosure url="${escapeXml(imageUrl)}" length="0" type="${getMimeType(imageUrl)}" />
      <media:content url="${escapeXml(imageUrl)}" medium="image" type="${getMimeType(imageUrl)}" />`
        : ""

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>${mediaBlock}
    </item>`
    })
    .join("\n")

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TR Design Studio — 3D Apparel Mockup Tutorials &amp; Photoshop Guides</title>
    <link>${BLOG_URL}</link>
    <description>Step-by-step Smart Object workflows, fabric shading tips, and production guides for streetwear and sportswear brands by TR Design Studio.</description>
    <language>en-us</language>
    <atom:link href="${BLOG_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`

  return new Response(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
