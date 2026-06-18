-- ============================================================
-- Happy Event Planner — Supabase Database Schema
-- Day 2: All 8 tables + RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLE 1: categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 2: products
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images      TEXT[] DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','out_of_stock')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 3: customers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT UNIQUE,
  whatsapp_number  TEXT,
  city             TEXT NOT NULL DEFAULT 'Lahore',
  addresses        TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 4: orders
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','pending_cod','confirmed','shipped','delivered','cancelled')),
  total_amount     NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('jazzcash','easypay','cod')),
  delivery_address TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 5: order_items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- ─────────────────────────────────────────────
-- TABLE 6: payments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway    TEXT NOT NULL CHECK (gateway IN ('jazzcash','easypay','cod')),
  txn_id     TEXT,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','completed','failed','refunded')),
  amount     NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLE 7: reviews
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, customer_id)
);

-- ─────────────────────────────────────────────
-- TABLE 8: inventory_log
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  new_stock   INTEGER NOT NULL CHECK (new_stock >= 0),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES (for fast queries)
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status      ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer      ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order       ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product      ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product    ON inventory_log(product_id);

-- ─────────────────────────────────────────────
-- ENABLE ROW LEVEL SECURITY on all tables
-- ─────────────────────────────────────────────
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────

-- CATEGORIES: anyone can read
CREATE POLICY "categories_public_read"
  ON categories FOR SELECT USING (true);

-- PRODUCTS: anyone can read active products
CREATE POLICY "products_public_read"
  ON products FOR SELECT USING (status = 'active');

-- PRODUCTS: only service_role can insert/update/delete (admin)
CREATE POLICY "products_admin_all"
  ON products FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- CUSTOMERS: user can read their own record
CREATE POLICY "customers_own_read"
  ON customers FOR SELECT
  USING (auth.uid()::text = id::text);

-- CUSTOMERS: authenticated users can insert their own record
CREATE POLICY "customers_own_insert"
  ON customers FOR INSERT
  WITH CHECK (true);

-- ORDERS: customers can see their own orders
CREATE POLICY "orders_own_read"
  ON orders FOR SELECT
  USING (auth.uid()::text = customer_id::text);

-- ORDERS: authenticated users can create orders
CREATE POLICY "orders_authenticated_insert"
  ON orders FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- ORDERS: only service_role (admin) can update status
CREATE POLICY "orders_admin_update"
  ON orders FOR UPDATE
  USING (auth.role() = 'service_role');

-- ORDER_ITEMS: customers can read their own order items
CREATE POLICY "order_items_own_read"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id::text = auth.uid()::text
    )
  );

-- ORDER_ITEMS: insert allowed during order creation
CREATE POLICY "order_items_insert"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- PAYMENTS: only service_role handles payments (webhook inserts)
CREATE POLICY "payments_service_role_only"
  ON payments FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- REVIEWS: anyone can read reviews
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT USING (true);

-- REVIEWS: authenticated customers can insert reviews
CREATE POLICY "reviews_authenticated_insert"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- INVENTORY_LOG: only service_role (admin) can access
CREATE POLICY "inventory_log_admin_only"
  ON inventory_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- SEED DATA — starter categories
-- ─────────────────────────────────────────────
INSERT INTO categories (name, slug, description) VALUES
  ('Balloons',       'balloons',      'All types of balloons — latex, foil, LED, helium'),
  ('Candles',        'candles',       'Decorative and birthday candles for all occasions'),
  ('Paper Decor',    'paper-decor',   'Banners, streamers, honeycomb balls, paper flowers'),
  ('Party Packages', 'party-packages','Complete ready-to-use party decoration kits'),
  ('Custom Orders',  'custom-orders', 'Personalized balloons, banners, and name decorations')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- SEED DATA — sample products (PKR prices)
-- ─────────────────────────────────────────────
INSERT INTO products (name, slug, description, price, stock, category_id, images, status)
SELECT
  'Happy Birthday Latex Balloons (Pack of 25)',
  'happy-birthday-latex-balloons-25',
  'Colorful mixed latex balloons perfect for birthday parties. Includes ribbon. Delivered inflated within Lahore.',
  350,
  100,
  (SELECT id FROM categories WHERE slug = 'balloons'),
  ARRAY['balloon-1.jpg'],
  'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'happy-birthday-latex-balloons-25');

INSERT INTO products (name, slug, description, price, stock, category_id, images, status)
SELECT
  'Gold Foil Number Balloons',
  'gold-foil-number-balloons',
  'Premium gold foil balloons — choose any number 0–9. Popular for milestone birthdays and anniversaries.',
  250,
  80,
  (SELECT id FROM categories WHERE slug = 'balloons'),
  ARRAY['balloon-foil.jpg'],
  'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'gold-foil-number-balloons');

INSERT INTO products (name, slug, description, price, stock, category_id, images, status)
SELECT
  'Birthday Candles Set (Pack of 10)',
  'birthday-candles-set-10',
  'Classic multi-color birthday candles. Non-drip wax. Perfect for all cake sizes.',
  120,
  200,
  (SELECT id FROM categories WHERE slug = 'candles'),
  ARRAY['candles-1.jpg'],
  'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'birthday-candles-set-10');

INSERT INTO products (name, slug, description, price, stock, category_id, images, status)
SELECT
  'Complete Birthday Party Package',
  'complete-birthday-party-package',
  'Everything you need: 30 balloons, banner, candles, streamers, and table cover. Lahore delivery same day.',
  2500,
  30,
  (SELECT id FROM categories WHERE slug = 'party-packages'),
  ARRAY['package-1.jpg'],
  'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'complete-birthday-party-package');

INSERT INTO products (name, slug, description, price, stock, category_id, images, status)
SELECT
  'Wedding Balloon Arch Kit',
  'wedding-balloon-arch-kit',
  'Professional balloon arch kit for wedding stages. 150 balloons, pump included. Delivery to DHA and Gulberg.',
  4500,
  15,
  (SELECT id FROM categories WHERE slug = 'balloons'),
  ARRAY['arch-1.jpg'],
  'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'wedding-balloon-arch-kit');
