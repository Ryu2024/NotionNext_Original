/**
 * Utrecht Theme for NotionNext
 * Inspired by utrecht.jp — a minimalist Japanese art/design aesthetic
 *
 * Design language:
 * - Pure white background, near-black text
 * - Cormorant Garamond (display) + Noto Serif JP (body)
 * - Ultra-minimal navigation, lowercase labels
 * - Generous negative space, images as the primary actor
 */

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { NotionRenderer } from 'react-notion-x'

// ─── Config ───────────────────────────────────────────────────────────────────
export const CONFIG = {
  THEME_SWITCH: false,
  NAV_TABS: [
    { label: 'home', path: '/' },
    { label: 'photo', path: '/category/Photo' },
    { label: 'blog', path: '/category/Blog' },
    { label: 'about', path: '/about' }
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr?.start_date || dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Google Fonts loader ──────────────────────────────────────────────────────
const ThemeFonts = () => (
  <style global="true">{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Serif+JP:wght@200;300;400&family=IM+Fell+English+SC&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { font-size: 16px; }

    body {
      background: #fafaf8;
      color: #111;
      font-family: 'Noto Serif JP', 'Georgia', serif;
      font-weight: 300;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }

    /* ── Typography ── */
    .utrecht-site-name {
      font-family: 'IM Fell English SC', serif;
      font-size: 0.8rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #111;
    }

    .utrecht-nav-item {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.18em;
      color: #555;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .utrecht-nav-item:hover,
    .utrecht-nav-item.active { color: #111; }
    .utrecht-nav-item.active {
      border-bottom: 1px solid #111;
      padding-bottom: 1px;
    }

    .utrecht-post-title {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      line-height: 1.3;
      letter-spacing: 0.02em;
      color: #111;
    }

    .utrecht-section-label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: #aaa;
    }

    .utrecht-date {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      color: #999;
    }

    .utrecht-summary {
      font-family: 'Noto Serif JP', serif;
      font-size: 0.82rem;
      line-height: 1.8;
      color: #666;
      font-weight: 300;
    }

    /* ── Layout ── */
    .utrecht-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.6rem 3rem;
      background: rgba(250,250,248,0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .utrecht-nav { display: flex; gap: 2.2rem; align-items: center; }

    .utrecht-main { padding-top: 5rem; min-height: 100vh; }

    /* ── Home ── */
    .utrecht-home-cover {
      width: 100%;
      height: calc(100vh - 5rem);
      object-fit: cover;
      display: block;
      filter: brightness(0.96);
    }

    .utrecht-home-caption {
      position: fixed;
      bottom: 2rem;
      right: 3rem;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      pointer-events: none;
    }

    /* ── Photo Grid ── */
    .utrecht-photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2px;
      padding: 2rem 0;
    }

    .utrecht-photo-item {
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/2;
      cursor: pointer;
    }

    .utrecht-photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: block;
    }

    .utrecht-photo-item:hover img { transform: scale(1.03); }

    .utrecht-photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0);
      transition: background 0.4s ease;
      display: flex;
      align-items: flex-end;
      padding: 1.2rem;
    }

    .utrecht-photo-item:hover .utrecht-photo-overlay {
      background: rgba(0,0,0,0.25);
    }

    .utrecht-photo-label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0);
      transition: color 0.3s ease;
    }
    .utrecht-photo-item:hover .utrecht-photo-label { color: rgba(255,255,255,0.9); }

    /* ── Blog List ── */
    .utrecht-blog-list {
      max-width: 680px;
      margin: 0 auto;
      padding: 3rem 2rem 6rem;
    }

    .utrecht-blog-item {
      display: grid;
      grid-template-columns: 90px 1fr;
      gap: 2rem;
      padding: 2rem 0;
      border-bottom: 1px solid #ebebeb;
      text-decoration: none;
      color: inherit;
    }

    .utrecht-blog-item:first-child { border-top: 1px solid #ebebeb; }

    .utrecht-blog-item-thumb {
      width: 90px;
      height: 60px;
      object-fit: cover;
      display: block;
      filter: grayscale(20%);
      transition: filter 0.3s ease;
    }

    .utrecht-blog-item:hover .utrecht-blog-item-thumb { filter: grayscale(0%); }

    .utrecht-blog-item-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.05rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: #111;
      line-height: 1.4;
      transition: opacity 0.2s ease;
    }

    .utrecht-blog-item:hover .utrecht-blog-item-title { opacity: 0.65; }

    /* ── About ── */
    .utrecht-about {
      max-width: 560px;
      margin: 0 auto;
      padding: 4rem 2rem 8rem;
    }

    /* ── Single Post ── */
    .utrecht-post {
      max-width: 660px;
      margin: 0 auto;
      padding: 3rem 2rem 8rem;
    }

    .utrecht-post-cover {
      width: 100%;
      max-height: 55vh;
      object-fit: cover;
      display: block;
      margin-bottom: 3rem;
    }

    /* ── Notion renderer overrides ── */
    .notion { font-family: 'Noto Serif JP', serif; font-size: 0.9rem; line-height: 1.85; color: #333; font-weight: 300; }
    .notion h1, .notion h2, .notion h3 { font-family: 'Cormorant Garamond', serif; font-weight: 400; }
    .notion a { color: #111; border-bottom: 1px solid #ccc; text-decoration: none; }
    .notion a:hover { border-bottom-color: #111; }

    /* ── Footer ── */
    .utrecht-footer {
      border-top: 1px solid #ebebeb;
      padding: 2.5rem 3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .utrecht-header { padding: 1.2rem 1.5rem; }
      .utrecht-nav { gap: 1.4rem; }
      .utrecht-blog-list { padding: 2rem 1.5rem 4rem; }
      .utrecht-blog-item { grid-template-columns: 1fr; }
      .utrecht-blog-item-thumb { width: 100%; height: 160px; }
      .utrecht-about { padding: 2rem 1.5rem 4rem; }
      .utrecht-post { padding: 2rem 1.5rem 4rem; }
      .utrecht-footer { padding: 2rem 1.5rem; flex-direction: column; gap: 1rem; text-align: center; }
      .utrecht-photo-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    }

    /* ── Fade in ── */
    @keyframes utrechtFade {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .utrecht-fade { animation: utrechtFade 0.5s ease both; }
    .utrecht-fade-delay { animation: utrechtFade 0.5s ease 0.15s both; }
  `}</style>
)

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({ siteInfo }) => {
  const router = useRouter()
  const currentPath = router.asPath

  const isActive = (path) => {
    if (path === '/') return currentPath === '/'
    return currentPath.startsWith(path)
  }

  return (
    <header className="utrecht-header">
      <Link href="/" className="utrecht-site-name" style={{ textDecoration: 'none' }}>
        {siteInfo?.title || 'Journal'}
      </Link>
      <nav className="utrecht-nav">
        {CONFIG.NAV_TABS.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`utrecht-nav-item${isActive(tab.path) ? ' active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({ siteInfo }) => (
  <footer className="utrecht-footer">
    <span className="utrecht-date" style={{ color: '#bbb' }}>
      © {new Date().getFullYear()} {siteInfo?.title || ''}
    </span>
    <span className="utrecht-section-label">Powered by Notion</span>
  </footer>
)

// ─── LayoutBase ───────────────────────────────────────────────────────────────
export const LayoutBase = (props) => {
  const { children, siteInfo } = props

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteInfo?.title || 'Journal'}</title>
        <meta name="description" content={siteInfo?.description || ''} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <ThemeFonts />
      <Header siteInfo={siteInfo} />
      <main className="utrecht-main">{children}</main>
      <Footer siteInfo={siteInfo} />
    </>
  )
}

// ─── LayoutIndex (Home) ───────────────────────────────────────────────────────
export const LayoutIndex = (props) => {
  const { posts, siteInfo } = props

  // Find the first post tagged/categorized as "cover" or "home", else use siteInfo.cover
  const coverPost = posts?.find(
    (p) =>
      p?.tags?.includes('cover') ||
      p?.category === 'Cover' ||
      p?.tags?.includes('home')
  )

  const coverImage =
    coverPost?.pageCover ||
    coverPost?.pageCoverThumbnail ||
    siteInfo?.pageCover ||
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=80'

  const coverCaption = coverPost?.title || siteInfo?.description || ''

  return (
    <LayoutBase {...props}>
      <div style={{ position: 'relative' }}>
        <img
          src={coverImage}
          alt={coverCaption}
          className="utrecht-home-cover"
        />
        {coverCaption && (
          <div className="utrecht-home-caption">{coverCaption}</div>
        )}
      </div>
    </LayoutBase>
  )
}

// ─── LayoutPostList ───────────────────────────────────────────────────────────
export const LayoutPostList = (props) => {
  const { posts, category, tag } = props
  const router = useRouter()

  // Detect if this is the "Photo" section
  const isPhotoSection =
    category?.toLowerCase() === 'photo' ||
    tag?.toLowerCase() === 'photo' ||
    router.asPath.toLowerCase().includes('photo')

  if (isPhotoSection) {
    return (
      <LayoutBase {...props}>
        <PhotoGrid posts={posts} />
      </LayoutBase>
    )
  }

  return (
    <LayoutBase {...props}>
      <BlogList posts={posts} />
    </LayoutBase>
  )
}

// ─── Photo Grid component ─────────────────────────────────────────────────────
const PhotoGrid = ({ posts }) => {
  const photoPosts = posts?.filter(
    (p) =>
      p?.pageCover ||
      p?.pageCoverThumbnail
  ) || []

  if (!photoPosts.length) {
    return (
      <div style={{ padding: '8rem 3rem', textAlign: 'center' }}>
        <p className="utrecht-summary">No photos yet.</p>
      </div>
    )
  }

  return (
    <div className="utrecht-photo-grid utrecht-fade">
      {photoPosts.map((post) => (
        <Link key={post.id} href={`/${post.slug}`} style={{ display: 'block' }}>
          <div className="utrecht-photo-item">
            <img
              src={post.pageCoverThumbnail || post.pageCover}
              alt={post.title}
              loading="lazy"
            />
            <div className="utrecht-photo-overlay">
              <span className="utrecht-photo-label">{post.title}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Blog List component ──────────────────────────────────────────────────────
const BlogList = ({ posts }) => {
  const blogPosts = posts || []

  if (!blogPosts.length) {
    return (
      <div style={{ padding: '8rem 3rem', textAlign: 'center' }}>
        <p className="utrecht-summary">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="utrecht-blog-list utrecht-fade">
      <p className="utrecht-section-label" style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
        {blogPosts.length} {blogPosts.length === 1 ? 'entry' : 'entries'}
      </p>
      {blogPosts.map((post) => (
        <Link key={post.id} href={`/${post.slug}`} className="utrecht-blog-item">
          {(post.pageCoverThumbnail || post.pageCover) && (
            <img
              src={post.pageCoverThumbnail || post.pageCover}
              alt={post.title}
              className="utrecht-blog-item-thumb"
              loading="lazy"
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.4rem' }}>
            <p className="utrecht-blog-item-title">{post.title}</p>
            {post.summary && (
              <p className="utrecht-summary" style={{ fontSize: '0.78rem' }}>
                {post.summary}
              </p>
            )}
            <p className="utrecht-date">{formatDate(post.date)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── LayoutSlug (Single Post / Page) ─────────────────────────────────────────
export const LayoutSlug = (props) => {
  const { post, blockMap } = props

  if (!post) {
    return (
      <LayoutBase {...props}>
        <Layout404 {...props} />
      </LayoutBase>
    )
  }

  const isAbout = post.slug === 'about' || post.type === 'Page'
  const isPhoto =
    post.category === 'Photo' ||
    post.tags?.includes('photo') ||
    post.tags?.includes('Photo')

  return (
    <LayoutBase {...props}>
      <article className={isAbout ? 'utrecht-about utrecht-fade' : 'utrecht-post utrecht-fade'}>
        {/* Cover image for photo posts — full bleed */}
        {isPhoto && (post.pageCover || post.pageCoverThumbnail) && (
          <img
            src={post.pageCover || post.pageCoverThumbnail}
            alt={post.title}
            className="utrecht-post-cover"
          />
        )}

        {/* Header info */}
        {!isAbout && (
          <div style={{ marginBottom: '2.5rem' }}>
            {post.category && (
              <p className="utrecht-section-label" style={{ marginBottom: '0.8rem' }}>
                {post.category}
              </p>
            )}
            <h1 className="utrecht-post-title">{post.title}</h1>
            <p className="utrecht-date" style={{ marginTop: '0.8rem' }}>
              {formatDate(post.date)}
            </p>
          </div>
        )}

        {isAbout && (
          <h1
            className="utrecht-post-title"
            style={{ marginBottom: '2.5rem', fontSize: '1.4rem' }}
          >
            {post.title}
          </h1>
        )}

        {/* Non-photo blog post: show cover below title */}
        {!isPhoto && !isAbout && (post.pageCover || post.pageCoverThumbnail) && (
          <img
            src={post.pageCover || post.pageCoverThumbnail}
            alt={post.title}
            className="utrecht-post-cover"
          />
        )}

        {/* Notion content */}
        {blockMap && (
          <div className="notion">
            <NotionRenderer
              recordMap={blockMap}
              fullPage={false}
              darkMode={false}
              disableHeader={true}
            />
          </div>
        )}
      </article>
    </LayoutBase>
  )
}

// ─── LayoutCategory ───────────────────────────────────────────────────────────
export const LayoutCategory = (props) => <LayoutPostList {...props} />

// ─── LayoutTag ────────────────────────────────────────────────────────────────
export const LayoutTag = (props) => <LayoutPostList {...props} />

// ─── LayoutSearch ─────────────────────────────────────────────────────────────
export const LayoutSearch = (props) => {
  const { posts, keyword } = props
  const [query, setQuery] = useState(keyword || '')
  const router = useRouter()

  const filtered = posts?.filter(
    (p) =>
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.summary?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <LayoutBase {...props}>
      <div className="utrecht-blog-list">
        <div style={{ marginBottom: '3rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search"
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '1px solid #ccc',
              background: 'transparent',
              padding: '0.5rem 0',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.2rem',
              letterSpacing: '0.05em',
              color: '#111',
              outline: 'none'
            }}
          />
        </div>
        {query && <BlogList posts={filtered} />}
      </div>
    </LayoutBase>
  )
}

// ─── LayoutArchive ────────────────────────────────────────────────────────────
export const LayoutArchive = (props) => {
  const { archivePosts } = props

  return (
    <LayoutBase {...props}>
      <div className="utrecht-blog-list">
        <p className="utrecht-section-label" style={{ marginBottom: '2rem' }}>Archive</p>
        {archivePosts &&
          Object.keys(archivePosts)
            .sort((a, b) => b - a)
            .map((year) => (
              <div key={year} style={{ marginBottom: '2.5rem' }}>
                <p
                  className="utrecht-section-label"
                  style={{ marginBottom: '1rem', color: '#888' }}
                >
                  {year}
                </p>
                {archivePosts[year].map((post) => (
                  <Link
                    key={post.id}
                    href={`/${post.slug}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '0.6rem 0',
                      borderBottom: '1px solid #f0f0f0',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <span className="utrecht-blog-item-title" style={{ fontSize: '0.92rem' }}>
                      {post.title}
                    </span>
                    <span className="utrecht-date">{formatDate(post.date)}</span>
                  </Link>
                ))}
              </div>
            ))}
      </div>
    </LayoutBase>
  )
}

// ─── Layout404 ────────────────────────────────────────────────────────────────
export const Layout404 = (props) => (
  <LayoutBase {...props}>
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem'
      }}
    >
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '5rem',
          fontWeight: 300,
          color: '#e0e0e0',
          lineHeight: 1
        }}
      >
        404
      </p>
      <p className="utrecht-summary">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="utrecht-nav-item"
        style={{ marginTop: '1rem' }}
      >
        ← return home
      </Link>
    </div>
  </LayoutBase>
)

// ─── Default export (required by NotionNext) ──────────────────────────────────
export default LayoutBase
