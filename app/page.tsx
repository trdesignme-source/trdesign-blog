import Link from "next/link"
import { getAllArticles, resolveCoverImage } from "@/lib/supabase"

export const revalidate = 60

export default async function BlogIndexPage() {
  const articles = await getAllArticles()

  return (
    <div className="container">
      <section className="hero">
        <h1>3D Apparel Mockup Tutorials &amp; Photoshop Guides</h1>
        <p>
          Step-by-step Smart Object workflows, fabric shading tips, and
          production guides for streetwear and sportswear brands by TR Design
          Studio.
        </p>
      </section>

      {articles.length === 0 ? (
        <p>No tutorials published yet.</p>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => {
            const cover = resolveCoverImage(article)
            const readMin = Math.max(
              1,
              Math.ceil((article.word_count || 500) / 200)
            )

            return (
              <Link
                key={article.id || article.slug}
                href={`/${article.slug}`}
                className="article-card"
              >
                {cover && (
                  <div className="card-media">
                    <img
                      src={cover}
                      alt={article.cover_image_alt || article.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="card-body">
                  {article.target_keyword && (
                    <span className="badge">{article.target_keyword}</span>
                  )}
                  <h2 className="card-title">{article.title}</h2>
                  <p className="card-excerpt">{article.excerpt}</p>
                  <div className="card-footer">
                    <span>
                      {readMin} min read · {article.word_count || 700} words
                    </span>
                    <span className="read-more">Read Guide &rarr;</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}