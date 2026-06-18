# Day 20 Changes — End-to-End Testing

## What was built

Day 20 task from the plan: **End-to-end testing — complete order flow without payment, check all links.**

---

## Files Created

| File | Purpose |
|---|---|
| `tests/e2e.test.ts` | Full automated end-to-end test suite (zero-dependency, uses Node fetch) |
| `DAY20_CHANGES.md` | This file |

---

## How to Run the Automated Tests

### Prerequisites

1. Start the dev server in one terminal:
   ```bash
   npm run dev
   ```

2. In a second terminal, run the tests:
   ```bash
   npx tsx tests/e2e.test.ts
   ```
   Or if `tsx` isn't installed:
   ```bash
   npx ts-node tests/e2e.test.ts
   ```

3. To test against a deployed Vercel URL:
   ```bash
   TEST_BASE_URL=https://happyeventplanner.vercel.app npx tsx tests/e2e.test.ts
   ```

---

## What the Test Suite Covers

### Section 1 — Page Routes (21 tests)
Every page route is tested for HTTP 200 status and key content:
- `/` — Homepage hero, WhatsApp button, brand name
- `/products` — Product grid, PKR prices
- `/products?category=balloons` — Category filtering
- `/products?category=candles` — Category filtering
- `/products?q=chrome` — Search functionality
- `/products/chrome-gold-balloons-pack-20` — Product detail
- `/products/non-existent-slug` — 404 handling
- `/cart` — Cart page renders
- `/checkout` — Delivery areas, payment options
- `/orders` — Order lookup form
- `/admin` — Orders + Products tabs

### Section 2 — SEO & Metadata (12 tests)
- `<title>` tags contain Lahore keyword
- Meta description present on all pages
- OpenGraph og:title tags
- LocalBusiness JSON-LD schema on homepage
- Product schema on product detail pages
- `/sitemap.xml` — valid XML, contains /products URLs
- `/robots.txt` — correct user-agent, disallows /admin and /api/
- Canonical URL tags

### Section 3 — API Routes (10 tests)
Validation logic tested without a database:
- `GET /api/orders` without params → 400
- `POST /api/orders` with empty body → 400
- `POST /api/orders` with `payment_method: 'stripe'` → 400 (Stripe not available in PK)
- `POST /api/orders` with missing customer name → 400
- `POST /api/orders` with missing delivery area → 400
- `POST /api/orders` with empty items array → 400
- `POST /api/orders` with valid COD order → 200 (if DB connected) or 500 (dev without Supabase)

### Section 4 — Complete COD Order Flow (7 tests)
Full end-to-end journey simulating a real customer:
1. `/products` page loads
2. Product detail page loads with correct name and price
3. Cart page renders
4. Checkout page has all required fields
5. POST order via COD → order number returned starting `HEP-`
6. Delivery fee for Zone B (Johar Town) = PKR 150
7. Order lookup by order number works

### Section 5 — Delivery Zone Logic (13 tests)
Pure function tests — no database needed:
| Area | Zone | Fee |
|---|---|---|
| DHA | A | PKR 0 |
| Gulberg | A | PKR 0 |
| Model Town | A | PKR 0 |
| Garden Town | A | PKR 0 |
| Johar Town | B | PKR 150 |
| Bahria Town | B | PKR 150 |
| Wapda Town | B | PKR 150 |
| Ichra | C | PKR 250 |
| Anarkali | C | PKR 250 |
| Shadman | C | PKR 250 |
| Raiwind | D | PKR 350 |
| Unknown | D | PKR 350 |
| Case-insensitive (`dha phase 6`) | A | PKR 0 |

### Section 6 — WhatsApp URL Builder (5 tests)
- URL starts with `https://wa.me/`
- Contains product name (URL-encoded)
- Contains PKR price
- Includes Lahore delivery mention
- Quantity multiplied correctly in total

### Section 7 — Link Integrity (14 tests)
All critical navigation links return HTTP 200:
- All 8 category filter URLs
- Cart, Checkout, Orders, Admin
- sitemap.xml, robots.txt

### Section 8 — Mobile & Performance (7 tests)
- Homepage loads under 5 seconds
- Products page loads under 5 seconds
- Homepage HTML is substantial (SSR working, not empty)
- SSR content visible without JavaScript
- No Next.js default template text remains
- Content-Type `text/html` for page routes
- sitemap.xml Content-Type is XML

### Section 9 — Security (3 tests)
- API routes return JSON, not HTML error pages
- `.env` secret keys never appear in homepage HTML
- Admin page does not expose database credentials

---

## Manual Testing Checklist (for developer)

These items require a browser — automated tests can't cover them:

### Checkout COD Flow (browser)
- [ ] Add a product to cart from `/products`
- [ ] Cart shows item with correct quantity and price
- [ ] Navigate to `/checkout`
- [ ] Select DHA as delivery area — fee shows PKR 0 (free)
- [ ] Select Johar Town — fee updates to PKR 150
- [ ] Select "Cash on Delivery" payment
- [ ] Fill in Name, Phone, Address fields
- [ ] Submit form — order confirmation screen appears
- [ ] Order number is shown in `HEP-XXXXXX-XXX` format
- [ ] WhatsApp notification link appears on success screen
- [ ] Can track order at `/orders` using the order number

### Cart Behaviour (browser)
- [ ] Add multiple different products — cart count in header updates
- [ ] Increase/decrease quantity on cart page
- [ ] Remove single item
- [ ] Clear all items — empty cart screen shown
- [ ] Cart persists if page is refreshed (sessionStorage)

### Mobile Responsiveness (browser DevTools)
- [ ] All pages render correctly at 375px width (iPhone SE)
- [ ] Navigation hamburger menu works on mobile
- [ ] Product grid is 2 columns on mobile
- [ ] Add to Cart button is easy to tap (min 44px)
- [ ] Checkout form fields are full-width on mobile

### WhatsApp Buttons (browser)
- [ ] WhatsApp button on product card opens pre-filled message
- [ ] WhatsApp button on product detail page opens with correct product name
- [ ] Cart WhatsApp button includes all cart items
- [ ] Checkout WhatsApp fallback button available

### Admin Dashboard (browser)
- [ ] Admin page loads and shows Orders tab
- [ ] Products tab shows product list
- [ ] Order status can be updated (if DB connected)
- [ ] Clicking product shows details

---

## Test Results Format

When you run `npx tsx tests/e2e.test.ts`, you'll see output like:

```
════════════════════════════════════════════════════
  Happy Event Planner — Day 20 E2E Test Suite
  Target: http://localhost:3000
════════════════════════════════════════════════════

1. Page Routes
  ✓ Homepage (/) returns 200 (234ms)
  ✓ Homepage contains brand heading (12ms)
  ✓ Homepage has WhatsApp CTA button (8ms)
  ...

5. Delivery Zone Logic
  ✓ Zone A — DHA returns free delivery (0ms)
  ✓ Zone B — Johar Town returns PKR 150 (0ms)
  ...

════════════════════════════════════════════════════
  Test Results
════════════════════════════════════════════════════
  Passed : 72/75
  Failed : 3/75
  Avg    : 142ms per test
```

---

## Expected Results by Environment

### Dev (npm run dev, no Supabase configured)
- **Sections 1, 2, 7, 8, 9**: All pass — pages render from fallback data
- **Section 3 (API validation)**: Passes — validation runs before DB
- **Section 4 (Order flow)**: Partial — API validation passes, DB steps skip with yellow note
- **Section 5 (Zones)**: All pass — pure function, no DB
- **Section 6 (WhatsApp)**: All pass — pure function
- **Expected: ~65–70 pass, 5–10 skip/note**

### Dev (npm run dev, Supabase configured)
- **All sections**: Should pass
- **Expected: 72–75 pass**

### Production (Vercel + Supabase live)
- **All sections**: Should pass
- **Expected: 75/75 pass**

---

## What's Next (Day 21)

Soft launch on vercel.app URL — share with 10 friends/family for real feedback.

Before Day 21:
1. Run `npx tsx tests/e2e.test.ts` — fix any failures
2. Complete the manual browser checklist above
3. Test on a real Android phone (WhatsApp buttons, checkout flow)
4. Verify `/sitemap.xml` in Google Search Console
5. Push final code to GitHub → Vercel auto-deploys
