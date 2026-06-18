# Happy Event Planner — E-Commerce Store
Lahore, Pakistan | 2026

## Progress

### ✅ Week 1 (Days 1–7)
- Day 1 — Next.js 16 + TypeScript + Tailwind setup
- Day 2 — Supabase: 8 tables + RLS + seed data
- Day 3 — Brand theme: purple/teal + component library
- Day 4 — Header + Footer
- Day 5 — Homepage: hero, categories, products, WhatsApp CTA
- Day 6-7 — Products listing: filters, search, category pills

### ✅ Week 2 — Day 8-9: Product Detail Page
- Image gallery + thumbnail switcher
- Quantity selector, stock status, WhatsApp order button
- Breadcrumb, trust badges, related products, SEO metadata

### ✅ Week 2 — Day 10: Cart System
- CartContext with useReducer (Context API)
- ADD / REMOVE / UPDATE_QTY / CLEAR_CART actions
- Persisted to sessionStorage
- CartProvider wrapping entire app in layout.tsx
- Header: live cart count badge
- Cart page: item list, order summary, WhatsApp button, checkout

### ✅ Week 2 — Day 11: Checkout Page
- 3-step flow (details → review → confirmed)
- Lahore area dropdown with delivery zones (A/B/C/D) + live fee preview
- JazzCash / EasyPaisa / COD payment options
- Real-time validation, order summary sidebar
- Mobile sticky checkout bar

### ✅ Week 2 — Day 12: Order Creation Flow
- POST /api/orders — saves order + items to Supabase
- Customer upsert by phone (new or returning)
- Delivery zone calculation + fee
- Stock deduction via deduct_stock() RPC
- Payment record creation
- Order confirmation screen with WhatsApp confirm button
- GET /api/orders — order tracking by phone or order number
- app/orders/page.tsx — visual order tracker with progress bar

### ✅ Week 3 — Day 13: Admin Dashboard
- /app/admin/page.tsx — full admin UI
- Stats cards: today's orders, revenue, pending, active products, low stock
- Orders tab: filter by status, one-click status updates, order detail drawer
- Products tab: search, inline stock editing (click to edit), status toggle
- /api/admin/orders — GET all orders (with customer + items), PATCH status
- /api/admin/products — GET all products, PATCH stock/status
- WhatsApp customer contact from within order drawer
- Auto inventory log on admin stock update

### ✅ Week 3 — Day 14: 25 Real Products Added
- supabase/migrations/003_day14_products.sql
- 8 Balloons: Chrome gold, Pink & rose gold, Foil numbers, Eid Mubarak, Arch kit, Hearts, Confetti, Independence Day
- 5 Candles: Number glitter, Rose pillar, Sparkler, Oud & musk, Multicolour
- 5 Paper Decor: Gold banner, Pompom set, Streamers, Honeycomb balls, Tassel garland
- 4 Event Packages: Pink princess, Royal blue & gold deluxe, Anniversary kit, Corporate backdrop
- 3 Accessories: Double-action pump, Gold ribbon, Gold confetti
- All with Lahore-specific descriptions, PKR pricing, realistic stock levels

## Quick Start
```bash
npm install && npm run dev
# Store: localhost:3000
# Admin: localhost:3000/admin
```

## Database Setup
Run migrations in order in Supabase SQL Editor:
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_day12_order_flow.sql
3. supabase/migrations/003_day14_products.sql
4. supabase/migrations/004_day15_storage.sql
5. supabase/migrations/005_day16_product_images.sql

## Admin Access
Visit /admin — no password (add auth in production!)

### ✅ Week 3 — Day 16: Product Photos & Image Content
- **supabase/migrations/005_day16_product_images.sql** — updates all 25 products to 2–3 Unsplash images each; category images added
- **lib/images.ts** — added `PRODUCT_IMAGES` registry, `buildImageSet()`, `getOgImageUrl()`, `IMAGE_SIZES`, `BLUR_GOLD`
- **app/page.tsx** — category cards now show real product photos with gradient overlay; fallback products have real images
- **app/products/page.tsx** — fallback products updated with real multi-image arrays
- **app/products/[slug]/page.tsx** — detail page fallbacks now have 2–3 images; OG tags use proper 1200px URLs for WhatsApp/Facebook previews
- All Unsplash URLs use `auto=format` → serves WebP automatically (70%+ smaller than JPEG on mobile)

### ✅ Week 3 — Day 15: Image Optimization
- **next.config.ts** — WebP/AVIF formats, device sizes for Pakistan mobile, 30-day cache TTL, Supabase Storage domain whitelisted
- **lib/images.ts** — blur placeholder generator (purple/teal/pink by category), Unsplash URL optimizer, Supabase Storage upload/delete helpers, thumbnail/full-size URL getters, emoji fallbacks
- **components/ProductCard.tsx** — replaced `<img>` with Next.js `<Image>` (fill, sizes, blur placeholder, hover zoom, low-stock badge, better out-of-stock overlay)
- **components/product/ImageGallery.tsx** — replaced `<img>` with Next.js `<Image>` (priority on first image for LCP, tap-to-zoom, blur placeholder, optimized thumbnails)
- **app/api/admin/upload-image/route.ts** — POST upload image to Supabase Storage + update product.images in DB; DELETE to remove image
- **app/admin/page.tsx** — ProductRow now shows thumbnail, "No image" warning, click-to-upload (📷 icon), wired to upload API
- **supabase/migrations/004_day15_storage.sql** — creates product-images storage bucket with RLS policies

## Day 15 Setup (Supabase Storage)
Run in Supabase SQL Editor:
```
supabase/migrations/004_day15_storage.sql
```
Or manually: Supabase Dashboard → Storage → New Bucket → name: `product-images` → Public: ON
