-- ============================================================
-- Happy Event Planner — Day 14 Migration
-- 20+ Real Products with Lahore-specific names + PKR prices
-- Run AFTER 001_initial_schema.sql and 002_day12_order_flow.sql
-- ============================================================

-- ─── Update orders status check to include 'packed' ──────────
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','pending_cod','confirmed','packed','shipped','delivered','cancelled'));

-- ─── Insert categories ────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('cat-bal-01-0000-000000000001', 'Balloons',       'balloons',       'Latex, foil, custom printed balloons for every event',   null),
  ('cat-can-01-0000-000000000002', 'Candles',         'candles',         'Birthday, pillar, scented and decorative candles',        null),
  ('cat-pap-01-0000-000000000003', 'Paper Decor',     'paper-decor',     'Banners, streamers, honeycomb balls, pompoms',            null),
  ('cat-pkg-01-0000-000000000004', 'Event Packages',  'event-packages',  'Complete ready-to-use birthday and event decoration kits', null),
  ('cat-acc-01-0000-000000000005', 'Accessories',     'accessories',     'Ribbon, confetti, balloon sticks, helium tanks',          null)
ON CONFLICT (slug) DO NOTHING;

-- ─── Insert 20+ products ─────────────────────────────────────
INSERT INTO products (name, slug, description, price, stock, category_id, images, status) VALUES

-- ── BALLOONS (8 products) ──────────────────────────────────────────────────
(
  'Chrome Gold Balloons — Pack of 20',
  'chrome-gold-balloons-pack-20',
  'Shiny metallic chrome gold latex balloons, 12 inch. Perfect for DHA and Gulberg birthday parties. Creates stunning arches and bouquets. Includes tie string.',
  850,
  120,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600'],
  'active'
),
(
  'Pink & Rose Gold Balloon Bouquet — 15pcs',
  'pink-rose-gold-balloon-bouquet-15',
  'Romantic pink and rose gold metallic latex balloons. 15 pieces with matching ribbon. Top choice for girls'' birthday parties and bridal showers in Lahore.',
  1200,
  80,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600'],
  'active'
),
(
  'Number Foil Balloon — Any Digit (Gold)',
  'number-foil-balloon-gold',
  'Large 40-inch gold foil number balloon. Choose any digit 0–9. Perfect for milestone birthdays — 1st, 5th, 18th, 21st, 50th. Comes flat, inflatable with air or helium.',
  650,
  200,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1547593387-c75a83089b70?w=600'],
  'active'
),
(
  'Eid Mubarak Foil Balloon Set',
  'eid-mubarak-foil-balloon-set',
  'Exclusive Eid Mubarak gold foil balloons — crescent, star, and text. Set of 5 pieces. Best seller during Eid season in Lahore. Reusable with air valve.',
  1500,
  60,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1562072049-6927099d0e8e?w=600'],
  'active'
),
(
  'White & Silver Balloon Arch Kit — 100pcs',
  'white-silver-balloon-arch-kit-100',
  'Complete balloon arch kit in white and silver. 100 latex balloons + arch strip + pump. Covers 6–8 feet. Perfect for wedding stage backdrops and corporate events in DHA.',
  2800,
  35,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600'],
  'active'
),
(
  'Heart Shaped Foil Balloons — Pack of 5',
  'heart-foil-balloons-pack-5',
  'Red and pink metallic heart foil balloons, 18 inch. Pack of 5. Valentine''s Day bestseller. Also popular for anniversaries and bridal showers. Helium compatible.',
  950,
  90,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600'],
  'active'
),
(
  'Transparent Confetti Balloons — Pack of 10',
  'transparent-confetti-balloons-10',
  'Clear latex balloons filled with gold confetti. 12 inch. Pack of 10. Creates magical floating confetti effect. Popular at Model Town and Johar Town birthday parties.',
  750,
  100,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=600'],
  'active'
),
(
  'Green & White Independence Day Balloon Set',
  'independence-day-balloon-set',
  'Pakistan flag green and white latex balloons. Pack of 30. Perfect for 14th August celebrations. Available every July–August. Order early to avoid stock-out.',
  600,
  150,
  'cat-bal-01-0000-000000000001',
  ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600'],
  'active'
),

-- ── CANDLES (5 products) ──────────────────────────────────────────────────
(
  'Birthday Number Candles — Gold Glitter (0–9)',
  'birthday-number-candles-gold-glitter',
  'Sparkling gold glitter number candles. Set includes all digits 0 to 9. 10cm tall, burns for 5 minutes. Works with all cake sizes. Safe paraffin wax, food-grade dye.',
  350,
  300,
  'cat-can-01-0000-000000000002',
  ARRAY['https://images.unsplash.com/photo-1558636508-e0969431e128?w=600'],
  'active'
),
(
  'Rose-Scented Pillar Candles — Set of 3',
  'rose-scented-pillar-candles-set-3',
  'Elegant rose-scented cream pillar candles, 3 different heights (8cm, 12cm, 16cm). Perfect centerpieces for wedding tables and mehendi events in Lahore. Burns 20–30 hrs each.',
  1100,
  50,
  'cat-can-01-0000-000000000002',
  ARRAY['https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=600'],
  'active'
),
(
  'Sparkler Birthday Candles — Pack of 10',
  'sparkler-birthday-candles-10',
  'Silver sparkling fountain candles. Pack of 10. Burns with golden sparks for 45 seconds — guaranteed to WOW at birthday parties. Safe for indoor use. Non-relighting.',
  550,
  180,
  'cat-can-01-0000-000000000002',
  ARRAY['https://images.unsplash.com/photo-1558636508-e0969431e128?w=600'],
  'active'
),
(
  'Oud & Musk Arabic Candle Set',
  'oud-musk-arabic-candle-set',
  'Luxury oud and musk scented candles in ornate glass jars. Set of 2. Inspired by Arabic traditions — popular as Eid gifts and wedding favours in Lahore. Burns 40 hrs each.',
  1800,
  40,
  'cat-can-01-0000-000000000002',
  ARRAY['https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=600'],
  'active'
),
(
  'Multicolour Birthday Candles — Pack of 24',
  'multicolour-birthday-candles-24',
  'Classic colourful birthday candles in assorted colours. Pack of 24 with holders. Perfect for kids'' birthday cakes. Cheerful, bright and affordable.',
  180,
  500,
  'cat-can-01-0000-000000000002',
  ARRAY['https://images.unsplash.com/photo-1558636508-e0969431e128?w=600'],
  'active'
),

-- ── PAPER DECOR (5 products) ──────────────────────────────────────────────
(
  'Happy Birthday Banner — Gold Glitter Foil',
  'happy-birthday-banner-gold-glitter',
  'Shimmery gold glitter "HAPPY BIRTHDAY" letter banner, 2 metres. Reusable. Comes pre-assembled on string. Works for any age. DHA and Gulberg parents'' top choice.',
  450,
  250,
  'cat-pap-01-0000-000000000003',
  ARRAY['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600'],
  'active'
),
(
  'Tissue Pompom Set — Pink, White & Gold (9 pcs)',
  'tissue-pompom-set-pink-white-gold-9',
  'Hand-crafted tissue paper pompoms in pink, white and gold. Set of 9 (3 sizes: 20cm, 25cm, 30cm). Create stunning ceiling installations. Popular for Lahore wedding halls.',
  900,
  60,
  'cat-pap-01-0000-000000000003',
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600'],
  'active'
),
(
  'Colourful Streamers — Roll of 6 (Mixed)',
  'colourful-streamers-roll-6-mixed',
  '6 crepe paper streamer rolls in assorted party colours. Each roll 30m long. Classic birthday party decoration. Instant colour for any venue.',
  250,
  400,
  'cat-pap-01-0000-000000000003',
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600'],
  'active'
),
(
  'Honeycomb Ball Decoration Set — 12 pcs',
  'honeycomb-ball-decoration-set-12',
  'Accordion-fold paper honeycomb balls in assorted colours and sizes. Set of 12. Hang from ceiling for instant festive atmosphere. Great for school events and birthday halls.',
  1100,
  45,
  'cat-pap-01-0000-000000000003',
  ARRAY['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600'],
  'active'
),
(
  'Tassel Garland — Gold & White 3 Metres',
  'tassel-garland-gold-white-3m',
  'Elegant foil tassel garland in gold and white. 3 metres long. Easy to hang. Perfect backdrop decoration for baby showers, birthdays, and Eid family gatherings.',
  380,
  170,
  'cat-pap-01-0000-000000000003',
  ARRAY['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600'],
  'active'
),

-- ── EVENT PACKAGES (4 products) ──────────────────────────────────────────
(
  'Birthday Starter Package — Pink Princess',
  'birthday-starter-package-pink-princess',
  'Complete birthday decoration kit. Includes: 20 pink balloons, Happy Birthday banner, 3 pompoms, 1 tassel garland, 10 candles, balloon pump. Covers one room. For DHA / Gulberg delivery.',
  2500,
  30,
  'cat-pkg-01-0000-000000000004',
  ARRAY['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600'],
  'active'
),
(
  'Birthday Deluxe Package — Royal Blue & Gold',
  'birthday-deluxe-package-royal-blue-gold',
  'Premium birthday decoration kit. 40 metallic balloons (blue + gold), arch strip, 2 foil number balloons, banner, 6 pompoms, streamer rolls, gold candles, confetti. For Johar Town / Bahria Town.',
  4500,
  20,
  'cat-pkg-01-0000-000000000004',
  ARRAY['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600'],
  'active'
),
(
  'Wedding Anniversary Decoration Kit',
  'wedding-anniversary-decoration-kit',
  'Romantic anniversary setup kit. Rose gold balloons (25pcs), heart foils (5), rose-scented pillar candles (3), gold banner "HAPPY ANNIVERSARY", satin ribbon. For home or restaurant setup.',
  3500,
  25,
  'cat-pkg-01-0000-000000000004',
  ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600'],
  'active'
),
(
  'Corporate Event Backdrop Kit',
  'corporate-event-backdrop-kit',
  'Professional balloon backdrop kit for office events, product launches, and award ceremonies. White, navy and gold balloons (100pcs), arch strip, branded banner space, table decor. Lahore-wide delivery.',
  8500,
  10,
  'cat-pkg-01-0000-000000000004',
  ARRAY['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600'],
  'active'
),

-- ── ACCESSORIES (3 products) ──────────────────────────────────────────────
(
  'Balloon Pump — Hand Pump (Double Action)',
  'balloon-pump-hand-double-action',
  'Durable double-action hand pump. Inflates on both push and pull. Works with all latex and foil balloons. Essential for every party setup. Saves time and energy.',
  280,
  200,
  'cat-acc-01-0000-000000000005',
  ARRAY['https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=600'],
  'active'
),
(
  'Metallic Gold Ribbon — 100 Metres',
  'metallic-gold-ribbon-100m',
  '100 metres of shimmery metallic gold curling ribbon. Perfect for balloon bouquets, gift wrapping, and event decorations. Curls easily with scissors.',
  220,
  300,
  'cat-acc-01-0000-000000000005',
  ARRAY['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600'],
  'active'
),
(
  'Gold Confetti — 100g Bag',
  'gold-confetti-100g',
  'Shimmery metallic gold star and circle confetti. 100g bag. Scatter on tables, fill balloons, or toss for photos. Popular at DHA and Gulberg birthday parties.',
  180,
  250,
  'cat-acc-01-0000-000000000005',
  ARRAY['https://images.unsplash.com/photo-1557425955-df376b5903c8?w=600'],
  'active'
)

ON CONFLICT (slug) DO UPDATE SET
  price  = EXCLUDED.price,
  stock  = EXCLUDED.stock,
  status = EXCLUDED.status;

-- ─── Verify: count what was inserted ─────────────────────────
SELECT
  c.name        AS category,
  COUNT(p.id)   AS product_count,
  SUM(p.stock)  AS total_stock,
  MIN(p.price)  AS min_price,
  MAX(p.price)  AS max_price
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.name
ORDER BY c.name;
