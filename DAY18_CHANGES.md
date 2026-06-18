# Day 18 Changes — SEO Metadata & Open Graph Tags

## What was built

Day 18 task from the plan: **SEO metadata — dynamic title/description for every page, Open Graph tags for WhatsApp share previews.**

---

## Files Created

| File | Purpose |
|---|---|
| `app/robots.ts` | Next.js App Router robots.txt — blocks /admin, /api, /cart, /checkout, /orders from crawlers |
| `app/sitemap.ts` | Dynamic sitemap.xml — pulls live product/category slugs from Supabase with fallback |
| `app/cart/layout.tsx` | Cart route metadata (noindex — transactional page) |
| `app/checkout/layout.tsx` | Checkout route metadata (noindex — transactional page) |
| `app/orders/layout.tsx` | Orders route metadata (noindex — personal data page) |
| `app/admin/layout.tsx` | Admin route metadata (noindex + noarchive — private) |

---

## Files Modified

### `app/layout.tsx` (MAJOR UPGRADE)
Root layout metadata completely rewritten:

| Addition | Detail |
|---|---|
| `metadataBase` | Set to `NEXT_PUBLIC_SITE_URL` — required for Next.js to resolve relative OG image URLs |
| `title.template` | `'%s \| Happy Event Planner Lahore'` — child pages just set the page-specific part |
| `keywords[]` | Expanded from 4 to 10 Lahore-specific keywords |
| `authors`, `creator`, `publisher` | Schema completeness |
| `robots` | `index: true, follow: true, googleBot: { max-image-preview: large }` |
| `openGraph` | Full OG block: `type`, `locale: en_PK`, `url`, `siteName`, `images[]` with dimensions and alt |
| `twitter` | `summary_large_image` card — makes WhatsApp and Twitter show large preview images |
| `alternates.canonical` | Canonical URL to prevent duplicate content |
| **LocalBusiness JSON-LD** | Full schema.org structured data injected in `<head>`: name, address, telephone, hours, priceRange, paymentAccepted, areaServed (DHA, Gulberg, Johar Town, Model Town, Bahria Town) |

### `app/page.tsx` (Homepage)
| Addition | Detail |
|---|---|
| `export const metadata` | Explicit homepage metadata — overrides layout defaults with homepage-specific copy |
| **WebSite JSON-LD** | `schema.org/WebSite` with `SearchAction` — enables Google Sitelinks search box in SERPs |

### `app/products/page.tsx` (Products listing)
| Addition | Detail |
|---|---|
| `export const metadata` | Page title: `'All Products — Balloons, Candles & Party Decor Lahore'` |
| Full OG block | Image, URL, description optimized for the listing page |
| `alternates.canonical` | Points to `/products` |

### `app/products/[slug]/page.tsx` (Product detail — UPGRADED)
Previous `generateMetadata` was basic. Now fully upgraded:

| Addition | Detail |
|---|---|
| `title` | `'{Product Name} — Buy in Lahore'` (inherits template from layout) |
| `keywords[]` | Dynamic per-product: product name, `{name} Lahore`, `{category} Lahore`, buy intent |
| `description` | Strips ✅ emojis and newlines from product description for clean meta text |
| `twitter` card | `summary_large_image` with PKR price in title |
| `alternates.canonical` | Canonical URL per product |
| `robots: noindex` | Only for products that 404 — keeps index: true for valid products |
| **Product JSON-LD** | `schema.org/Product` with: name, description, image[], offers (price, currency, availability, seller, areaServed) |
| **BreadcrumbList JSON-LD** | `Home › Products › {Category} › {Product}` — enables breadcrumbs in Google SERPs |

---

## Why These Specific Changes

### WhatsApp Share Previews (primary goal)
When a customer shares a product link on WhatsApp, WhatsApp scrapes the `og:image`, `og:title`, and `og:description` tags to build the preview card. Before Day 18, WhatsApp showed only the raw URL. After Day 18, every product link shared on WhatsApp shows:
- Product photo (1200×630)
- Product name and price
- Store name

### robots.txt
Prevents Google from crawling/indexing private pages (/admin, /cart, /checkout, /orders). Without this, Google wastes crawl budget on pages that change with every session and have no SEO value.

### Dynamic sitemap.xml
- Pulls live slugs from Supabase at build time
- Falls back to hardcoded slugs if Supabase unavailable
- Automatically includes any new products added to the database
- Submit the sitemap URL to Google Search Console after deployment

### Product JSON-LD
Enables Google to show:
- Price in rich results (`PKR 850`)
- Availability badge (`In Stock`)
- Breadcrumb trail in the URL below the title

### LocalBusiness + WebSite JSON-LD (layout)
- LocalBusiness: helps Google show the business in local pack results for "balloon shop lahore"
- WebSite SearchAction: enables Sitelinks search box when someone searches "Happy Event Planner" on Google

---

## SEO Metadata Coverage — All Pages

| Page | Title | Description | OG Image | Canonical | robots | JSON-LD |
|---|---|---|---|---|---|---|
| Homepage | ✅ | ✅ | ✅ | ✅ | index | LocalBusiness + WebSite |
| Products listing | ✅ | ✅ | ✅ | ✅ | index | — |
| Product detail | ✅ dynamic | ✅ dynamic | ✅ product image | ✅ | index | Product + BreadcrumbList |
| Cart | ✅ | ✅ | — | ✅ | **noindex** | — |
| Checkout | ✅ | ✅ | — | ✅ | **noindex** | — |
| Orders | ✅ | ✅ | — | ✅ | **noindex** | — |
| Admin | ✅ | ✅ | — | — | **noindex + noarchive** | — |

---

## Environment Variable Added

```bash
# .env.local — also add to Vercel dashboard
NEXT_PUBLIC_SITE_URL=https://happyeventplanner.vercel.app
```

Update this when you get your real domain (e.g. `https://happyeventplanner.pk`).

---

## Post-Deployment Checklist (Day 18)

- [ ] Add `NEXT_PUBLIC_SITE_URL` to Vercel environment variables
- [ ] Visit `yourdomain/sitemap.xml` — verify it lists your products
- [ ] Visit `yourdomain/robots.txt` — verify /admin is disallowed
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console)
- [ ] Test a product URL in [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — verifies OG tags
- [ ] Test a product URL on WhatsApp (send to yourself) — verify image preview appears
- [ ] Test JSON-LD in [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Verify `<html lang="en">` is present in page source

---

## What's next (Day 19)

Install `next-sitemap`, generate `sitemap.xml`, submit to Google Search Console.

> Note: Day 18 already built a native Next.js App Router sitemap at `app/sitemap.ts`. Day 19 can skip the `next-sitemap` package install and focus entirely on Search Console submission and any additional sitemap tuning.
