/**
 * Utrecht Theme for NotionNext
 * Modelled after utrecht.jp
 *
 * Key fix: /photo and /blog are Page-slug routes that render through
 * LayoutSlug. NotionNext does NOT pass a single reliable "all posts"
 * array there, and latestPosts only contains type=Post. So we MERGE
 * every possible array (allNavPages / allPages / latestPosts / posts)
 * and filter by category. This finds your articles whether they are
 * type=Post or type=Page.
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
    { label: 'Home', path: '/' },
    { label: 'Photo', path: '/photo' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' }
  ]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr?.start_date || dateStr)
  if (isNaN(d)) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// 把 NotionNext 在 slug 页面可能传入的所有文章数组合并去重
const collectAllPosts = (props) => {
  const merged = []
  ;['allNavPages', 'allPages', 'allPosts', 'posts', 'latestPosts'].forEach((key) => {
    if (Array.isArray(props[key])) merged.push(...props[key])
  })
  const seen = new Set()
  return merged.filter((p) => {
    if (!p || !p.id || seen.has(p.id)) return false
    seen.add(p.id)
    const s = (p.slug || '').toLowerCase()
    return s !== 'photo' && s !== 'blog' && s !== 'about'
  })
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const ThemeFonts = () => (
  <style dangerouslySetInnerHTML={{ __html: `
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  background: #fff;
  color: ${RED};
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial,
    'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
.u-header { border-bottom: 1px solid #e0e0e0; }
.u-header-top { display: flex; align-items: center; padding: 18px 32px; }
.u-logo { margin-right: 40px; flex-shrink: 0; text-decoration: none; }
.u-logo-wordmark {
  font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', 'MS Mincho', Georgia, serif;
  font-size: 22px; font-weight: 700; color: ${RED};
  letter-spacing: 0.05em; line-height: 1; display: block;
}
.u-nav-row { display: flex; align-items: center; flex: 1; gap: 28px; flex-wrap: wrap; }
.u-nav-link {
  font-size: 12px; color: ${RED}; letter-spacing: 0.01em;
  white-space: nowrap; padding: 3px 0;
  border-bottom: 1px solid transparent; transition: border-color 0.15s;
}
.u-nav-link:hover { border-bottom-color: ${RED}; }
.u-nav-link.active { font-weight: 700; border-bottom-color: ${RED}; }
.u-page-wrap { display: flex; position: relative; }
.u-left-label { width: 36px; flex-shrink: 0; position: relative; }
.u-left-label-inner {
  position: sticky; top: 0; height: 100vh;
  display: flex; align-items: center; justify-content: center;
}
.u-left-label-text {
  writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);
  font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-size: 9px; color: ${RED}; letter-spacing: 0.15em; white-space: nowrap; line-height: 1;
}
.u-divider { border: none; border-top: 1px solid #e0e0e0; margin: 0; }
.u-content { flex: 1; min-width: 0; border-left: 1px solid #e0e0e0; }
.u-home-img { width: 100%; height: auto; display: block; }
.u-photo-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1px; background: #e0e0e0;
}
@media (min-width: 1000px) { .u-photo-grid { grid-template-columns: repeat(3, 1fr); } }
.u-photo-cell {
  position: relative; overflow: hidden; aspect-ratio: 3/2; background: #f5f5f5;
}
.u-photo-cell img {
  width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s;
}
.u-photo-cell:hover img { opacity: 0.85; }
.u-photo-caption {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0);
  background: linear-gradient(transparent, rgba(0,0,0,0.4)); transition: color 0.25s;
}
.u-photo-cell:hover .u-photo-caption { color: rgba(255,255,255,0.9); }
.u-blog-wrap { padding: 40px 40px 80px; max-width: 680px; }
.u-section-label {
  font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
  color: ${RED}; margin-bottom: 24px;
}
.u-blog-item {
  display: block; padding: 14px 0; border-bottom: 1px solid #f0e0e0;
  text-decoration: none; color: inherit;
}
.u-blog-item:first-of-type { border-top: 1px solid #f0e0e0; }
.u-blog-title {
  font-size: 13px; font-weight: 700; color: ${RED};
  margin-bottom: 3px; transition: opacity 0.15s;
}
.u-blog-item:hover .u-blog-title { opacity: 0.55; }
.u-blog-meta { font-size: 10px; color: #e88080; letter-spacing: 0.04em; }
.u-post-wrap { padding: 40px 40px 80px; max-width: 660px; }
.u-post-eyebrow {
  font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
  color: ${RED}; margin-bottom: 12px;
}
.u-post-title {
  font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-size: 18px; font-weight: 700; color: ${RED}; line-height: 1.35; margin-bottom: 6px;
}
.u-post-date { font-size: 10px; color: #e88080; letter-spacing: 0.04em; margin-bottom: 36px; }
.notion { font-size: 13px; line-height: 1.8; color: ${RED}; }
.notion .notion-page-title { display: none; }
.notion h1, .notion h2, .notion h3 {
  font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-weight: 700; color: ${RED}; margin: 24px 0 8px;
}
.notion h1 { font-size: 16px; }
.notion h2 { font-size: 14px; }
.notion h3 { font-size: 13px; }
.notion p { margin-bottom: 10px; }
.notion a { color: ${RED}; text-decoration: underline; text-underline-offset: 2px; }
.notion blockquote { border-left: 2px solid ${RED}; padding-left: 16px; opacity: 0.7; }
.u-footer {
  border-top: 1px solid #e0e0e0; padding: 20px 40px; font-size: 10px;
  color: #e88080; display: flex; justify-content: space-between; letter-spacing: 0.04em;
}
.u-404 { padding: 80px 40px; display: flex; flex-direction: column; gap: 12px; }
.u-404-num { font-size: 60px; font-weight: 800; color: #fce0e0; line-height: 1; }
@media (max-width: 680px) {
  .u-header-top { padding: 14px 16px; }
  .u-logo-wordmark { font-size: 17px; }
  .u-nav-row { gap: 16px; }
  .u-nav-link { font-size: 11px; }
  .u-left-label { display: none; }
  .u-content { border-left: none; }
  .u-blog-wrap { padding: 28px 16px 60px; }
  .u-post-wrap { padding: 28px 16px 60px; }
  .u-footer { padding: 16px; flex-direction: column; gap: 6px; }
}
@keyframes uFade { from { opacity: 0; } to { opacity: 1; } }
.u-fade { animation: uFade 0.35s ease both; }
`}} />
)

// ─── Header ───────────────────────────────────────────────────────────────────
const SiteHeader = ({ siteInfo }) => {
  const router = useRouter()
  const path = router.asPath
  const isActive = (p) => (p === '/' ? path === '/' : path.startsWith(p))
  return (
    <header className="u-header">
      <div className="u-header-top">
        <Link href="/" className="u-logo">
          <span className="u-logo-wordmark">{siteInfo?.title || 'Journal'}</span>
        </Link>
        <nav className="u-nav-row">
          {CONFIG.NAV_TABS.map((tab) => (
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
export const LayoutBase = ({ children, siteInfo, notice }) => {
  const hasShell = useContext(ShellContext)
  if (hasShell) return <>{children}</>

  // 左侧竖排文字：使用 Notion 中「type 为 Notice」的公告文章标题。
  // notice 是 NotionNext 全局数据里的公告对象（只取一条已发布的 Notice）。
  // 没有公告时，左栏整个不渲染；同时给 content 去掉左边框，避免最左侧留下一条多余竖线。
  const noticeText = notice?.title || ''
  const showLeft = Boolean(noticeText)

  return (
    <ShellContext.Provider value={true}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteInfo?.title || 'Journal'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <ThemeFonts />
      <SiteHeader siteInfo={siteInfo} />
      <hr className="u-divider" />
      <div className="u-page-wrap">
        {showLeft && (
          <div className="u-left-label">
            <div className="u-left-label-inner">
              <span className="u-left-label-text">{noticeText}</span>
            </div>
          </div>
        )}
        <div className="u-content" style={showLeft ? undefined : { borderLeft: 'none' }}>
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
          width: '100%', height: '55vh', background: '#fff5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '10px', color: '#e8a0a0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
  // 首页交给 LayoutIndex，这里不渲染任何东西（返回 null 避免重复 header/footer）
  if (!category && !tag && router.asPath === '/') return null
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
  const items = posts?.filter((p) => p?.pageCover || p?.pageCoverThumbnail) || []
  if (!items.length) {
    return (
      <div style={{ padding: '60px 40px' }}>
        <p style={{ fontSize: '10px', color: '#e8a0a0', letterSpacing: '0.1em' }}>No photos yet.</p>
      </div>
    )
  }
  return (
    <div className="u-photo-grid u-fade">
      {items.map((post) => (
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
        <p style={{ fontSize: '10px', color: '#e8a0a0', letterSpacing: '0.1em' }}>No posts yet.</p>
      </div>
    )
  }
  return (
    <div className="u-blog-wrap u-fade">
      <p className="u-section-label">{items.length} {items.length === 1 ? 'Entry' : 'Entries'}</p>
      {items.map((post) => (
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
  const slug = (post?.slug || props.slug || '').toLowerCase()
  // 区块页：/photo 与 /blog
  if (slug === 'photo' || slug === 'blog') {
    const source = collectAllPosts(props)
    let items = source.filter((p) => {
      const cat = (p.category || '').toString().toLowerCase()
      const tags = (p.tags || []).map((t) => (t || '').toString().toLowerCase())
      return cat === slug || tags.includes(slug)
    })
    // photo 兜底：没有 category 命中时，凡是带封面图的都算
    if (slug === 'photo' && !items.length) {
      items = source.filter((p) => p.pageCover || p.pageCoverThumbnail)
    }
    // 仍为空 → 输出诊断信息（确认问题后可删掉这段）
    if (!items.length) {
      const cats = [...new Set(source.map((p) => p.category).filter(Boolean))].join(', ')
      return (
        <LayoutBase {...props}>
          <div className="u-blog-wrap">
            <p className="u-section-label">No {slug} found · debug</p>
            <pre style={{ fontSize: '11px', color: '#999', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
{`allNavPages : ${Array.isArray(props.allNavPages) ? props.allNavPages.length : 'none'}
allPages : ${Array.isArray(props.allPages) ? props.allPages.length : 'none'}
latestPosts : ${Array.isArray(props.latestPosts) ? props.latestPosts.length : 'none'}
posts : ${Array.isArray(props.posts) ? props.posts.length : 'none'}
合并去重后 : ${source.length} 篇
出现的分类 : ${cats || '(无)'}`}
            </pre>
          </div>
        </LayoutBase>
      )
    }
    return (
      <LayoutBase {...props}>
        {slug === 'photo' ? <PhotoGrid posts={items} /> : <BlogList posts={items} />}
      </LayoutBase>
    )
  }
  // 普通文章 / 单页
  if (!post) return <Layout404 {...props} />
  const blockMap = props.blockMap || post.blockMap || post.content
  const isAbout = post.slug === 'about' || post.type === 'Page'
  return (
    <LayoutBase {...props}>
      <div className="u-post-wrap u-fade">
        {!isAbout && post.category && <p className="u-post-eyebrow">{post.category}</p>}
        <h1 className="u-post-title">{post.title}</h1>
        {!isAbout && <p className="u-post-date">{formatDate(post.date)}</p>}
        {blockMap ? (
          <div className="notion">
            <NotionRenderer recordMap={blockMap} fullPage={false} darkMode={false} disableHeader={true} />
          </div>
        ) : (
          <p style={{ fontSize: '11px', color: '#e8a0a0' }}>Loading…</p>
        )}
      </div>
    </LayoutBase>
  )
}

export const LayoutCategory = (props) => <LayoutPostList {...props} />
export const LayoutTag = (props) => <LayoutPostList {...props} />

// ─── LayoutSearch ─────────────────────────────────────────────────────────────
export const LayoutSearch = (props) => {
  const { posts, keyword } = props
  const [query, setQuery] = useState(keyword || '')
  const filtered = posts?.filter(
    (p) =>
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.summary?.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <LayoutBase {...props}>
      <div className="u-blog-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          style={{
            width: '100%', border: 'none', borderBottom: `1px solid ${RED}`,
            background: 'transparent', padding: '6px 0', fontSize: '13px',
            color: RED, outline: 'none', marginBottom: '32px', fontFamily: 'inherit'
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
        {archivePosts && Object.keys(archivePosts).sort((a, b) => b - a).map((year) => (
          <div key={year} style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '9px', color: RED, letterSpacing: '0.12em', marginBottom: '8px' }}>{year}</p>
            {archivePosts[year].map((post) => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                  borderBottom: '1px solid #fce8e8', fontSize: '13px', color: RED, textDecoration: 'none'
                }}
              >
                <span>{post.title}</span>
                <span style={{ color: '#e8a0a0', fontSize: '10px' }}>{formatDate(post.date)}</span>
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
      <p style={{ fontSize: '11px', color: '#e8a0a0' }}>Page not found.</p>
      <Link href="/" style={{ fontSize: '11px', color: RED, textDecoration: 'underline', marginTop: '8px' }}>
        ← Home
      </Link>
    </div>
  </LayoutBase>
)

export default LayoutBase

