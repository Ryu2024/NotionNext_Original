cat > /home/claude/index.js << 'ENDOFFILE'
/**
 * Utrecht Theme for NotionNext
 * Accurately modelled after utrecht.jp
 *
 * Palette : #e8001d (red) + #000 on #fff
 * Font    : system grotesque sans-serif
 * Layout  : top nav + left rotated label + main content
 */

import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { NotionRenderer } from 'react-notion-x'
import React, { createContext, useContext } from 'react'

const ShellContext = createContext(false)

const RED = '#e8001d'

export const CONFIG = {
  THEME_SWITCH: false,
  NAV_TABS: [
    { label: 'Home',  path: '/' },
    { label: 'Photo', path: '/category/Photo' },
    { label: 'Blog',  path: '/category/Blog' },
    { label: 'About', path: '/about' }
  ]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr?.start_date || dateStr)
  if (isNaN(d)) return ''
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const ThemeFonts = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      background: #fff;
      color: #000;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial,
                   'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    a { color: inherit; text-decoration: none; }
    img { display: block; max-width: 100%; }

    /* ── Header ── */
    .u-header {
      border-bottom: 1px solid #e0e0e0;
    }

    .u-header-top {
      display: flex;
      align-items: center;
      padding: 18px 32px;
      gap: 0;
    }

    /* Logo block */
    .u-logo {
      display: flex;
      flex-direction: column;
      margin-right: 40px;
      flex-shrink: 0;
    }

    .u-logo-wordmark {
      font-size: 26px;
      font-weight: 800;
      color: ${RED};
      letter-spacing: -0.02em;
      line-height: 1;
      font-style: italic;
    }

    .u-logo-sub {
      font-size: 9px;
      color: ${RED};
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* Nav row */
    .u-nav-row {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 28px;
      flex-wrap: wrap;
    }

    .u-nav-link {
      font-size: 12px;
      color: ${RED};
      letter-spacing: 0.01em;
      white-space: nowrap;
      padding: 3px 0;
      border-bottom: 1px solid transparent;
      transition: border-color 0.15s;
    }

    .u-nav-link:hover { border-bottom-color: ${RED}; }
    .u-nav-link.active { font-weight: 700; border-bottom-color: ${RED}; }

    /* ── Left rotated label ── */
    .u-page-wrap {
      display: flex;
      position: relative;
    }

    .u-left-label {
      width: 36px;
      flex-shrink: 0;
      position: relative;
    }

    .u-left-label-inner {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .u-left-label-text {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      font-size: 9px;
      color: ${RED};
      letter-spacing: 0.15em;
      white-space: nowrap;
      line-height: 1;
    }

    /* ── Content divider ── */
    .u-divider {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 0;
    }

    /* ── Main content ── */
    .u-content {
      flex: 1;
      min-width: 0;
      border-left: 1px solid #e0e0e0;
    }

    /* ── Home cover ── */
    .u-home-img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* ── Photo grid ── */
    .u-photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;
      background: #e0e0e0;
    }

    @media (min-width: 1000px) {
      .u-photo-grid { grid-template-columns: repeat(3, 1fr); }
    }

    .u-photo-cell {
      position: relative;
      overflow: hidden;
      aspect-ratio: 3/2;
      background: #f5f5f5;
    }

    .u-photo-cell img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: opacity 0.3s;
    }

    .u-photo-cell:hover img { opacity: 0.85; }

    .u-photo-caption {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 10px 12px 10px;
      font-size: 9px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0);
      background: linear-gradient(transparent, rgba(0,0,0,0.4));
      transition: color 0.25s;
    }

    .u-photo-cell:hover .u-photo-caption { color: rgba(255,255,255,0.9); }

    /* ── Blog list ── */
    .u-blog-wrap {
      padding: 40px 40px 80px;
      max-width: 680px;
    }

    .u-section-label {
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${RED};
      margin-bottom: 24px;
    }

    .u-blog-item {
      display: block;
      padding: 14px 0;
      border-bottom: 1px solid #ebebeb;
      text-decoration: none;
      color: inherit;
    }

    .u-blog-item:first-of-type { border-top: 1px solid #ebebeb; }

    .u-blog-title {
      font-size: 13px;
      font-weight: 700;
      color: ${RED};
      margin-bottom: 3px;
      transition: opacity 0.15s;
    }

    .u-blog-item:hover .u-blog-title { opacity: 0.6; }

    .u-blog-meta {
      font-size: 10px;
      color: #999;
      letter-spacing: 0.04em;
    }

    /* ── Post ── */
    .u-post-wrap {
      padding: 40px 40px 80px;
      max-width: 660px;
    }

    .u-post-eyebrow {
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${RED};
      margin-bottom: 12px;
    }

    .u-post-title {
      font-size: 16px;
      font-weight: 700;
      color: ${RED};
      line-height: 1.35;
      margin-bottom: 6px;
    }

    .u-post-date {
      font-size: 10px;
      color: #999;
      letter-spacing: 0.04em;
      margin-bottom: 36px;
    }

    /* Notion overrides */
    .notion {
      font-size: 13px;
      line-height: 1.75;
      color: #111;
    }

    .notion .notion-page-title { display: none; }

    .notion h1, .notion h2, .notion h3 {
      font-weight: 700;
      color: ${RED};
      margin: 24px 0 8px;
    }

    .notion h1 { font-size: 15px; }
    .notion h2 { font-size: 13px; }
    .notion h3 { font-size: 12px; }
    .notion p  { margin-bottom: 10px; }
    .notion a  { color: ${RED}; text-decoration: underline; }

    /* ── Footer ── */
    .u-footer {
      border-top: 1px solid #e0e0e0;
      padding: 20px 40px;
      font-size: 10px;
      color: #bbb;
      display: flex;
      justify-content: space-between;
      letter-spacing: 0.04em;
    }

    /* ── 404 ── */
    .u-404 {
      padding: 80px 40px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .u-404-num {
      font-size: 60px;
      font-weight: 800;
      color: #eee;
      line-height: 1;
    }

    /* ── Mobile ── */
    @media (max-width: 680px) {
      .u-header-top { padding: 14px 16px; }
      .u-logo-wordmark { font-size: 20px; }
      .u-nav-row { gap: 16px; }
      .u-nav-link { font-size: 11px; }
      .u-left-label { display: none; }
      .u-content { border-left: none; }
      .u-blog-wrap { padding: 28px 16px 60px; }
      .u-post-wrap { padding: 28px 16px 60px; }
      .u-footer { padding: 16px; flex-direction: column; gap: 6px; }
    }

    /* Fade */
    @keyframes uFade { from { opacity:0; } to { opacity:1; } }
    .u-fade { animation: uFade 0.35s ease both; }
  `}} />
)

// ─── Header ───────────────────────────────────────────────────────────────────
const SiteHeader = ({ siteInfo }) => {
  const router = useRouter()
  const path = router.asPath

  const isActive = (p) => {
    if (p === '/') return path === '/'
    return path.startsWith(p)
  }

  return (
    <header className="u-header">
      <div className="u-header-top">
        {/* Logo */}
        <Link href="/" className="u-logo" style={{ textDecoration: 'none' }}>
          <span className="u-logo-wordmark">{siteInfo?.title || 'Journal'}</span>
          <span className="u-logo-sub">Photography &amp; Writing</span>
        </Link>

        {/* Nav */}
        <nav className="u-nav-row">
          {CONFIG.NAV_TABS.map(tab => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`u-nav-link${isActive(tab.path) ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <hr className="u-divider" />
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const SiteFooter = ({ siteInfo }) => (
  <footer className="u-footer">
    <span>© {new Date().getFullYear()} {siteInfo?.title || ''}</span>
    <span>Powered by Notion</span>
  </footer>
)

// ─── LayoutBase ───────────────────────────────────────────────────────────────
export const LayoutBase = ({ children, siteInfo }) => {
  const hasShell = useContext(ShellContext)
  if (hasShell) return <>{children}</>

  return (
    <ShellContext.Provider value={true}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteInfo?.title || 'Journal'}</title>
      </Head>
      <ThemeFonts />
      <SiteHeader siteInfo={siteInfo} />
      <hr className="u-divider" />
      <div className="u-page-wrap">
        {/* Left rotated label */}
        <div className="u-left-label">
          <div className="u-left-label-inner">
            <span className="u-left-label-text">
              {siteInfo?.title || 'Journal'}
            </span>
          </div>
        </div>
        {/* Content */}
        <div className="u-content">
          {children}
          <SiteFooter siteInfo={siteInfo} />
        </div>
      </div>
    </ShellContext.Provider>
  )
}

// ─── LayoutIndex (Home) ───────────────────────────────────────────────────────
export const LayoutIndex = (props) => {
  const { siteInfo } = props
  const cover = siteInfo?.pageCover || siteInfo?.pageCoverThumbnail

  return (
    <LayoutBase {...props}>
      {cover ? (
        <img src={cover} alt="" className="u-home-img u-fade" />
      ) : (
        <div style={{
          width: '100%', height: '55vh',
          background: '#fafafa',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '10px', color: '#ccc', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Set a cover image in your Notion database
          </span>
        </div>
      )}
    </LayoutBase>
  )
}

// ─── LayoutPostList ───────────────────────────────────────────────────────────
export const LayoutPostList = (props) => {
  const { posts, category, tag } = props
  const router = useRouter()

  if (!category && !tag && router.asPath === '/') {
    return <LayoutBase {...props}><></></LayoutBase>
  }

  const isPhoto =
    category?.toLowerCase() === 'photo' ||
    tag?.toLowerCase() === 'photo' ||
    router.asPath.toLowerCase().includes('/category/photo')

  return (
    <LayoutBase {...props}>
      {isPhoto ? <PhotoGrid posts={posts} /> : <BlogList posts={posts} />}
    </LayoutBase>
  )
}

// ─── Photo Grid ───────────────────────────────────────────────────────────────
const PhotoGrid = ({ posts }) => {
  const items = posts?.filter(p => p?.pageCover || p?.pageCoverThumbnail) || []

  if (!items.length) {
    return (
      <div style={{ padding: '60px 40px' }}>
        <p style={{ fontSize: '10px', color: '#bbb', letterSpacing: '0.1em' }}>No photos yet.</p>
      </div>
    )
  }

  return (
    <div className="u-photo-grid u-fade">
      {items.map(post => (
        <Link key={post.id} href={`/${post.slug}`}>
          <div className="u-photo-cell">
            <img src={post.pageCoverThumbnail || post.pageCover} alt={post.title} loading="lazy" />
            <div className="u-photo-caption">{post.title}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── Blog List ────────────────────────────────────────────────────────────────
const BlogList = ({ posts }) => {
  const items = posts || []

  if (!items.length) {
    return (
      <div style={{ padding: '60px 40px' }}>
        <p style={{ fontSize: '10px', color: '#bbb', letterSpacing: '0.1em' }}>No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="u-blog-wrap u-fade">
      <p className="u-section-label">
        {items.length} {items.length === 1 ? 'Entry' : 'Entries'}
      </p>
      {items.map(post => (
        <Link key={post.id} href={`/${post.slug}`} className="u-blog-item">
          <p className="u-blog-title">{post.title}</p>
          <p className="u-blog-meta">
            {post.category && <>{post.category}&nbsp;·&nbsp;</>}
            {formatDate(post.date)}
          </p>
        </Link>
      ))}
    </div>
  )
}

// ─── LayoutSlug ───────────────────────────────────────────────────────────────
export const LayoutSlug = (props) => {
  const { post } = props
  if (!post) return <Layout404 {...props} />

  const blockMap = props.blockMap || post.blockMap || post.content
  const isAbout = post.slug === 'about' || post.type === 'Page'

  return (
    <LayoutBase {...props}>
      <div className="u-post-wrap u-fade">
        {!isAbout && post.category && (
          <p className="u-post-eyebrow">{post.category}</p>
        )}
        <h1 className="u-post-title">{post.title}</h1>
        {!isAbout && (
          <p className="u-post-date">{formatDate(post.date)}</p>
        )}
        {blockMap ? (
          <div className="notion">
            <NotionRenderer
              recordMap={blockMap}
              fullPage={false}
              darkMode={false}
              disableHeader={true}
            />
          </div>
        ) : (
          <p style={{ fontSize: '11px', color: '#bbb' }}>Loading…</p>
        )}
      </div>
    </LayoutBase>
  )
}

export const LayoutCategory = (props) => <LayoutPostList {...props} />
export const LayoutTag      = (props) => <LayoutPostList {...props} />

// ─── LayoutSearch ─────────────────────────────────────────────────────────────
export const LayoutSearch = (props) => {
  const { posts, keyword } = props
  const [query, setQuery] = useState(keyword || '')

  const filtered = posts?.filter(p =>
    p.title?.toLowerCase().includes(query.toLowerCase()) ||
    p.summary?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <LayoutBase {...props}>
      <div className="u-blog-wrap">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search"
          style={{
            width: '100%', border: 'none',
            borderBottom: `1px solid ${RED}`,
            background: 'transparent',
            padding: '6px 0',
            fontSize: '13px',
            color: '#000',
            outline: 'none',
            marginBottom: '32px',
            fontFamily: 'inherit'
          }}
        />
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
      <div className="u-blog-wrap">
        <p className="u-section-label" style={{ marginBottom: '32px' }}>Archive</p>
        {archivePosts && Object.keys(archivePosts).sort((a,b)=>b-a).map(year => (
          <div key={year} style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '9px', color: RED, letterSpacing: '0.12em', marginBottom: '8px' }}>{year}</p>
            {archivePosts[year].map(post => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '7px 0', borderBottom: '1px solid #f0f0f0',
                  fontSize: '13px', color: 'inherit', textDecoration: 'none'
                }}
              >
                <span>{post.title}</span>
                <span style={{ color: '#bbb', fontSize: '10px' }}>{formatDate(post.date)}</span>
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
    <div className="u-404">
      <p className="u-404-num">404</p>
      <p style={{ fontSize: '11px', color: '#bbb' }}>Page not found.</p>
      <Link href="/" style={{ fontSize: '11px', color: RED, textDecoration: 'underline', marginTop: '8px' }}>
        ← Home
      </Link>
    </div>
  </LayoutBase>
)

export default LayoutBase
ENDOFFILE
echo "done"
