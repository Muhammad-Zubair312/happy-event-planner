-- ============================================================
-- Happy Event Planner — Day 16 Migration
-- Image Optimization: Add multiple high-quality images per product
-- WebP auto-format + proper sizing via Unsplash URL params
-- Run AFTER 004_day15_storage.sql
-- ============================================================

-- ─── BALLOONS ─────────────────────────────────────────────────

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'chrome-gold-balloons-pack-20';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'pink-rose-gold-balloon-bouquet-15';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1547593387-c75a83089b70?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'number-foil-balloon-gold';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1562072049-6927099d0e8e?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'eid-mubarak-foil-balloon-set';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'white-silver-balloon-arch-kit-100';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'heart-foil-balloons-pack-5';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1547593387-c75a83089b70?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'transparent-confetti-balloons-10';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'independence-day-balloon-set';

-- ─── CANDLES ──────────────────────────────────────────────────

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1558636508-e0969431e128?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587467512961-120760940315?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'number-glitter-birthday-candles';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558636508-e0969431e128?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587467512961-120760940315?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'rose-pillar-candle-set-3';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1558636508-e0969431e128?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'sparkler-birthday-candles-10';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587467512961-120760940315?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558636508-e0969431e128?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'oud-musk-scented-pillar-candles';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1558636508-e0969431e128?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'multicolour-birthday-candle-pack';

-- ─── PAPER DECOR ──────────────────────────────────────────────

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'gold-happy-birthday-banner';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'tissue-pompom-set-12';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'metallic-streamers-pack-6';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'honeycomb-ball-set-6';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'tassel-garland-2m-gold';

-- ─── EVENT PACKAGES ───────────────────────────────────────────

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'pink-princess-birthday-package';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'royal-blue-gold-deluxe-package';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1602523959793-7f7a6b8e8f5a?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558636508-e0969431e128?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'anniversary-decoration-kit';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'corporate-event-backdrop-package';

-- ─── ACCESSORIES ──────────────────────────────────────────────

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'double-action-balloon-pump';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1557425955-df376b5903c8?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'gold-curling-ribbon-roll-3pcs';

UPDATE products SET images = ARRAY[
  'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=800&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=85&auto=format&fit=crop'
] WHERE slug = 'gold-confetti-3-packs';

-- ─── Also update category images ──────────────────────────────
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80&auto=format&fit=crop'
  WHERE slug = 'balloons';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1558636508-e0969431e128?w=600&q=80&auto=format&fit=crop'
  WHERE slug = 'candles';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80&auto=format&fit=crop'
  WHERE slug = 'paper-decor';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80&auto=format&fit=crop'
  WHERE slug = 'event-packages';

UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1557425955-df376b5903c8?w=600&q=80&auto=format&fit=crop'
  WHERE slug = 'accessories';

-- ─── Verify image counts ──────────────────────────────────────
SELECT
  name,
  slug,
  array_length(images, 1) AS image_count,
  images[1] AS first_image
FROM products
ORDER BY category_id, name;
