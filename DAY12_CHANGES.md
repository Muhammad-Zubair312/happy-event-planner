# Day 12 — Order Creation Flow ✅

## What was built today

### 1. `supabase/migrations/002_day12_order_flow.sql` (NEW)
Run this in Supabase SQL Editor **after** the Day 11 migration.

Adds:
- `order_number` column to `orders` table (e.g. `HEP-123456-789`)
- `delivery_zone` (A/B/C/D), `delivery_fee`, `notes`, `updated_at` to `orders`
- `raw_response JSONB` to `payments`
- `updated_at` to `products`, `order_id` to `inventory_log`
- `deduct_stock()` PostgreSQL function — atomically reduces stock + logs to inventory_log
- `order_details` view — joins orders + customers + items (useful for admin)
- `updated_at` triggers on orders and products
- RLS policies for anon guest checkout (no login required)

### 2. `app/api/orders/route.ts` (UPDATED)
Improved from Day 11:
- **5-step flow**: validate → upsert customer → create order → insert items → deduct stock → create payment record
- `validateItems()` function — type-safe cart validation
- Stock deduction via `deduct_stock()` RPC (gracefully skipped if migration not run yet)
- `GET /api/orders?phone=...` — order lookup by phone number
- `GET /api/orders?order_number=HEP-...` — lookup by order number
- Graceful fallback if new columns don't exist yet (Day 11 schema compat)

### 3. `app/orders/page.tsx` (NEW)
Customer order tracking page at `/orders`:
- Search by order number OR phone number
- Visual order progress tracker (Received → Confirmed → Packed → Shipped → Delivered)
- Status badges with colors
- WhatsApp support button pre-filled with order context

## How to run the Day 12 migration

1. Open Supabase Dashboard → SQL Editor → New Query
2. Paste contents of `supabase/migrations/002_day12_order_flow.sql`
3. Click Run
4. Done ✅

## Order number format
`HEP-{last 6 digits of timestamp}-{3 random digits}`
Example: `HEP-789234-042`
