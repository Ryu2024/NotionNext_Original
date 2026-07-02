/**
 * Utrecht Theme for NotionNext
 * Modelled after utrecht.jp
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
  // 左侧竖排文字：留空则自动用 Notion 中「type 为 Notice」公告文章的正文；想固定公告就写在这里
  SIDE_NOTE: '',
  // 调试开关：设为 true 后，首页内容区顶部会打印 notice 的诊断信息（排查公告问题时用，正常上线请保持 false）
  DEBUG_NOTICE: false,
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

// 从 Notice 公告文章中提取【正文纯文本】（跳过标题，按文档顺序拼接各段落）
// 说明：
//  1) notice.id 可能是「无连字符」形式，而 blockMap.block 的键是「带连字符」UUID，比较前统一 norm。
//  2) 根节点定位失败时，改用 type==='page' 的块兜底。
//  3) 最后再做一道安全网：把等于标题/摘要的行剔除，避免标题(如 "Website Notice")泄漏进竖排。
const getNoticeText = (notice) => {
  const recordMap = notice?.blockMap
  if (!recordMap?.block) return ''
  const blocks = recordMap.block
  const norm = (s) => (s || '').replace(/-/g, '')
  const richToText = (rich) =>
    Array.isArray(rich) ? rich.map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('') : ''

  let rootKey = Object.keys(blocks).find((k) => norm(k) === norm(notice?.id))
  if (!rootKey) rootKey = Object.keys(blocks).find((k) => blocks[k]?.value?.type === 'page')
  const rootId = rootKey || notice?.id

  const lines = []
  const pushText = (v) => {
    const t = richToText(v?.properties?.title)
    if (t) lines.push(t)
  }

  if (rootKey && Array.isArray(blocks[rootKey]?.value?.content)) {
    const walk = (id) => {
      const v = blocks[id]?.value
      if (!v) return
      if (norm(id) !== norm(rootId)) pushText(v)
      ;(v.content || []).forEach(walk)
    }
    blocks[rootKey].value.content.forEach(walk)
  } else {
    Object.keys(blocks).forEach((id) => {
      if (norm(id) === norm(rootId)) return
      pushText(blocks[id]?.value)
    })
  }

  const titleText = (notice?.title || '').trim()
  const summaryText = (notice?.summary || '').trim()
  return lines
    .map((l) => l.trim())
    .filter((l) => l && l !== titleText && l !== summaryText)
    .join('\n')
}

// 把 Notion 本地上传图片（带签名/防盗链的 S3 链接）转成可正常加载的 notion.so 代理链接。
// 做法：去掉链接里的签名 query，只留干净路径，再带上 table+id 让 Notion 代理在服务端重新签名。
// 外链图（unsplash、自有图床等）原样返回，不动。
const mapNotionImage = (url, block) => {
  if (!url) return url
  if (url.startsWith('data:')) return url
  // 站内相对路径
  if (url.startsWith('/')) return `https://www.notion.so${url}`
  // 已经是代理链接，直接用
  if (url.startsWith('https://www.notion.so/image/')) return url
  // 仅处理 Notion 的文件/附件链接
  const isNotionFile =
    url.includes('amazonaws.com') ||
    url.includes('prod-files-secure') ||
    url.includes('secure.notion-static.com') ||
    url.includes('notion-static.com')
  if (!isNotionFile) return url
  try {
    const clean = url.split('?')[0]            // 去掉签名 query
    const id = block?.id || block?.value?.id || ''
    const u = new URL('https://www.notion.so/image/' + encodeURIComponent(clean))
    u.searchParams.set('table', 'block')
    if (id) u.searchParams.set('id', id)
    u.searchParams.set('cache', 'v2')
    return u.toString()
  } catch (e) {
    return url
  }
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

    /* 让整个外壳至少撑满一屏，配合 footer 的 margin-top:auto 把页脚顶到底部 */
    #theme-utrecht { display: flex; flex-direction: column; min-height: 100vh; }
    /* 问题2：顶部横线改成红色细线 */
    .u-header { border-bottom: 1px solid ${RED}; }
    .u-header-top { display: flex; align-items: center; padding: 18px 32px; }
    .u-logo { margin-right: 40px; flex-shrink: 0; text-decoration: none; }
    /* 问题1修复：Latin 字形用 Georgia（端正衬线），CJK 回落到明朝体，二者搭配更协调。
       想换英文字体就改下面这行最前面的 Georgia。*/
    .u-logo-wordmark {
      font-family: Georgia, 'Times New Roman', 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-size: 22px; font-weight: 700; color: ${RED};
      letter-spacing: 0.04em; line-height: 1; display: block;
    }
    .u-nav-row { display: flex; align-items: center; flex: 1; gap: 28px; flex-wrap: wrap; }
    .u-nav-link {
      font-size: 12px; color: ${RED}; letter-spacing: 0.01em;
      white-space: nowrap; padding: 3px 0;
      border-bottom: 1px solid transparent; transition: border-color 0.15s;
    }
    .u-nav-link:hover { border-bottom-color: ${RED}; }
    .u-nav-link.active { font-weight: 700; border-bottom-color: ${RED}; }

    .u-page-wrap { display: flex; position: relative; flex: 1; }
    /* 问题2修复：去掉 rotate(180deg) 让竖排恢复正向；从顶部开始排、允许多列换行 */
    .u-left-label { width: 72px; flex-shrink: 0; position: relative; }
    .u-left-label-inner {
      position: sticky; top: 0; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 36px 0;
    }
    .u-left-label-text {
      writing-mode: vertical-rl; text-orientation: mixed;
      font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-size: 10px; color: ${RED}; letter-spacing: 0.15em; line-height: 1.7;
      max-height: calc(100vh - 72px);
      white-space: pre-line;   /* 保留公告正文里的段落换行：在竖排里表现为另起一列 */
    }
    .u-divider { border: none; border-top: 1px solid ${RED}; margin: 0; }
    /* 问题1：移除左侧竖灰线（原 border-left）；纵向 flex 便于 footer 沉底 */
    .u-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }

    /* 调试用：notice 诊断信息样式 */
    .u-notice-debug {
      margin: 16px 40px; padding: 12px 14px; border: 1px dashed ${RED};
      font-size: 11px; line-height: 1.6; color: #333; background: #fff8f8;
      white-space: pre-wrap; word-break: break-all; border-radius: 4px;
    }

    /* ── Home cover ── 等比缩放、跟视口高度挂钩、左对齐留白 */
    .u-home { padding: 36px 40px 64px; }
    .u-home-img {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 700px;
      margin: 0;
    }

    /* 问题3修复：容器背景透明；问题4：加内边距让照片不顶到顶部、四周留白 */
    .u-photo-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 1px; background: transparent;
      padding: 40px 40px 64px;
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
    /* 列表项：标题在左、日期在右，同一行；不加任何分隔横线 */
    .u-blog-item {
      display: flex; align-items: baseline; justify-content: space-between; gap: 24px;
      padding: 10px 0;
      text-decoration: none; color: inherit;
    }
    .u-blog-title {
      font-size: 13px; font-weight: 700; color: ${RED};
      transition: opacity 0.15s;
    }
    .u-blog-item:hover .u-blog-title { opacity: 0.55; }
    .u-blog-date { font-size: 10px; color: #e88080; letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0; }

    .u-post-wrap { padding: 40px 40px 80px; max-width: 660px; }
    .u-post-eyebrow {
      font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
      color: ${RED}; margin-bottom: 12px;
    }
    .u-post-title {
      font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-size: 16px; font-weight: 700; color: ${RED}; line-height: 1.35; margin-bottom: 28px;
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
    .notion img { margin: 12px 0; border-radius: 2px; }

    /* 红条高度 = 西瓜(78px) + 上下各 8px 余量，仅比 logo 高一点点 */
    .u-footer {
      margin-top: auto;
      position: relative;
      background: ${RED}; height: 94px; font-size: 10px;
      color: #fff; letter-spacing: 0.04em;
    }
    .u-footer-mark { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); height: 78px; width: auto; display: block; }
    .u-footer-copy { position: absolute; left: 40px; top: 50%; transform: translateY(-50%); }

    .u-404 { padding: 80px 40px; display: flex; flex-direction: column; gap: 12px; }
    .u-404-num { font-size: 60px; font-weight: 800; color: #fce0e0; line-height: 1; }

    @media (max-width: 680px) {
      .u-header-top { padding: 14px 16px; }
      .u-logo-wordmark { font-size: 17px; }
      .u-nav-row { gap: 16px; }
      .u-nav-link { font-size: 11px; }
      .u-left-label { display: none; }
      .u-content { border-left: none; }
      .u-home { padding: 24px 16px 48px; }
      .u-home-img { max-height: 480px; }
      .u-photo-grid { padding: 24px 16px 48px; }
      .u-blog-wrap { padding: 28px 16px 60px; }
      .u-post-wrap { padding: 28px 16px 60px; }
      .u-footer { height: 70px; }
      .u-footer-mark { height: 56px; right: 16px; }
      .u-footer-copy { left: 16px; }
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
    </header>
  )
}

// ─── Footer ─── 问题4：移除 "Powered by Notion"
const FOOTER_MARK = '/watermelon-white.png'
const SiteFooter = ({ siteInfo }) => (
  <footer className="u-footer">
    <span className="u-footer-copy">© {new Date().getFullYear()} {siteInfo?.title || ''}</span>
    <img className="u-footer-mark" src={FOOTER_MARK} alt="" />
  </footer>
)

// ─── LayoutBase ───────────────────────────────────────────────────────────────
export const LayoutBase = (props) => {
  const { children, siteInfo, notice } = props
  const hasShell = useContext(ShellContext)
  if (hasShell) return <>{children}</>
  // 左侧竖排内容：优先 CONFIG.SIDE_NOTE 手动公告，其次取 Notion 中「type 为 Notice」公告文章的【正文】。
  // notice 是 NotionNext 全局数据里的公告对象（只取一条已发布的 Notice），正文存在 notice.blockMap 中。
  // 两者都为空时，左栏整列不渲染。
  const sideNote = CONFIG.SIDE_NOTE || getNoticeText(notice)
  const showLeft = Boolean(sideNote)
  return (
    <ShellContext.Provider value={true}>
      {/* id="theme-utrecht" 必须保留：NotionNext 的 fixThemeDOM 靠它识别并清理重复外壳 */}
      <div id="theme-utrecht">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex, nofollow" />
          <title>{siteInfo?.title || 'Journal'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Head>
        <ThemeFonts />
        <SiteHeader siteInfo={siteInfo} />
        <div className="u-page-wrap">
          {showLeft && (
            <div className="u-left-label">
              <div className="u-left-label-inner">
                <span className="u-left-label-text">{sideNote}</span>
              </div>
            </div>
          )}
          <div className="u-content">
            {CONFIG.DEBUG_NOTICE && (
              <pre className="u-notice-debug">
{JSON.stringify({
  hasNotice: !!notice,
  noticeKeys: notice ? Object.keys(notice) : null,
  noticeId: notice?.id || null,
  noticeTitle: notice?.title || null,
  noticeSummary: notice?.summary || null,
  hasBlockMap: !!(notice && notice.blockMap && notice.blockMap.block),
  blockCount: (notice && notice.blockMap && notice.blockMap.block)
    ? Object.keys(notice.blockMap.block).length : 0,
  blockKeysSample: (notice && notice.blockMap && notice.blockMap.block)
    ? Object.keys(notice.blockMap.block).slice(0, 5) : null,
  extractedText: getNoticeText(notice) || null,
  allPropKeys: Object.keys(props)
}, null, 2)}
              </pre>
            )}
            {children}
          </div>
        </div>
        <SiteFooter siteInfo={siteInfo} />
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
        <div className="u-home">
          <img src={cover} alt="" className="u-home-img u-fade" />
        </div>
      ) : (
        <div style={{
          width: '100%', height: '55vh', background: '#fff5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '10px', color: '#e8a0a0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Set a cover image
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
        <p style={{ fontSize: '10px', color: '#e8a0a0', letterSpacing: '0.1em' }}>暂无照片</p>
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
        <p style={{ fontSize: '10px', color: '#e8a0a0', letterSpacing: '0.1em' }}>暂无文章</p>
      </div>
    )
  }
  return (
    <div className="u-blog-wrap u-fade">
      {items.map((post) => (
        <Link key={post.id} href={`/${post.slug}`} className="u-blog-item">
          <span className="u-blog-title">{post.title}</span>
          <span className="u-blog-date">{formatDate(post.date)}</span>
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

    // photo 兜底：没有 category 命中时，凡是带封面图的都算。
    if (slug === 'photo' && !items.length) {
      items = source.filter((p) => p.pageCover || p.pageCoverThumbnail)
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
  // About 这类独立页面不显示标题，直接进正文；顶部间距由 .u-post-wrap 的 padding 保证（与其他页面一致）
  const hideTitle = slug === 'about'
  return (
    <LayoutBase {...props}>
      <div className="u-post-wrap u-fade">
        {/* 按需求：不显示分类(PHOTO)与日期；标题上移到顶部、略缩小，正文紧随其后保持合理间距 */}
        {!hideTitle && <h1 className="u-post-title">{post.title}</h1>}
        {blockMap ? (
          <div className="notion">
            {/* mapImageUrl：把 Notion 本地上传图片的签名/防盗链链接转成可正常加载的代理链接，否则正文图会 403 裂开 */}
            <NotionRenderer
              recordMap={blockMap}
              mapImageUrl={mapNotionImage}
              fullPage={false}
              darkMode={false}
              disableHeader={true}
            />
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
