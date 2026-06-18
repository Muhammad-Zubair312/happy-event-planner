-- ============================================================
-- Happy Event Planner — Day 12 Migration
-- Adds missing columns to orders table + inventory deduction
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── Add missing columns to orders ───────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS delivery_zone   TEXT CHECK (delivery_zone IN ('A','B','C','D')),
  ADD COLUMN IF NOT EXISTS delivery_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes           TEXT,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- ─── Add raw_response to payments ────────────────────────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS raw_response JSONB;

-- ─── Add updated_at to products ──────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── Add order_id to inventory_log ───────────────────────────
ALTER TABLE inventory_log
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- ─── Index for fast order_number lookups ─────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at DESC);

-- ─── Auto-update updated_at on orders ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RLS: allow anon to insert orders (guest checkout) ───────
DROP POLICY IF EXISTS "orders_anon_insert" ON orders;
CREATE POLICY "orders_anon_insert"
  ON orders FOR INSERT
  WITH CHECK (true);

-- ─── RLS: allow anon to insert order_items ───────────────────
DROP POLICY IF EXISTS "order_items_anon_insert" ON order_items;
CREATE POLICY "order_items_anon_insert"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ─── RLS: allow anon to insert customers ─────────────────────
DROP POLICY IF EXISTS "customers_anon_insert" ON customers;
CREATE POLICY "customers_anon_insert"
  ON customers FOR INSERT
  WITH CHECK (true);

-- ─── RLS: allow service_role to insert payments ──────────────
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert"
  ON payments FOR INSERT
  WITH CHECK (true);

-- ─── Stock deduction function (called by API route) ──────────
-- Safely reduces stock and logs the change in inventory_log
CREATE OR REPLACE FUNCTION deduct_stock(
  p_product_id UUID,
  p_quantity    INTEGER,
  p_order_id    UUID
) RETURNS INTEGER AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock     INTEGER;
BEGIN
  SELECT stock INTO v_current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE; -- row lock

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found: %', p_product_id;
  END IF;

  v_new_stock := GREATEST(v_current_stock - p_quantity, 0);

  UPDATE products
  SET stock = v_new_stock,
      status = CASE WHEN v_new_stock = 0 THEN 'out_of_stock' ELSE status END
  WHERE id = p_product_id;

  INSERT INTO inventory_log (product_id, change, reason, new_stock, order_id)
  VALUES (p_product_id, -p_quantity, 'sale', v_new_stock, p_order_id);

  RETURN v_new_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── View: order details with customer + items ────────────────
CREATE OR REPLACE VIEW order_details AS
SELECT
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.payment_method,
  o.delivery_address,
  o.delivery_zone,
  o.delivery_fee,
  o.notes,
  o.created_at,
  o.updated_at,
  c.name    AS customer_name,
  c.phone   AS customer_phone,
  c.email   AS customer_email,
  json_agg(json_build_object(
    'product_id', oi.product_id,
    'quantity',   oi.quantity,
    'unit_price', oi.unit_price,
    'product_name', p.name
  )) AS items
FROM orders o
LEFT JOIN customers  c  ON c.id = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products   p  ON p.id = oi.product_id
GROUP BY o.id, c.name, c.phone, c.email;

-- ─── Grant view access to service_role ───────────────────────
GRANT SELECT ON order_details TO service_role;
