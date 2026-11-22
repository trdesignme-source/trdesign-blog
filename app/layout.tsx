import type { Metadata } from "next"
import "./globals.css"
import { BLOG_URL, FREE_URL, MAIN_URL, PRODUCTS_URL } from "@/lib/supabase"

export const metadata: Metadata = {
  metadataBase: new URL(BLOG_URL),
  title: {
    default: "3D Apparel Mockup Tutorials & Photoshop Guides | TR Design Studio",
    template: "%s | TR Design Studio",
  },
  description:
    "Technical Photoshop PSD guides, Smart Object workflows, and 3D apparel mockup tutorials by TR Design Studio (303+ premium & 52+ free 4K mockups).",
  alternates: {
    canonical: BLOG_URL,
  },
  openGraph: {
    type: "website",
    siteName: "TR Design Studio",
    url: BLOG_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <a href={MAIN_URL} className="brand">
              <span className="brand-dot" />
              TR Design Studio
            </a>
            <nav className="nav-links">
              <a href="/">Tutorials</a>
              <a href={PRODUCTS_URL}>303+ Mockups</a>
              <a href={FREE_URL} className="nav-cta">
                52+ Free PSDs
              </a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          &copy; {new Date().getFullYear()}{" "}
          <a href={MAIN_URL} style={{ textDecoration: "underline" }}>
            TR Design Studio
          </a>{" "}
          — 3D Apparel, Sportswear &amp; Packaging Photoshop PSD Mockups.
        </footer>
      </body>
    </html>
  )
}