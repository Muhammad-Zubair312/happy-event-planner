# Day 16 Changes — Image Optimization & Product Photos

## What was built

Day 16 task from the plan: **Image optimization — Next.js Image component, WebP conversion, Supabase storage for product photos**

Day 15 already completed the infrastructure (Next.js Image setup, blur placeholders, Supabase Storage bucket).
Day 16 focuses on **content**: real images on every product, optimized URLs, multi-image galleries, and category images.

---

## Files Changed

### `supabase/migrations/005_day16_product_images.sql` (NEW)
- Updates all 25 products to have **2–3 Unsplash images each** (was 1 basic URL)
- All URLs now use `?w=800&q=85&auto=format&fit=crop` — serves **WebP automatically** to browsers that support it (Chrome, Firefox, Safari 14+)
- Updates all 5 category records with `image_url` values
- Run verification query at end to confirm image counts

### `lib/images.ts` (ENHANCED)
New additions on top of Day 15's work:

| Addition | Purpose |
|---|---|
| `BLUR_GOLD` | New amber blur for accessories category |
| `PRODUCT_IMAGES` constant | Canonical Unsplash photo IDs — single source of truth |
| `buildImageSet()` | Builds optimized multi-image arrays from base URLs |
| `getOgImageUrl()` | Correct size (1200px) for Open Graph / WhatsApp share previews |
| `IMAGE_SIZES` | Responsive `sizes` strings for every context (card, detail, thumb, hero) |
| `getBlurByCategory()` | Added `accessories` → gold blur |

### `app/page.tsx` (UPDATED)
- Homepage category grid now shows **real product photos** with gradient overlay — no longer emoji-only
- Fallback products now have 2–3 real Unsplash images each
- Category images use `Image` component with blur placeholder
- No layout change — just upgraded visuals

### `app/products/page.tsx` (UPDATED)
- Fallback product list now uses real Unsplash images via `buildImageSet()`
- Product slugs updated to match Day 14 real product slugs
- Images show in product cards even before Supabase is connected

### `app/products/[slug]/page.tsx` (UPDATED)
- Fallback products now have 2–3 real images — gallery switcher works in development
- `getOgImageUrl()` now used for Open Graph meta tags (correct 1200px size for WhatsApp/Facebook previews)
- Related products fallback now shows real images

---

## How to apply

### 1. Run the Supabase migration
```sql
-- Paste contents of supabase/migrations/005_day16_product_images.sql
-- into Supabase Dashboard → SQL Editor → Run
```

### 2. Verify images loaded
```sql
SELECT name, array_length(images, 1) AS image_count
FROM products
ORDER BY category_id;
-- Every product should show 2 or 3
```

### 3. Check category images
```sql
SELECT name, image_url FROM categories;
-- All 5 should have a non-null image_url
```

### 4. No npm install needed
No new packages. All changes are in existing files.

---

## Image strategy summary

| Context | URL params | Quality |
|---|---|---|
| Product card grid | `?w=400&q=75&auto=format&fit=crop` | Thumbnail — fast load |
| Product detail main | `?w=1200&q=90&auto=format&fit=crop` | Full quality for zoom |
| Category card | `?w=400&q=75&auto=format&fit=crop` | Small, fast |
| Open Graph / WhatsApp | `?w=1200&q=80&auto=format&fit=crop` | Social share standard |
| DB storage | `?w=800&q=85&auto=format&fit=crop` | Source in Supabase |

`auto=format` makes Unsplash serve **WebP** to Chrome/Firefox/Safari (70%+ smaller than JPEG).
Pakistan mobile data is expensive — this directly reduces bounce rate.

---

## What's next (Day 17)
Mobile responsiveness — test on Android/iPhone, fix any layout breaks.
60%+ of Pakistan traffic is mobile. Every page should be tested at 375px width.
