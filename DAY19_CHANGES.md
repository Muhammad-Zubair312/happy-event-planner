# Day 19 Changes — Sitemap, Dynamic OG Images & Google Search Console

## What was built

Day 19 task from the plan: **Install next-sitemap, generate sitemap.xml, submit to Google Search Console.**

> Note: Day 18 already built a native Next.js App Router sitemap at `app/sitemap.ts`.
> Installing `next-sitemap` on top of it would create duplicate/conflicting sitemaps.
> Day 19 therefore enhances the existing native sitemap and focuses on the rest of the day's goal:
> dynamic OG images + full Google Search Console setup guide.

---

## Files Created

| File | Purpose |
|---|---|
| `app/opengraph-image.tsx` | Dynamic homepage OG image (1200×630) — replaces missing `og-default.jpg` |
| `app/products/[slug]/opengraph-image.tsx` | Dynamic per-product OG image with product name, PKR price, category gradient |
| `public/googleXXXXXXXXXXXXXXXX.html` | Google Search Console HTML verification file placeholder |
| `GOOGLE_SEARCH_CONSOLE_GUIDE.md` | Complete step-by-step Search Console setup + sitemap submission guide |

---

## Files Modified

### `app/sitemap.ts` (ENHANCED)
| Change | Detail |
|---|---|
| `lastModified` from DB | Product routes now use `new Date(p.created_at)` from Supabase — tells Google exactly when each product was added |
| Better comments | Explains priority strategy and crawl behaviour |
| Cleaner fallback logic | Same fallback slugs but better structured |

### `app/layout.tsx` (UPDATED)
| Change | Detail |
|---|---|
| `verification.google` | Reads from `GOOGLE_SITE_VERIFICATION` env var — renders `<meta name="google-site-verification">` tag in every page's `<head>` |

### `.env.local` (UPDATED)
| Change | Detail |
|---|---|
| `GOOGLE_SITE_VERIFICATION` | New env var — user fills in their actual code from Google Search Console |

---

## Dynamic OG Images — How They Work

### Why they matter
Day 18 referenced `og-default.jpg` in all metadata, but that static file never existed.
WhatsApp was showing blank previews when sharing product links.

Day 19 replaces it with two **dynamic, server-rendered OG images** using Next.js's built-in
`ImageResponse` (powered by `@vercel/og`, bundled with Next.js 13+). No extra package installs.

### Homepage OG image (`/opengraph-image`)
- Purple-to-teal gradient matching store brand colors
- Store name, emoji row (🎈🎉🕯️🎀🎁), tagline
- Feature pills: Same-Day Delivery, WhatsApp Orders, COD Available
- Delivery area list: DHA · Gulberg · Johar Town · Model Town · Bahria Town
- Domain shown at bottom

### Product OG image (`/products/[slug]/opengraph-image`)
Each product gets a **unique, dynamically generated image**:
- Gradient color changes per category:
  - Balloons → purple gradient
  - Candles → teal gradient
  - Paper Decor → pink gradient
  - Event Packages → blue gradient
  - Wedding → purple-pink gradient
- Product name (font size adjusts for long names)
- PKR price in a prominent badge
- WhatsApp order CTA button (green)
- Category emoji badge (top right)
- Store branding (top left)
- Delivery info bar (bottom)

### Fallback data
Both OG image routes include hardcoded fallback product data — if Supabase is
unavailable (edge cold start, build time), they render from static data rather than
showing a blank/error image.

### Auto-registration by Next.js
Next.js App Router automatically registers these files as OG images for their route segments:
- `app/opengraph-image.tsx` → used for `og:image` on `/` (homepage)
- `app/products/[slug]/opengraph-image.tsx` → used for `og:image` on `/products/{slug}`

No changes needed to `generateMetadata` — Next.js handles the wiring automatically.

---

## Google Search Console — Setup Summary

See `GOOGLE_SEARCH_CONSOLE_GUIDE.md` for the full step-by-step guide.

Quick summary of what to do after deployment:

### 1. Add GOOGLE_SITE_VERIFICATION env var
```bash
# .env.local
GOOGLE_SITE_VERIFICATION=your_code_from_gsc_here

# Also add to Vercel dashboard:
# Project → Settings → Environment Variables
```

### 2. Submit sitemap
In Search Console → Sitemaps → Add new sitemap:
```
sitemap.xml
```

Full sitemap URL: `https://yourdomain.com/sitemap.xml`

### 3. Request indexing for key pages
Use the URL inspection tool in Search Console to request indexing for:
- Homepage
- /products
- Your top 3 product pages

### 4. Verify rich results
Test at: https://search.google.com/test/rich-results
Paste any product URL — should show Product schema with price.

---

## Sitemap Coverage (all routes)

| URL | Priority | changeFrequency | lastModified |
|---|---|---|---|
| `/` | 1.0 | daily | Current date |
| `/products` | 0.9 | daily | Current date |
| `/products?category=balloons` | 0.7 | weekly | Current date |
| `/products?category=candles` | 0.7 | weekly | Current date |
| `/products?category=paper-decor` | 0.7 | weekly | Current date |
| `/products?category=packages` | 0.7 | weekly | Current date |
| `/products?category=custom-orders` | 0.7 | weekly | Current date |
| `/products?category=wedding-decor` | 0.7 | weekly | Current date |
| `/products/{slug}` × N | 0.8 | weekly | Product created_at from DB |

Total URLs in sitemap: **2 static + 6 categories + N products**

---

## What's next (Day 20)

End-to-end testing — complete order flow without payment, check all links.
