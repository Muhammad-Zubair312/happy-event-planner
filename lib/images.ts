/**
 * Happy Event Planner — Image Utilities
 * Day 16: Enhanced image optimization — multi-image support, WebP conversion,
 *         optimized Unsplash URLs, responsive srcset helpers
 */

import { createServerClient } from './supabase';

// ─── Blur placeholder data URLs (base64 SVG) ─────────────────────────────────
// Used as `placeholder="blur"` blurDataURL in Next.js Image component
// Prevents layout shift while real image loads — critical for Pakistan mobile users

export const BLUR_PURPLE =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <filter id="b"><feGaussianBlur stdDeviation="20"/></filter>
      <rect width="400" height="400" fill="#EDE9FE" filter="url(#b)"/>
    </svg>`
  ).toString('base64');

export const BLUR_TEAL =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <filter id="b"><feGaussianBlur stdDeviation="20"/></filter>
      <rect width="400" height="400" fill="#CCFBF1" filter="url(#b)"/>
    </svg>`
  ).toString('base64');

export const BLUR_PINK =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <filter id="b"><feGaussianBlur stdDeviation="20"/></filter>
      <rect width="400" height="400" fill="#FCE7F3" filter="url(#b)"/>
    </svg>`
  ).toString('base64');

export const BLUR_GOLD =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <filter id="b"><feGaussianBlur stdDeviation="20"/></filter>
      <rect width="400" height="400" fill="#FEF3C7" filter="url(#b)"/>
    </svg>`
  ).toString('base64');

// Default blur for any product image
export const BLUR_DEFAULT = BLUR_PURPLE;

// ─── Pick blur color by category ─────────────────────────────────────────────
export function getBlurByCategory(categorySlug?: string | null): string {
  if (!categorySlug) return BLUR_DEFAULT;
  if (categorySlug.includes('balloon')) return BLUR_PURPLE;
  if (categorySlug.includes('candle')) return BLUR_TEAL;
  if (categorySlug.includes('paper') || categorySlug.includes('decor')) return BLUR_PINK;
  if (categorySlug.includes('package') || categorySlug.includes('event')) return BLUR_PURPLE;
  if (categorySlug.includes('accessor')) return BLUR_GOLD;
  return BLUR_DEFAULT;
}

// ─── Unsplash URL optimizer ───────────────────────────────────────────────────
// Strips old params and applies proper WebP-compatible sizing
// Unsplash supports: w, h, q, auto=format (serves WebP to browsers that support it), fit=crop
export function optimizeUnsplashUrl(
  url: string,
  { width = 800, quality = 85 }: { width?: number; quality?: number } = {}
): string {
  if (!url || !url.includes('unsplash.com')) return url;
  const base = url.split('?')[0];
  return `${base}?w=${width}&q=${quality}&auto=format&fit=crop`;
}

// ─── Supabase Storage: product image bucket ───────────────────────────────────
const BUCKET = 'product-images';

/**
 * Upload a product image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 *
 * Usage (server-side only):
 *   const url = await uploadProductImage(file, productSlug);
 */
export async function uploadProductImage(
  file: File,
  productSlug: string,
  imageIndex = 0
): Promise<string> {
  const supabase = createServerClient();

  // Build a clean filename: slug-0.webp, slug-1.webp etc.
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${productSlug}-${imageIndex}.${ext}`;
  const path = `products/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,           // overwrite if exists
      contentType: file.type,
      cacheControl: '2592000', // 30 days
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  // Get public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a product image from Supabase Storage.
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  const supabase = createServerClient();
  // Extract path from URL: .../storage/v1/object/public/product-images/products/slug-0.jpg
  const parts = publicUrl.split(`/${BUCKET}/`);
  if (parts.length < 2) return;
  const path = parts[1];
  await supabase.storage.from(BUCKET).remove([path]);
}

/**
 * Get thumbnail URL — smaller size for product card grids.
 * For Unsplash: append size params for WebP at smaller res.
 * For Supabase: return as-is (transformations need Pro plan).
 */
export function getThumbnailUrl(url: string, width = 400): string {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url, { width, quality: 75 });
  }
  return url;
}

/**
 * Get full-size URL for product detail page.
 * Higher quality for the main gallery viewer.
 */
export function getFullSizeUrl(url: string): string {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url, { width: 1200, quality: 90 });
  }
  return url;
}

/**
 * Get OG / social share image URL — square crop, medium size.
 * Used in <meta property="og:image"> tags.
 */
export function getOgImageUrl(url: string): string {
  if (!url) return '';
  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url, { width: 1200, quality: 80 });
  }
  return url;
}

/**
 * Build a sizes string for Next.js Image based on usage context.
 * Pakistan mobile traffic is 60%+, so mobile sizes are prioritized.
 */
export const IMAGE_SIZES = {
  /** Product card in a 2–4 column grid */
  card:    '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px',
  /** Main image on product detail page */
  detail:  '(max-width: 768px) 100vw, 50vw',
  /** Thumbnail strip in image gallery */
  thumb:   '72px',
  /** Category card image */
  category:'(max-width: 640px) 50vw, 200px',
  /** Hero / banner */
  hero:    '100vw',
} as const;

// ─── Category emoji fallbacks ─────────────────────────────────────────────────
export function getProductEmoji(productName: string, categorySlug?: string | null): string {
  const name = productName.toLowerCase();
  const cat = categorySlug?.toLowerCase() ?? '';

  if (name.includes('balloon') || cat.includes('balloon')) return '🎈';
  if (name.includes('candle') || cat.includes('candle')) return '🕯️';
  if (name.includes('banner') || name.includes('paper') || cat.includes('paper')) return '🎀';
  if (name.includes('package') || cat.includes('package') || cat.includes('event')) return '🎁';
  if (name.includes('wedding') || name.includes('anniversary')) return '💍';
  if (name.includes('eid') || name.includes('independence')) return '🌙';
  if (name.includes('pump')) return '💨';
  if (name.includes('ribbon') || name.includes('confetti') || cat.includes('accessor')) return '🎊';
  return '🎉';
}

// ─── Real product images (Unsplash) — used in fallback data ──────────────────
// These are the canonical Unsplash photo IDs used across the store
export const PRODUCT_IMAGES = {
  // Balloons
  chromeBalloons:    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
  pinkBalloons:      'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f',
  numberBalloon:     'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
  eidBalloon:        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce',
  balloonArch:       'https://images.unsplash.com/photo-1527529482837-4698179dc6ce',
  heartBalloon:      'https://images.unsplash.com/photo-1607344645866-009c320b63e0',
  confettiBalloon:   'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1',
  // Candles
  birthdayCandles:   'https://images.unsplash.com/photo-1587467512961-120760940315',
  scentedCandles:    'https://images.unsplash.com/photo-1557425955-df376b5903c8',
  pillarCandle:      'https://images.unsplash.com/photo-1587467512961-120760940315',
  // Paper decor
  partyBanner:       'https://images.unsplash.com/photo-1513151233558-d860c5398176',
  partyDecor:        'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
  // Accessories
  ribbon:            'https://images.unsplash.com/photo-1557425955-df376b5903c8',
} as const;

/**
 * Build an optimized multi-image array from base Unsplash URLs.
 * Used for building fallback product data with proper images.
 */
export function buildImageSet(
  primaryUrl: string,
  ...extraUrls: string[]
): string[] {
  return [primaryUrl, ...extraUrls].map(url =>
    optimizeUnsplashUrl(url, { width: 800, quality: 85 })
  );
}
