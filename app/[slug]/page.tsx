import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BLOG_URL,
  FREE_URL,
  MAIN_URL,
  PRODUCTS_URL,
  getAllArticles,
  getArticleBySlug,
  resolveCoverImage,
} from "@/lib/supabase"

export const revalidate = 60

export async function generateStaticParams() {
  const articles = await getAllArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: "Article Not Found" }

  const cover = resolveCoverImage(article)
  const canonicalUrl = `${BLOG_URL}/${article.slug}`

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.target_keyword,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.created_at,
      images: cover
        ? [{ url: cover, alt: article.cover_image_alt || article.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: cover ? [cover] : [],
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const cover = resolveCoverImage(article)
  const readMin = Math.max(1, Math.ceil((article.word_count || 500) / 200))
  const canonicalUrl = `${BLOG_URL}/${article.slug}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    keywords: article.target_keyword,
    wordCount: article.word_count,
    datePublished: article.created_at,
    mainEntityOfPage: canonicalUrl,
    image: cover ? [cover] : undefined,
    author: {
      "@type": "Organization",
      name: "TR Design Studio",
      url: MAIN_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "TR Design Studio",
      url: MAIN_URL,
    },
  }

  return (
    <article className="article-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/" className="back-link">
        &larr; Back to all tutorials
      </Link>

      <div className="article-meta">
        {article.target_keyword && (
          <span className="badge" style={{ marginBottom: 0 }}>
            {article.target_keyword}
          </span>
        )}
        <span>{readMin} min read</span>
        <span>&middot;</span>
        <span>{article.word_count || 700} words</span>
      </div>

      <h1 className="article-h1">{article.title}</h1>

      <div
        className="article-prose"
        dangerouslySetInnerHTML={{ __html: article.content_html }}
      />

      <aside className="cta-box">
        <div>
          <h3>Download 303+ Premium &amp; 52+ Free 3D Apparel Mockups</h3>
          <p>
            4K Photoshop PSD templates with Smart Objects &amp; realistic 3D
            fabric textures.
          </p>
        </div>
        <div className="cta-actions">
          <a href={article.cta_url || PRODUCTS_URL} className="btn-primary">
            Browse 303+ Mockups &rarr;
          </a>
          <a href={FREE_URL} className="btn-secondary">
            52+ Free Mockups
          </a>
        </div>
      </aside>
    </article>
  )
}