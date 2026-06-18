# Google Search Console — Complete Setup & Sitemap Submission Guide
## Happy Event Planner | Day 19 | Lahore, Pakistan

This guide walks through every step to get Happy Event Planner indexed by Google and
submit the sitemap. Estimated time: 20–30 minutes.

---

## What Google Search Console does for your store

- Tells Google your store exists and should be indexed
- Shows which of your product pages appear in Google search results
- Shows what keywords people used to find your store
- Alerts you to any crawl errors (broken pages, missing products)
- Lets you request urgent re-indexing after adding new products

Without Search Console, Google might take 3–6 months to discover your store organically.
With it, your pages can start appearing within days of launch.

---

## Step 1: Create a Google Search Console Account

1. Go to **https://search.google.com/search-console**
2. Sign in with your Google account (create one if needed — free)
3. Click **"Start now"**

---

## Step 2: Add Your Property (Website)

You will see two options. **Choose "URL prefix"** (not "Domain").

```
Property type: URL prefix
URL: https://happyeventplanner.vercel.app
```

> If you have a custom domain (e.g. `happyeventplanner.pk`), enter that instead.
> You can add multiple properties later — one for each domain/subdomain.

Click **Continue**.

---

## Step 3: Verify Ownership — HTML Meta Tag Method (Recommended)

Google shows you a verification meta tag like this:
```html
<meta name="google-site-verification" content="abc123XYZ789..." />
```

**Copy only the value inside `content="..."` — not the whole tag.**

### Add it to your project:

**Option A — Environment variable (recommended):**
1. Open `.env.local` in your project root
2. Find the line: `GOOGLE_SITE_VERIFICATION=your_google_verification_code_here`
3. Replace `your_google_verification_code_here` with your actual code:
   ```
   GOOGLE_SITE_VERIFICATION=abc123XYZ789...
   ```
4. Also add this to Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `GOOGLE_SITE_VERIFICATION` = `abc123XYZ789...`
   - Redeploy: push any change to GitHub or click "Redeploy" in Vercel

**Option B — HTML file method:**
1. Google also offers an HTML file download (e.g. `google1a2b3c4d.html`)
2. Place this file in your `/public` folder
3. A placeholder file is already at `public/googleXXXXXXXXXXXXXXXX.html`
4. **Replace that file with the actual file Google gives you**
5. Push to GitHub — Vercel deploys automatically
6. Verify the file is accessible: visit `https://your-domain/google1a2b3c4d.html`

### After deploying, click **"Verify"** in Search Console.

If verification succeeds, you'll see: ✅ Ownership verified

---

## Step 4: Submit Your Sitemap

Your sitemap is auto-generated at:
```
https://happyeventplanner.vercel.app/sitemap.xml
```

**Verify it works first:**
Open that URL in your browser. You should see XML listing all your pages like:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://happyeventplanner.vercel.app</loc>
    <lastmod>2026-06-17</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://happyeventplanner.vercel.app/products/chrome-gold-balloons-pack-20</loc>
    ...
  </url>
  ...
</urlset>
```

If the sitemap loads correctly, go to Search Console:
1. In the left sidebar, click **"Sitemaps"**
2. In the "Add a new sitemap" field, type: `sitemap.xml`
3. Click **Submit**

Google shows: ✅ "Sitemap submitted successfully" with URL count.

> The sitemap is dynamic — every time you add a product to Supabase, the next sitemap
> request will automatically include it. No manual updates needed.

---

## Step 5: Request Indexing for Your Key Pages

Even after sitemap submission, Google may take days to crawl everything.
For your most important pages, request indexing manually:

1. In Search Console, click the search bar at the top
2. Paste your URL: `https://happyeventplanner.vercel.app`
3. Click **"Request Indexing"**
4. Repeat for: `/products`, and your 3 best product pages

Do this for:
- `https://happyeventplanner.vercel.app`
- `https://happyeventplanner.vercel.app/products`
- `https://happyeventplanner.vercel.app/products/chrome-gold-balloons-pack-20`
- `https://happyeventplanner.vercel.app/products/pink-princess-birthday-package`
- `https://happyeventplanner.vercel.app/products/white-silver-balloon-arch-kit-100`

---

## Step 6: Check Indexing Status (after 3–7 days)

Go to Search Console → **Coverage** (or **Pages** in newer UI):

| Status | Meaning | Action |
|---|---|---|
| ✅ Valid | Page is indexed — appears in Google search | Nothing needed |
| ⚠️ Excluded | Page excluded (noindex, redirect, etc.) | Review — cart/checkout should be excluded |
| ❌ Error | Crawl error — page may be broken | Fix the page and re-request indexing |
| 🕐 Discovered | Google knows about it but hasn't crawled yet | Wait 3–7 more days |

**Expected results:**
- Homepage: ✅ Valid
- /products: ✅ Valid
- All product pages: ✅ Valid
- /cart, /checkout, /orders, /admin: ⚠️ Excluded (correct — these are noindex)

---

## Step 7: Verify Rich Results (Product Schema)

Your product pages have `schema.org/Product` JSON-LD markup (added Day 18).
This enables Google to show price and availability directly in search results.

Test it:
1. Go to: **https://search.google.com/test/rich-results**
2. Paste a product URL: `https://happyeventplanner.vercel.app/products/chrome-gold-balloons-pack-20`
3. Click **"Test URL"**

Expected output:
- ✅ Product — detected
- Price: PKR 850
- Availability: InStock

---

## Step 8: Monitor Weekly (ongoing)

Check Search Console once a week. Key reports to watch:

| Report | What to look for |
|---|---|
| **Performance** | Which queries bring visitors — add those keywords to more product pages |
| **Coverage/Pages** | Any new errors — fix immediately |
| **Core Web Vitals** | LCP, FID, CLS scores — should be green after Cloudflare CDN |
| **Sitemaps** | Confirm sitemap is being read regularly |

---

## Sitemap URL Summary

| URL | Purpose |
|---|---|
| `/sitemap.xml` | Main sitemap — all pages |
| `/robots.txt` | Crawl rules — blocks /admin, /api, /cart, /checkout, /orders |
| `/opengraph-image` | Default OG image for homepage (1200×630) |
| `/products/[slug]/opengraph-image` | Per-product OG image for WhatsApp previews |

---

## Troubleshooting

**Verification fails:**
- Ensure you deployed to Vercel after adding `GOOGLE_SITE_VERIFICATION` env var
- Check the meta tag appears in your page source: right-click → View Page Source → search for `google-site-verification`

**Sitemap returns 404:**
- Ensure Vercel deployed the latest code (check Vercel dashboard → Deployments)
- The sitemap is at `app/sitemap.ts` — make sure the file exists

**No pages indexed after 2 weeks:**
- Check robots.txt at `yourdomain/robots.txt` — confirm it's not blocking everything
- Request indexing manually for each key page (Step 5 above)
- Ensure your Vercel URL is publicly accessible (not password-protected)

---

## Expected Timeline

| Timeline | What happens |
|---|---|
| Day 1 (today) | Verification done, sitemap submitted |
| Day 3–7 | Homepage and /products appear in Google search results |
| Day 7–14 | Product pages start appearing for exact name searches |
| Month 1–2 | Pages rank for Lahore-specific keywords (balloon lahore, etc.) |
| Month 3+ | SEO compound growth — more pages indexed = more traffic |

---

*Day 19 complete. Sitemap live at `/sitemap.xml`. Robots.txt live at `/robots.txt`.
Dynamic OG images live at `/opengraph-image` and `/products/[slug]/opengraph-image`.*
