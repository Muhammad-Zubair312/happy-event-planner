import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Card, CardBody } from '@/components/ui';
import { getCategories, getProducts, type Category, type Product } from '@/lib/supabase';
import { PRODUCT_IMAGES, buildImageSet } from '@/lib/images';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';
const PAGE_URL = `${SITE_URL}/products`;

export const metadata: Metadata = {
  title: 'All Products — Balloons, Candles & Party Decor Lahore',
  description:
    'Browse our complete range of event decoration supplies in Lahore. Balloons, candles, paper decor, party packages. Filter by category. Fast delivery to DHA, Gulberg, Johar Town.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    title: 'All Products — Balloons, Candles & Party Decor | Happy Event Planner Lahore',
    description:
      'Balloons, candles, paper decor, party packages. Fast delivery across Lahore. WhatsApp orders welcome.',
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Happy Event Planner Products Lahore' }],
  },
};

// ─── Fallback content (shown until real data is added in Supabase) ──────────
const FALLBACK_CATEGORIES: (Category & { icon?: string })[] = [
  { id: 'c1', name: 'Balloons', slug: 'balloons', description: 'Latex, foil & balloon arches', image_url: null, created_at: '', icon: '🎈' },
  { id: 'c2', name: 'Candles', slug: 'candles', description: 'Scented, decorative & birthday candles', image_url: null, created_at: '', icon: '🕯️' },
  { id: 'c3', name: 'Paper Decor', slug: 'paper-decor', description: 'Banners, garlands & backdrops', image_url: null, created_at: '', icon: '🎉' },
  { id: 'c4', name: 'Party Packages', slug: 'packages', description: 'Complete themed event kits', image_url: null, created_at: '', icon: '🎁' },
  { id: 'c5', name: 'Custom Orders', slug: 'custom-orders', description: 'Personalized banners & balloons', image_url: null, created_at: '', icon: '✨' },
  { id: 'c6', name: 'Wedding Decor', slug: 'wedding-decor', description: 'Stage, table & entrance setups', image_url: null, created_at: '', icon: '💍' },
];

const FALLBACK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Chrome Gold Balloons — Pack of 20', slug: 'chrome-gold-balloons-pack-20', description: 'Shiny metallic chrome gold latex balloons. Perfect for birthday parties in DHA & Gulberg.', price: 850, stock: 120, category_id: 'c1', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[0], images: buildImageSet(PRODUCT_IMAGES.chromeBalloons, PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.partyBanner) },
  { id: 'p2', name: 'Pink & Rose Gold Balloon Bouquet — 15pcs', slug: 'pink-rose-gold-balloon-bouquet-15', description: 'Romantic pink and rose gold metallic latex balloons — top choice for girls\'s birthday parties.', price: 1200, stock: 80, category_id: 'c1', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[0], images: buildImageSet(PRODUCT_IMAGES.pinkBalloons, PRODUCT_IMAGES.heartBalloon) },
  { id: 'p3', name: 'Number Glitter Birthday Candles', slug: 'number-glitter-birthday-candles', description: 'Gold glitter number birthday candles. Any digit 0–9. Burns with a beautiful golden glow.', price: 350, stock: 200, category_id: 'c2', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[1], images: buildImageSet(PRODUCT_IMAGES.birthdayCandles, PRODUCT_IMAGES.scentedCandles) },
  { id: 'p4', name: 'Rose Pillar Candle Set — 3pcs', slug: 'rose-pillar-candle-set-3', description: 'Luxury rose-scented pillar candles. 3 sizes. Perfect for wedding tables and home decor.', price: 1200, stock: 50, category_id: 'c2', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[1], images: buildImageSet(PRODUCT_IMAGES.scentedCandles, PRODUCT_IMAGES.pillarCandle, PRODUCT_IMAGES.birthdayCandles) },
  { id: 'p5', name: 'Gold Happy Birthday Banner', slug: 'gold-happy-birthday-banner', description: 'Glittery gold letter banner, 2 meters long. Reusable. Includes string for easy hanging.', price: 550, stock: 150, category_id: 'c3', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[2], images: buildImageSet(PRODUCT_IMAGES.partyBanner, PRODUCT_IMAGES.partyDecor) },
  { id: 'p6', name: 'White & Silver Balloon Arch Kit — 100pcs', slug: 'white-silver-balloon-arch-kit-100', description: 'Complete balloon arch kit in white and silver. 100 latex balloons + arch strip + pump.', price: 2800, stock: 35, category_id: 'c1', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[0], images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.chromeBalloons, PRODUCT_IMAGES.partyBanner) },
  { id: 'p7', name: 'Pink Princess Birthday Package', slug: 'pink-princess-birthday-package', description: 'Complete pink birthday setup: 30 balloons, banner, candles, paper plates for 10 guests.', price: 4500, stock: 20, category_id: 'c4', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[3], images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.pinkBalloons, PRODUCT_IMAGES.partyDecor) },
  { id: 'p8', name: 'Transparent Confetti Balloons — Pack of 10', slug: 'transparent-confetti-balloons-10', description: 'Clear latex balloons filled with gold confetti. Creates magical floating confetti effect.', price: 750, stock: 100, category_id: 'c1', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[0], images: buildImageSet(PRODUCT_IMAGES.confettiBalloon, PRODUCT_IMAGES.chromeBalloons) },
  { id: 'p9', name: 'Tissue Pompom Set — 12pcs', slug: 'tissue-pompom-set-12', description: 'Pastel tissue paper pompoms in 4 sizes. Gorgeous ceiling and wall decorations.', price: 650, stock: 80, category_id: 'c3', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[2], images: buildImageSet(PRODUCT_IMAGES.partyDecor, PRODUCT_IMAGES.partyBanner) },
  { id: 'p10', name: 'Royal Blue & Gold Deluxe Package', slug: 'royal-blue-gold-deluxe-package', description: 'Premium birthday package with royal blue and gold balloons, banner, and table setup.', price: 6500, stock: 15, category_id: 'c4', status: 'active', created_at: '', category: FALLBACK_CATEGORIES[3], images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.partyDecor, PRODUCT_IMAGES.partyBanner) },
];

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category: activeCategory, q: searchQuery } = await searchParams;

  let categories: (Category & { icon?: string })[] = [];
  let allProducts: Product[] = [];

  try {
    const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
    categories = cats?.length ? cats : FALLBACK_CATEGORIES;
    allProducts = prods?.length ? prods : FALLBACK_PRODUCTS;
  } catch {
    categories = FALLBACK_CATEGORIES;
    allProducts = FALLBACK_PRODUCTS;
  }

  let products = allProducts;

  if (activeCategory) {
    products = products.filter((p) => p.category?.slug === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <div className="container" style={{ padding: '2rem 1rem 3.5rem' }}>
      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>
          {activeCategoryName ? activeCategoryName : 'All Products'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          {searchQuery
            ? `Search results for "${searchQuery}" — ${products.length} item${products.length === 1 ? '' : 's'}`
            : `${products.length} item${products.length === 1 ? '' : 's'} available · Delivered across Lahore`}
        </p>
      </div>

      {/* ── Search bar (mobile-friendly) ────────────────────── */}
      <form action="/products" style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '420px' }}>
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search balloons, candles, decor..."
          className="input"
        />
      </form>

      {/* ── Category filter pills ───────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <CategoryPill
          href={searchQuery ? `/products?q=${encodeURIComponent(searchQuery)}` : '/products'}
          active={!activeCategory}
        >
          All
        </CategoryPill>
        {categories.map((cat) => (
          <CategoryPill
            key={cat.slug}
            href={`/products?category=${cat.slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
            active={activeCategory === cat.slug}
          >
            {'icon' in cat && cat.icon ? `${cat.icon} ` : ''}
            {cat.name}
          </CategoryPill>
        ))}
      </div>

      {/* ── Product grid ─────────────────────────────────────── */}
      {products.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
            gap: '0.875rem',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Try a different category or search term — or message us on WhatsApp for
              custom requests.
            </p>
            <Link href="/products" className="btn btn-outline btn-sm">
              Clear filters
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function CategoryPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={active ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
      style={{ borderRadius: 'var(--radius-full)' }}
    >
      {children}
    </Link>
  );
}
