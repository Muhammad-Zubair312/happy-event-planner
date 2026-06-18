-- ============================================================
-- Happy Event Planner — Day 15 Migration
-- Supabase Storage: product-images bucket + policies
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Create product-images storage bucket ────────────────────
-- NOTE: You can also create this via Dashboard → Storage → New Bucket
-- Bucket name: product-images
-- Public bucket: YES (so product images have public URLs)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,                          -- public bucket — no auth needed to view images
  5242880,                       -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- ─── Storage RLS Policies ─────────────────────────────────────

-- Anyone can VIEW product images (public bucket)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only service_role (admin API) can UPLOAD images
DROP POLICY IF EXISTS "product_images_service_upload" ON storage.objects;
CREATE POLICY "product_images_service_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Only service_role (admin API) can UPDATE images
DROP POLICY IF EXISTS "product_images_service_update" ON storage.objects;
CREATE POLICY "product_images_service_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

-- Only service_role (admin API) can DELETE images
DROP POLICY IF EXISTS "product_images_service_delete" ON storage.objects;
CREATE POLICY "product_images_service_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- ─── Verify bucket was created ───────────────────────────────
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'product-images';
