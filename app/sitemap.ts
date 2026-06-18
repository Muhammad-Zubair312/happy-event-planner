// app/sitemap.ts — Day 19 Enhanced Sitemap
// Next.js App Router native sitemap (no next-sitemap package needed)
// Auto-served at /sitemap.xml
//
// Priority strategy (per Google's guidance):
//   1.0  Homepage — most important
//   0.9  Products listing — high-value browse page
//   0.8  Individual product pages — Google indexes these for purchase intent queries
//   0.7  Category filter URLs — supplemental navigation
//
// lastModified: pulled from Supabase created_at per product when available.
// Falls back to static slugs with current date if DB unavailable.

import type { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/supabase';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

// ─── Static fallback slugs ────────────────────────────────────────────────────
// Used when Supabase is unavailable at build/request time
const FALLBACK_CATEGORIES = [
  'balloons',
  'candles',
  'paper-decor',
  'packages',
  'custom-orders',
  'wedding-decor',
];

const FALLBACK_PRODUCTS = [
  'chrome-gold-balloons-pack-20',
  'pink-rose-gold-balloon-bouquet-15',
  'number-glitter-birthday-candles',
  'rose-pillar-candle-set-3',
  'gold-happy-birthday-banner',
  'white-silver-balloon-arch-kit-100',
  'pink-princess-birthday-package',
  'transparent-confetti-balloons-10',
  'tissue-pompom-set-12',
  'royal-blue-gold-deluxe-package',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─── Static pages ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // ─── Category filter URLs ────────────────────────────────────────────────
  // Note: these are filter params, not separate routes — still worth indexing
  // as Google can crawl ?category=balloons and find balloon-specific pages
  let categorySlugs: string[] = FALLBACK_CATEGORIES;
  try {
    const cats = await getCategories();
    if (cats?.length) {
      categorySlugs = cats.map((c) => c.slug);
    }
  } catch {
    // DB unavailable — use fallback
  }

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/products?category=${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ─── Individual product pages ─────────────────────────────────────────────
  // With real Supabase data: uses actual created_at as lastModified
  // Tells Google how recently each product was added or updated
  let productRoutes: MetadataRoute.Sitemap;

  try {
    const products = await getProducts();
    if (products?.length) {
      productRoutes = products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.created_at ? new Date(p.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } else {
      // Supabase returned empty — use fallback slugs
      productRoutes = FALLBACK_PRODUCTS.map((slug) => ({
        url: `${SITE_URL}/products/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // DB error — use fallback slugs
    productRoutes = FALLBACK_PRODUCTS.map((slug) => ({
      url: `${SITE_URL}/products/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
