
Claude finished the response
我的分类 是正确的


重新审视了博客页面的筛选逻辑和分类方案。
重新审视了博客页面的筛选逻辑和分类方案。
明白，你的分类没问题——问题在主题这边用分类当了过滤条件。现在 Blog 页的逻辑是"只显示 category 或标签等于 blog 的文章"，可你的文章分类是"现代诗""文艺理论"这些，不叫 blog。所以只有恰好带了 blog 标签的那几篇漏了进来，其余全被过滤掉了。

正确的做法是：Blog 页展示所有文章，各自的分类（现代诗/文艺理论…）只用来显示、不参与过滤，只排除照片类和公告/配置这类非文章。

改过滤逻辑：


Edited a file, ran a command, read a file
Edited a file, ran a command, read a file
改好了。现在 Blog 页的规则变成：

展示所有文章，分类（现代诗、文艺理论…）只用于显示标题里的那个前缀，不再拿来过滤——所以你所有分类的文章都会出现，不会因为"分类不叫 blog"被漏掉。
只排除两类：照片类（分类或标签为 photo，归 Photo 页管）和非文章类型（Notice、Config、Page 这些功能条目，靠 type 字段识别）。
Photo 页逻辑原样保留，没动。
之前只显示一部分，就是因为过滤条件写成了 category === 'blog'，把你按内容分好类的文章几乎全挡在外面了。

刷新看一下是不是所有文章都出来了。两个可能需要留意的点：

万一有非文章条目漏进来（比如出现了"Website Notice"或"Config"这种）——说明你这版 NotionNext 的数据里 type 字段名或取值跟我假设的 'post' 不一样。把漏进来的是什么截图给我，我调一下 type 判断。
万一某篇文章没出现——可能它在 Notion 里 status 不是 Published，或者被 collectAllPosts 按 slug 排除了（photo/blog/about 这几个保留字）。告诉我是哪篇，我查。
先看效果，有问题随时说。


Index
JS 
可你的文章分类是"现代诗""文艺理论"这些，不叫 blog。 这不是我的文章分类，这是文章标题。

你说得对，是我看错了——"现代诗｜她已经把一生讲完了"整个是标题，那个"现代诗"是你标题里的前缀文字，不是分类字段。我之前把它当成分类来推断了，判断错了。

不过这不影响刚才的改动，反而更说明改对了。现在的逻辑不依赖任何分类名——Blog 页展示所有文章、分类只用于显示、只排除照片和功能条目。你的文章无论标题写什么、归在哪个分类，都会正常列出来。

刷新后应该能看到全部文章了。如果还有某篇没出现，或者有不该出现的条目（比如公告/配置）混进来，告诉我具体是哪条，我再对着真实数据调。

category === 'blog'，难道 不对吗

thGood question from the user. They're asking whether category === 'blog' is actually wrong. Let me think about this carefully.

The user is essentially asking: was the original filter cat === slug (i.e., category === 'blog') actually correct or not? They may be pointing out that in NotionNext, the Blog page IS supposed to show posts, and maybe their posts DO have category set appropriately.

Wait — let me reconsider. In NotionNext, how does the /blog page normally work? Actually, in standard NotionNext, there isn't necessarily a "blog" category. The Blog page typically shows ALL posts. But this custom theme created a slug-based approach where /blog is a Page, and it filters posts by category==='blog'.

The user is now questioning whether category === 'blog' is wrong. Let me think about what's actually happening in their data.

Key evidence: The posts WERE showing (6 of them showed in the screenshot), but only "part" of them. If the filter was category === 'blog', then those 6 shown posts must have category 'blog'. But the user said the missing ones... hmm.

Actually wait. Let me reconsider. The user said "为何blog页的内容展示不全 只展示了一部分" (why does blog page not show all content, only shows part). So 6 showed, but more exist that didn't show.

If filter is category === 'blog' || tags.includes('blog'), the 6 shown have blog category/tag, and the missing ones don't.

But now the user asks "category === 'blog'，难道不对吗" — "is category === 'blog' really wrong?"

This suggests the user believes their posts ARE categorized as 'blog', and maybe the real problem is something else — like the missing posts also have category 'blog' but got filtered for a DIFFERENT reason (e.g., collectAllPosts deduplication, or they're not in the arrays, or slug collision).

Hmm. This is important. I may have jumped to a conclusion again. Let me think about whether category === 'blog' could be correct and the real bug is elsewhere.

Actually, let me reconsider the whole thing. The user has pushed back twice now:

"我的分类是正确的" (my categorization is correct)
"这不是我的文章分类，这是文章标题" (that's not my category, that's the title)
Now: "category === 'blog'，难道不对吗" (is category === 'blog' really wrong?)
So the user is defending that their categories might all be 'blog', and questioning whether I was right to remove that filter.

I need to be honest here. Let me reconsider what's actually correct.

In NotionNext's data model, each Post has a category field. In many NotionNext setups, ALL blog posts share a single category, OR they have varied categories. There's no universal rule that category must equal 'blog'.

The custom theme's original design: /blog is a slug Page, and it shows posts where category === 'blog'. This ONLY works if the site author tags all their blog posts with category 'blog'.

The user's situation: they have posts with (apparently) various setups. Some showed, some didn't.

The honest answer: category === 'blog' isn't inherently "wrong" — it's a valid design IF all your posts use category 'blog'. But it's fragile: any post not categorized exactly 'blog' won't show. My change made it show ALL posts regardless of category, which is more robust for a general blog page.

But the user might actually WANT the category-based filter, and the real issue is that their missing posts SHOULD have category 'blog' but something else caused them to not show.

I shouldn't just insist my way is right. Let me give an honest, balanced answer:

category === 'blog' is a legitimate approach, not "wrong" in absolute terms.
Whether it's right for YOU depends on: do all the posts you want on the Blog page have category exactly "blog"?
If yes → the filter is correct, and the missing-posts problem has a DIFFERENT cause (need to investigate: were they Published? do they have the right category value? typos/case? are they in the data arrays?).
If no (posts have varied categories) → the filter is too restrictive, and my change is appropriate.
I should figure out which situation they're in. The cleanest way: ask them to check, in Notion, what the category field is for both a post that showed and one that didn't. OR check via the data.

Actually, I realize I've been changing things based on assumptions. Let me step back and be diagnostic. The most useful thing: help them determine the actual category values of their posts, then decide.

Let me reconsider whether my change could have caused a problem. My change: Blog shows all posts except photo-category and non-post-type. This is a superset. It should show MORE than before, including all the previously-missing ones. So my change likely FIXED the "only shows part" issue. The user is now just questioning the reasoning / whether the original was wrong.

So the honest answer: The original category === 'blog' wasn't "wrong" as code — it does exactly what it says. It became a problem because it assumes every blog post is categorized 'blog'. If your posts don't all have that exact category, they get hidden. That's why only some showed. My change removes that assumption so all articles show.

If you actually DO want category-based filtering (e.g., you deliberately use categories to route posts to different pages), then we should keep a filter but fix the mismatch — and I'd need to know your real category values.

Let me ask what their actual intent is, but also explain clearly. I think a short honest explanation + a diagnostic step is best. Let me not over-change code. Actually I already made the change. Let me explain and let them decide whether to keep it or revert to category-based.

I should be concise and honest, acknowledge the code isn't "wrong," explain the tradeoff, and offer to check their real data.

Let me give them a way to see their categories: in the browser console on the blog page, or check Notion. Actually the posts data might be accessible. But simplest: check Notion's category column.

Let me write a clear response.不是"对不对"的问题，是它假设了一件你不一定满足的事。

category === 'blog' 这行代码本身没错，它老老实实做了它写的事：只留下分类字段正好等于 blog 的文章。问题在于这个写法默认你所有博客文章的 category 都填成了 "blog"。只要有文章的分类不是这个值（空着、或填了别的、或大小写不同），它就会被挡掉——这就是你看到"只显示一部分"的原因。

所以对不对，取决于你的实际数据是哪种情况：

如果你确实把每篇博客文章的 category 都设成了 "blog" —— 那这行是对的，此时"只显示一部分"的真正原因在别处（比如某些文章没 Published、或 category 拼写/大小写不一致、或压根没进 NotionNext 传来的数组）。这种情况应该保留分类过滤，去查为什么有的文章漏了。
如果你的文章根本没统一用 "blog" 这个分类（比如你用分类来区分诗、评论等不同栏目，或者干脆没细分）—— 那这行就太严了，我改成"展示所有文章"才合适。
要判断你是哪种，最快的办法是去 Notion 那张表看一眼 category 这一列：那些没显示出来的文章，它们的 category 填的是什么？

如果它们的 category 也是 "blog"，却没显示 → 是别的 bug，我们查真正的原因，可以把原来的分类过滤加回去。
如果它们的 category 是空的或别的值 → 我这次的改法（不靠分类、展示全部）就是对的，保留即可。
你看一下那列的实际值告诉我，我就知道该保留现在的改动、还是回退去查别的原因。我不想再凭截图猜了，这次按你表里的真实字段来定。

我确实把每篇博客文章的 category 都设成了 "blog" —— 那这行是对的，此时"只显示一部分"的真正原因在别处，你帮我看看

好，既然分类都对，那就得查真正的原因。我先把改动回退到分类过滤，然后加一段临时诊断输出，把每篇文章为什么进/不进列表打印出来——这样不用猜。

先回退过滤逻辑：


查看当前 blog/photo 分支完整代码
查看当前 blog/photo 分支完整代码
在深入之前，我想到一个最可能的元凶，值得先说——不是过滤条件，而是上游的 collectAllPosts 只从这几个数组取数据：allNavPages / allPages / allPosts / posts / latestPosts。

其中 latestPosts（最新文章）通常只有 6 篇，allNavPages 也常常是被截断的子集。如果 NotionNext 传进来的这些数组里本身就没有全部文章（比如 allPages 做了分页、或只含导航页），那不管过滤条件多正确，缺的文章根本没进 source，自然显示不出来。

你截图里正好是 6 篇——这个数字很可疑，很像 latestPosts 的默认条数，或者某个数组的分页上限。

我加一段诊断，把关键信息打出来：每个数组各有多少篇、合并去重后多少篇、其中 category==='blog' 的有多少、以及每篇的 title/category/status。这样一眼就能看出是"没取到"还是"取到了但被过滤"。

我改成诊断版（保留分类过滤，只加打印）：


Edited a file, ran a command, read a file
Edited a file, ran a command, read a file
这一版把 Blog 过滤恢复成了 category === 'blog'（你确认的正确逻辑），另外加了一段临时诊断。用法：

换上这个文件重新部署/构建。
打开 Blog 页，按 F12 → Console 标签。
会看到几条 [BLOG诊断] 打头的输出，把它们整个截图或复制给我。
这几条日志会告诉我们：

各数组条数 —— 看 allPages、latestPosts 等各自有几篇。如果这里数字就很小（比如都 ≤6），说明 NotionNext 根本没把全部文章传进来，问题在数据源，跟过滤无关。
合并去重后 source 条数 —— 主题实际拿到多少篇。
每篇的 title / category / status —— 关键。能看到漏掉的文章到底在不在 source 里；如果在，它的 category 到底是不是 "blog"（会不会有隐藏的空格、全角字符、大小写、或者其实是数组形式）；status 是不是 Published。
category==="blog" 的条数 —— 和页面实际显示的篇数对比。
我打赌大概率是两种情况之一：要么 source 里压根没有那些文章（数据源分页/截断），要么它们在 source 里但 category 字段的实际值和 "blog" 有细微差异（NotionNext 里 category 有时是数组、或带了不可见字符）。日志一出来就能定位。

把 Console 那几行发我。


Index
JS 
应该就是这个原因。latestPosts 的问题

thThe user says it's likely the latestPosts issue — meaning collectAllPosts is pulling from latestPosts which is capped (~6), and the full set isn't coming through. But wait — collectAllPosts merges ALL of these arrays: allNavPages, allPages, allPosts, posts, latestPosts. If allPages or allPosts contained the full set, dedup would include them. So if only 6 show, it means NONE of the arrays had the full set, OR the full set is in an array that collectAllPosts isn't reading.

Actually the user hasn't given me the console output yet — they're speculating "应该就是这个原因" (this is probably the reason). I shouldn't just accept the guess and hack around it; but the user seems confident. However, to fix properly I need to know which array HAS all the posts. In NotionNext, the full published post list on a slug/page context is usually allPages (all published pages+posts) or the global posts.

The real issue: NotionNext's props on a Page (slug) route. For a static Page like /blog, NotionNext's getStaticProps typically provides post (the page itself) and possibly allNavPages, latestPosts, categoryOptions, tagOptions, but NOT the full posts array by default. The full list of all posts is usually NOT passed to a single Page's props. That's the crux — which is why this theme's collectAllPosts was a workaround, and it's incomplete.

So the robust fix isn't to read yet another prop array (they may all be partial). The proper NotionNext way to get ALL posts on the blog page is to use getGlobalData / the global notion data, or to make /blog use the index/post-list layout that NotionNext feeds with the full paginated posts.

But within a theme's exported layout, we only get what NotionNext passes. Let me think about what's actually available.

Actually, in NotionNext, LayoutSlug receives props that includes allNavPages (nav pages), notice, post, etc. The full posts list for listing pages is passed to LayoutPostList / LayoutIndex via posts (paginated) and postCount. For a custom "/blog" page implemented as a slug Page, you don't automatically get all posts.

Hmm. The cleanest real fix depends on how NotionNext is configured. But I can't run it. The user says "latestPosts is the problem."

I think the most honest and useful path: I can't fully verify without the console output, but I can improve collectAllPosts to also read more complete arrays if present (like allPages, posts), and importantly, dedupe. But if the full array truly isn't in props, no code change in the theme will conjure it — the fix would be in NotionNext config (e.g., set the blog page to render as a post-list, or increase POSTS_PER_PAGE, or use a different data source).

Let me ask for the actual console output to confirm which array has what, rather than guessing. The user said "应该就是这个原因" but hasn't shown me the numbers. I earlier said "send me the console lines." They responded with a guess instead of the data. I should gently get the actual numbers because the fix differs:

If allPages or allPosts has the full set → just make sure collectAllPosts reads it (it already does) — then the problem is elsewhere (dedup? filter?).
If ALL arrays are partial → theme can't fix it alone; need NotionNext-level change.
Actually collectAllPosts already reads allPages and allPosts. So if those had all posts, they'd show. The fact only 6 show suggests those arrays are absent/empty in this route, and only latestPosts (6) is populated. That means NotionNext isn't passing the full list to this Page route.

So the real fix: get the full posts list into this page. Options:

In NotionNext config (blog.config.js), there might be a way, but the standard approach: NotionNext's LayoutPostList / category / archive pages DO get full posts.
Make /blog not a slug Page but use NotionNext's built-in post list. But the theme is built around slug pages.
Hmm, actually — let me reconsider. There's a NotionNext prop that's commonly available globally: when NotionNext builds, it attaches the full post list. Let me recall the actual prop names in current NotionNext: allNavPages (all nav pages = published posts that are type Post + Page shown in nav?), Actually allNavPages in NotionNext = all pages for navigation search — it typically includes ALL published posts (used for search). That's usually the FULL list! So allNavPages should have everything.

Wait — collectAllPosts reads allNavPages first. If allNavPages had all posts, they'd all be in source. So why only 6?

Unless allNavPages excludes something, or in this route allNavPages is also limited.

I really need the console numbers. Let me not thrash. I'll ask for the actual output of the diagnostic — specifically the "各数组条数" line — because that single line tells us exactly which array has how many, and determines the fix. The user guessing "latestPosts" isn't enough to fix it correctly.

But I also don't want to be annoying by refusing to proceed. Let me give a concrete, likely-correct fix while asking to confirm: The best theme-side fix is to prefer the most complete array. But collectAllPosts already merges all. So if it's still short, the data isn't there.

Let me reconsider: maybe the bug is that collectAllPosts dedupes by id, and latestPosts items and allNavPages items… no.

OK, decisive approach: I'll ask them to paste just the first diagnostic line (各数组条数). That's the deciding data. I'll explain what each outcome means and the corresponding fix, so they see I'm not stalling. Keep it short.

Actually, the user might find it tedious. Let me offer: paste the "各数组条数" line. Based on it:

If allNavPages/allPages is large (e.g., 20) but only 6 show → filter/dedup bug, I fix in code now.
If ALL are ≤6 → NotionNext isn't passing full list; fix is config-level, and I'll tell them exactly what to change.
Let me write concise response requesting that one line, with the interpretation guide.先别急着下结论——"应该是"还不够，得看那行数字才能确定对症下药。你把 Console 里 [BLOG诊断] 各数组条数 那一行发我就行，一行就够。

因为这里有个关键点：collectAllPosts 其实是把 allNavPages / allPages / allPosts / posts / latestPosts 五个数组全都合并了的，不是只读 latestPosts。所以如果只有 6 篇，可能有两种完全不同的情况，修法也完全不同：

情况 A：其他数组是空的/没传，只有 latestPosts 有 6 篇。 那就是 NotionNext 在 /blog 这个页面路由根本没把全量文章传进来。这种主题代码本身补不了——得从 NotionNext 那边拿全量数据（比如让 /blog 走内置的文章列表页、或改配置），我会告诉你具体怎么调。
情况 B：allNavPages 或 allPages 其实有二三十篇，但最后只显示 6 篇。 那问题就在合并或过滤环节（比如去重误伤、category 字段有隐藏差异），这种我在代码里直接就能修好。
那行 各数组条数 长这样，把方括号里的数字发我：

[BLOG诊断] 各数组条数: {allNavPages: ?, allPages: ?, allPosts: ?, posts: ?, latestPosts: ?}
如果 allNavPages 和 allPages 也都是很小的数（≤6）→ 情况 A。
如果它们有明显更大的数（比如 20+）→ 情况 B。
发我这一行，我立刻给你对应的解决方案。顺便把下面那条"合并去重后 source 条数"也一起发来更好，双重确认。







Claude is AI and can make mistakes. Please double-check responses.
Index · JS
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
 
const RED = '#DA0001'
 
export const CONFIG = {
  THEME_SWITCH: false,
  // 左侧竖排文字：留空则自动用 Notion 中「type 为 Notice」公告文章的正文；想固定公告就写在这里
  SIDE_NOTE: '',
  // 调试开关：设为 true 后，首页内容区顶部会打印 notice 的诊断信息（排查公告问题时用，正常上线请保持 false）
  DEBUG_NOTICE: false,
  // pinned:true 的项永远显示（不随 Notion 显隐）；Home 是路由不是 Notion 页，About 在 Notion 里是 Invisible 但仍要保留在菜单。
  // 其余项（Photo/Blog 及以后新增页面）跟随 Notion：在 Notion 里隐藏或删除，菜单项自动消失。
  NAV_TABS: [
    { label: 'Home', path: '/', pinned: true },
    { label: 'Photo', path: '/photo' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about', pinned: true }
  ]
}
 
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr?.start_date || dateStr)
  if (isNaN(d)) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
 
// 把文章日期解析成可比较的时间戳（毫秒）；无日期或无法解析时返回 -Infinity，用于排序时沉底。
const getDateValue = (post) => {
  const raw = post?.date?.start_date || post?.date
  if (!raw) return -Infinity
  const t = new Date(raw).getTime()
  return isNaN(t) ? -Infinity : t
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
      font-family: Georgia, 'Times New Roman', 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
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
    /* 高度跟随中间区内容（height:100%），只用 max-height 封顶：
       内容不足一屏时列高=内容高，不再把页脚挤出视口；
       内容超过一屏时被 100vh 截断并 sticky 吸顶，竖排文字仍在视口内居中。 */
    .u-left-label-inner {
      position: sticky; top: 0; height: 100%; max-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 36px 0;
    }
    .u-left-label-text {
      writing-mode: vertical-rl; text-orientation: mixed;
      font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
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
    /* 封面竖栏（竖排公告贴封面左侧）：桌面端不显示——桌面已有整页左栏，避免重复。
       仅在移动端出现，填补移动端隐藏整页左栏后的空白。 */
    .u-home-cover { display: block; }
    .u-home-side { display: none; }
 
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
      font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-size: 13px; font-weight: 700; color: ${RED};
      transition: opacity 0.15s;
    }
    .u-blog-item:hover .u-blog-title { opacity: 0.55; }
    .u-blog-date {
      font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-size: 10px; color: #e88080; letter-spacing: 0.04em; white-space: nowrap; flex-shrink: 0;
    }
 
    .u-post-wrap { padding: 40px 40px 80px; max-width: 660px; }
    .u-post-eyebrow {
      font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
      color: ${RED}; margin-bottom: 12px;
    }
    .u-post-title {
      font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-size: 16px; font-weight: 700; color: ${RED}; line-height: 1.35; margin-bottom: 28px;
    }
    .u-post-date { font-size: 10px; color: #e88080; letter-spacing: 0.04em; margin-bottom: 36px; }
 
    /* 正文也用明朝体栈：之前只给 h1-h3 设了 font-family，正文一直继承 body 的黑体。
       --notion-font + !important 是为了压过 react-notion-x 自带样式表里的字体声明。 */
    .notion {
      font-size: 13px; line-height: 1.8; color: ${RED};
      --notion-font: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif !important;
    }
    /* 对齐 Blog 首行。已确认 react-notion-x 在 fullPage=false 下无 .notion-page 包裹层，
       第一行正文就是 .notion 的直接子元素 .notion-text，它自带 padding:3px 2px。
       Blog 首行 = 40(wrap) + 10(.u-blog-item) = 50px。
       这里清掉首块 .notion-text 的自带间距，再由 .u-post-body-top 统一补 10px，两页首行对齐。 */
    .notion > .notion-text:first-child,
    .notion > *:first-child {
      margin-top: 0 !important; padding-top: 0 !important;
    }
    /* 实测：About 首行(.notion-text)比 Blog(.u-blog-title)低 10.75px。
       原因是 react-notion-x 的首块 .notion-text 已自带约 10.75px 顶部空间，
       之前再叠加 10px padding 属于加倍。这里改为不加 padding、并用 -0.75px 抹平零头，两页首行精确对齐。 */
    .u-post-body-top { padding-top: 0; margin-top: -0.75px; }
    .notion code, .notion pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .notion .notion-page-title { display: none; }
    .notion h1, .notion h2, .notion h3 {
      font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
      font-weight: 700; color: ${RED}; margin: 24px 0 8px;
    }
    .notion h1 { font-size: 16px; }
    .notion h2 { font-size: 14px; }
    .notion h3 { font-size: 13px; }
    .notion p { margin-bottom: 10px; }
    .notion a { color: ${RED}; text-decoration: underline; text-underline-offset: 2px; }
    .notion blockquote { border-left: 2px solid ${RED}; padding-left: 16px; opacity: 0.7; }
    .notion img { margin: 12px 0; border-radius: 2px; }
 
    /* 页脚做成清爽收尾线：46px ≈ 页头(58px)的 0.8 倍。
       西瓜坐底(bottom:5px)，版权行同样贴底基线，与西瓜底部对齐。 */
    .u-footer {
      margin-top: auto;
      position: relative;
      background: ${RED}; height: 46px; font-size: 10px;
      color: #fff; letter-spacing: 0.04em;
    }
    .u-footer-mark { position: absolute; right: 40px; bottom: 5px; height: 34px; width: auto; display: block; }
    .u-footer-copy { position: absolute; left: 40px; bottom: 8px; line-height: 1; }
 
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
      .u-home-img { max-height: 480px; min-width: 0; }
      /* 移动端：竖排公告贴在封面左侧并排。
         竖栏用 vertical-rl，给 max-height（跟封面等高 480px）+ white-space:normal，
         文字写满一列后自动向左折成第二、三列（像书页），不会向下无限顶、也不溢出。 */
      .u-home-cover { display: flex; align-items: flex-start; gap: 12px; }
      .u-home-side {
        display: block; flex-shrink: 0;
        writing-mode: vertical-rl; text-orientation: mixed;
        font-family: 'Shippori Mincho', 'Noto Serif TC', 'Noto Serif SC', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
        font-size: 9px; line-height: 1.75; letter-spacing: 0.1em; color: ${RED};
        max-height: 480px; white-space: pre-line;   /* 保留公告手动换行=另起一列，且列满时自动折列 */
        overflow: hidden;
      }
      .u-home-cover .u-home-img { max-height: 480px; min-width: 0; flex: 1; }
      .u-photo-grid { padding: 24px 16px 48px; }
      .u-blog-wrap { padding: 28px 16px 60px; }
      .u-post-wrap { padding: 28px 16px 60px; }
      .u-footer { height: 38px; font-size: 9px; }
      .u-footer-mark { height: 28px; right: 16px; bottom: 4px; }
      .u-footer-copy { left: 16px; bottom: 7px; }
    }
 
    @keyframes uFade { from { opacity: 0; } to { opacity: 1; } }
    .u-fade { animation: uFade 0.35s ease both; }
  `}} />
)
 
// ─── Header ───────────────────────────────────────────────────────────────────
// 计算最终导航。规则：
//  - 以 CONFIG.NAV_TABS 的顺序为骨架（保证 Home…About 的排列稳定）。
//  - pinned:true 的项无条件显示（Home 是路由；About 在 Notion 里 Invisible 但仍要留在菜单）。
//  - 非 pinned 项只有当它对应的页面在 Notion 里“可见”时才显示：
//    在 Notion 把 Photo 设 Invisible 或删除后，它就不在 visiblePaths 里，菜单项随之消失。
//  - 取不到 Notion 数据时（visiblePaths 为空），非 pinned 项默认全部保留，避免误删菜单。
const resolveNav = (props) => {
  const raw =
    props?.customNav ||
    props?.customMenu ||
    props?.nav ||
    props?.navList ||
    props?.menu ||
    null
 
  // Notion 侧当前“可见”的路径集合（已归一化为 /xxx）
  const visiblePaths = new Set()
  if (Array.isArray(raw)) {
    raw
      .filter((it) => it && it.show !== false)
      .forEach((it) => {
        let p = it.href ?? it.to ?? it.slug ?? it.path ?? ''
        if (p && !p.startsWith('/') && !p.startsWith('http')) p = '/' + p
        if (p) visiblePaths.add(p)
      })
  }
  const hasNotionNav = visiblePaths.size > 0
 
  return CONFIG.NAV_TABS.filter((tab) => {
    if (tab.pinned) return true            // Home / About 常驻
    if (!hasNotionNav) return true         // 拿不到 Notion 导航时不误删
    return visiblePaths.has(tab.path)      // 其余项按 Notion 显隐
  })
}
 
 
const SiteHeader = ({ siteInfo, navItems }) => {
  const router = useRouter()
  const path = router.asPath
  const isActive = (p) => (p === '/' ? path === '/' : path.startsWith(p))
  // navItems 来自 Notion（跟随页面显隐）；为空时回退到写死的 NAV_TABS
  const tabs = navItems && navItems.length > 0 ? navItems : CONFIG.NAV_TABS
  return (
    <header className="u-header">
      <div className="u-header-top">
        <Link href="/" className="u-logo">
          <span className="u-logo-wordmark">{siteInfo?.title || 'Journal'}</span>
        </Link>
        <nav className="u-nav-row">
          {tabs.map((tab) => (
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
  // 跟随 Notion 页面显隐的导航；取不到则 Header 内部回退到 CONFIG.NAV_TABS
  const navItems = resolveNav(props)
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
          {/* 字体统一在这里加载（原 @import 已移除）：Shippori=日文明朝，TC=繁体宋，SC=简体宋（简体内容必须靠它，TC 缺简体字形） */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;700&family=Noto+Serif+TC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700&display=swap"
          />
        </Head>
        <ThemeFonts />
        <SiteHeader siteInfo={siteInfo} navItems={navItems} />
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
  const { siteInfo, notice } = props
  const cover = siteInfo?.pageCover || siteInfo?.pageCoverThumbnail
  // 与 LayoutBase 同源的公告文本：竖栏仅在移动端显示（由 CSS 控制），桌面端不渲染重复内容
  const sideNote = CONFIG.SIDE_NOTE || getNoticeText(notice)
  return (
    <LayoutBase {...props}>
      {cover ? (
        <div className="u-home">
          <div className="u-home-cover">
            {sideNote && <div className="u-home-side">{sideNote}</div>}
            <img src={cover} alt="" className="u-home-img u-fade" />
          </div>
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
  // 按日期倒序（新→旧）；无日期的文章排到最末。用切片避免改动传入数组。
  const items = [...(posts || [])].sort((a, b) => getDateValue(b) - getDateValue(a))
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
 
    // ── 临时诊断（排查 Blog 缺文章）：确认后删除这个 if 块 ──
    if (slug === 'blog') {
      const arr = (k) => (Array.isArray(props[k]) ? props[k].length : '(无此数组)')
      // eslint-disable-next-line no-console
      console.log('[BLOG诊断] 各数组条数:', {
        allNavPages: arr('allNavPages'),
        allPages: arr('allPages'),
        allPosts: arr('allPosts'),
        posts: arr('posts'),
        latestPosts: arr('latestPosts'),
      })
      console.log('[BLOG诊断] 合并去重后 source 条数:', source.length)
      console.log(
        '[BLOG诊断] source 每篇 (title / category / status / type):',
        source.map((p) => ({
          title: p.title,
          category: p.category,
          status: p.status,
          type: p.type,
          slug: p.slug,
        }))
      )
      const blogCat = source.filter(
        (p) => (p.category || '').toString().toLowerCase() === 'blog'
      )
      console.log('[BLOG诊断] 其中 category==="blog" 的条数:', blogCat.length)
    }
    // ── 诊断结束 ──
 
    let items
    if (slug === 'photo') {
      // Photo：归到 photo 分类/标签的文章；没有命中则退回所有带封面图的。
      items = source.filter((p) => {
        const cat = (p.category || '').toString().toLowerCase()
        const tags = (p.tags || []).map((t) => (t || '').toString().toLowerCase())
        return cat === 'photo' || tags.includes('photo')
      })
      if (!items.length) items = source.filter((p) => p.pageCover || p.pageCoverThumbnail)
    } else {
      // Blog：按分类过滤（你的每篇博客 category 均为 "blog"）。
      items = source.filter((p) => {
        const cat = (p.category || '').toString().toLowerCase()
        const tags = (p.tags || []).map((t) => (t || '').toString().toLowerCase())
        return cat === 'blog' || tags.includes('blog')
      })
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
          <div className={`notion${hideTitle ? ' u-post-body-top' : ''}`}>
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
 

