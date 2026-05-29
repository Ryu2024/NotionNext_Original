# Utrecht Theme for NotionNext

Inspired by [utrecht.jp](https://utrecht.jp) — a minimalist Japanese art/design bookstore.

## Design language

- Pure off-white background (`#fafaf8`), near-black text
- **IM Fell English SC** — site name mark
- **Cormorant Garamond** — headings, nav, dates (refined editorial serif)
- **Noto Serif JP** — body text (supports CJK characters)
- Ultra-minimal fixed header with lowercase navigation
- Generous negative space; images are the primary actor

---

## Installation

1. Copy the `themes/utrecht/` folder into your fork's `themes/` directory.

2. Open `blog.config.js` and change the `THEME` value:

```js
THEME: process.env.NEXT_PUBLIC_THEME || 'utrecht',
```

3. If deploying to Vercel, add an environment variable:

```
NEXT_PUBLIC_THEME = utrecht
```

---

## Setting up the four sections

The theme expects four sections: **home**, **photo**, **blog**, **about**.
These are wired to the following paths in `CONFIG.NAV_TABS` (edit at the top of `index.js`):

| Label  | Default path        | What it renders                         |
|--------|---------------------|-----------------------------------------|
| home   | `/`                 | Full-screen cover photo                 |
| photo  | `/category/Photo`   | Image grid (all posts in "Photo" category) |
| blog   | `/category/Blog`    | Minimal list (all posts in "Blog" category) |
| about  | `/about`            | Single Notion page slug "about"         |

### In Notion

1. **Home cover image** — Tag any post with `cover` or put it in a `Cover` category. Its `pageCover` becomes the home background. If none found, a placeholder landscape image is used.

2. **Photo posts** — Set the `Category` property to `Photo`. Each photo post should have a **Page Cover** image in Notion (this becomes the grid thumbnail).

3. **Blog posts** — Set the `Category` property to `Blog`.

4. **About page** — Create a Notion page with the `slug` property set to `about`.

---

## Customization

### Change nav items

Edit `CONFIG.NAV_TABS` at the top of `index.js`:

```js
export const CONFIG = {
  NAV_TABS: [
    { label: 'home',  path: '/' },
    { label: 'photo', path: '/category/Photo' },
    { label: 'blog',  path: '/category/Blog' },
    { label: 'about', path: '/about' },
  ]
}
```

### Change fonts

Replace the Google Fonts import URL inside `ThemeFonts` (search for `@import url`).

### Change background color

Search for `#fafaf8` and replace with any light neutral, e.g. `#fff` (pure white) or `#f5f2ee` (warm cream).

---

## Technical notes

- All CSS is injected via a `<style global>` tag inside `ThemeFonts` — no separate `.css` file needed.
- The theme does **not** require any additional npm packages beyond what NotionNext already ships.
- `NotionRenderer` from `react-notion-x` is used to render post bodies; the theme adds minimal CSS overrides under `.notion`.
- Photo section detection: if `category === 'Photo'` OR the URL path contains `/photo`, `LayoutPostList` renders the image grid instead of the text list.
