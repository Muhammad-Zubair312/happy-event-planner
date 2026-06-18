import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts, type Product } from '@/lib/supabase';
import { PRODUCT_IMAGES, buildImageSet, getOgImageUrl } from '@/lib/images';
import ImageGallery from '@/components/product/ImageGallery';
import ProductActions from '@/components/product/ProductActions';
import ProductCard from '@/components/ProductCard';
import Badge from '@/components/ui/Badge';

export const revalidate = 60;

// ─── Fallback product for development (before real Supabase data) ──────────
const FALLBACK_PRODUCTS: Record<string, Product> = {
  'chrome-gold-balloons-pack-20': {
    id: 'p1', name: 'Chrome Gold Balloons — Pack of 20', slug: 'chrome-gold-balloons-pack-20',
    description: 'Shiny metallic chrome gold latex balloons, 12 inch — perfect for DHA and Gulberg birthday parties. Creates stunning arches and bouquets. Includes tie string.\n\n✅ 20 premium metallic chrome balloons\n✅ 12 inch size — standard for arches\n✅ Available in single or mixed color packs\n✅ Same-day delivery in DHA, Gulberg, Johar Town\n✅ Works with helium or air pump',
    price: 850, stock: 120, category_id: 'c1', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.chromeBalloons, PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.partyBanner),
    category: { id: 'c1', name: 'Balloons', slug: 'balloons', description: null, image_url: null, created_at: '' },
  },
  'white-silver-balloon-arch-kit-100': {
    id: 'p5', name: 'White & Silver Balloon Arch Kit — 100pcs', slug: 'white-silver-balloon-arch-kit-100',
    description: 'Complete balloon arch kit in white and silver. 100 latex balloons + arch strip + pump. Covers 6–8 feet. Perfect for wedding stage backdrops and corporate events in DHA.\n\n✅ 100 latex balloons — white & silver\n✅ Balloon arch strip (10 ft)\n✅ Double-action hand pump included\n✅ Assembly guide included\n✅ Perfect for wedding entrances & photo backdrops',
    price: 2800, stock: 35, category_id: 'c1', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.chromeBalloons, PRODUCT_IMAGES.partyBanner),
    category: { id: 'c1', name: 'Balloons', slug: 'balloons', description: null, image_url: null, created_at: '' },
  },
  'pink-princess-birthday-package': {
    id: 'p7', name: 'Pink Princess Birthday Package', slug: 'pink-princess-birthday-package',
    description: 'Complete pink birthday setup — everything you need for a dreamy princess party in Lahore.\n\n✅ 30 pink & rose gold latex balloons\n✅ Gold "Happy Birthday" banner (2m)\n✅ Glitter number candles (any digit)\n✅ Paper plates & cups for 10 guests\n✅ Pink table cover & confetti\n✅ Same-day delivery in DHA, Gulberg',
    price: 4500, stock: 20, category_id: 'c4', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.pinkBalloons, PRODUCT_IMAGES.partyDecor),
    category: { id: 'c4', name: 'Event Packages', slug: 'event-packages', description: null, image_url: null, created_at: '' },
  },
};

const FALLBACK_RELATED: Product[] = [
  { id: 'p8', name: 'Transparent Confetti Balloons — Pack of 10', slug: 'transparent-confetti-balloons-10', description: 'Clear latex balloons filled with gold confetti — magical floating effect.', price: 750, stock: 100, category_id: 'c1', status: 'active', created_at: '', images: buildImageSet(PRODUCT_IMAGES.confettiBalloon, PRODUCT_IMAGES.chromeBalloons) },
  { id: 'p2', name: 'Pink & Rose Gold Balloon Bouquet — 15pcs', slug: 'pink-rose-gold-balloon-bouquet-15', description: 'Romantic pink and rose gold metallic latex balloons.', price: 1200, stock: 80, category_id: 'c1', status: 'active', created_at: '', images: buildImageSet(PRODUCT_IMAGES.pinkBalloons, PRODUCT_IMAGES.heartBalloon) },
  { id: 'p5', name: 'Gold Happy Birthday Banner', slug: 'gold-happy-birthday-banner', description: 'Glittery gold letter banner, 2 meters long. Reusable.', price: 550, stock: 150, category_id: 'c3', status: 'active', created_at: '', images: buildImageSet(PRODUCT_IMAGES.partyBanner, PRODUCT_IMAGES.partyDecor) },
  { id: 'p3', name: 'Number Glitter Birthday Candles', slug: 'number-glitter-birthday-candles', description: 'Gold glitter number candles. Any digit 0–9.', price: 350, stock: 200, category_id: 'c2', status: 'active', created_at: '', images: buildImageSet(PRODUCT_IMAGES.birthdayCandles, PRODUCT_IMAGES.scentedCandles) },
];

// ─── generateMetadata for SEO ────────────────────────────────────────────────
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    product = await getProductBySlug(slug);
  } catch {
    product = FALLBACK_PRODUCTS[slug] ?? null;
  }

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = `${SITE_URL}/products/${product.slug}`;
  const ogImage = product.images?.[0] ? getOgImageUrl(product.images[0]) : `${SITE_URL}/og-default.jpg`;
  const plainDesc = product.description?.replace(/✅ /g, '').replace(/\n+/g, ' ').slice(0, 155) ?? product.name;
  const seoDesc = `${plainDesc} — Buy online. PKR ${product.price.toLocaleString()}. Same-day delivery in Lahore.`;
  const categoryName = product.category?.name ?? 'Party Supplies';

  return {
    title: `${product.name} — Buy in Lahore`,
    description: seoDesc,
    keywords: [
      product.name,
      `${product.name} Lahore`,
      `${categoryName} Lahore`,
      `buy ${categoryName.toLowerCase()} lahore`,
      'event decoration lahore',
      'birthday party supplies lahore',
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: `${product.name} | Happy Event Planner Lahore`,
      description: seoDesc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${product.name} — Happy Event Planner Lahore`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — PKR ${product.price.toLocaleString()}`,
      description: seoDesc,
      images: [ogImage],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function ProductDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let product: Product | null = null;
  let related: Product[] = [];

  try {
    product = await getProductBySlug(slug);
    if (product?.category_id) {
      related = await getRelatedProducts(product.category_id, slug, 4);
    }
  } catch {
    product = FALLBACK_PRODUCTS[slug] ?? null;
    related = FALLBACK_RELATED;
  }

  if (!product) notFound();

  const descriptionParagraphs = product.description?.split('\n\n') ?? [];

  // ─── Structured Data ───────────────────────────────────────────────────────
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/✅ /g, '').replace(/\n+/g, ' ') ?? product.name,
    image: product.images?.map((img: string) => getOgImageUrl(img)) ?? [],
    url: `${SITE_URL}/products/${product.slug}`,
    brand: { '@type': 'Brand', name: 'Happy Event Planner' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'PKR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Happy Event Planner' },
      areaServed: { '@type': 'City', name: 'Lahore' },
    },
    ...(product.category
      ? { category: product.category.name }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      ...(product.category
        ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `${SITE_URL}/products?category=${product.category.slug}` }]
        : []),
      { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.name, item: `${SITE_URL}/products/${product.slug}` },
    ],
  };

  return (
    <div style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
      {/* Product + Breadcrumb structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Breadcrumb ── */}
      <div style={{ background: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: 'var(--text-sm)' }}>
          <Link href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <Link href="/products" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Products</Link>
          {product.category && (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>›</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* ── Main product section ── */}
      <div className="container" style={{ padding: 'clamp(1rem, 3vw, 2rem) 1rem clamp(1.5rem, 4vw, 3rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 4vw, 2.5rem)',
          alignItems: 'start',
        }}>

          {/* LEFT — Image Gallery */}
          <ImageGallery
            images={product.images ?? []}
            productName={product.name}
            categorySlug={product.category?.slug ?? null}
          />

          {/* RIGHT — Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Category + badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`} style={{ textDecoration: 'none' }}>
                  <Badge variant="purple">{product.category.name}</Badge>
                </Link>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <Badge variant="warning">⚠️ Only {product.stock} left</Badge>
              )}
              {product.status === 'out_of_stock' || product.stock === 0 ? (
                <Badge variant="error">Out of Stock</Badge>
              ) : (
                <Badge variant="teal">✓ In Stock</Badge>
              )}
            </div>

            {/* Product name */}
            <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Short description (first paragraph) */}
            {descriptionParagraphs[0] && (
              <p style={{
                margin: 0,
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
              }}>
                {descriptionParagraphs[0]}
              </p>
            )}

            {/* Divider */}
            <hr className="divider" />

            {/* Actions — qty, WhatsApp, add to cart */}
            <ProductActions product={product} />
          </div>
        </div>

        {/* ── Full description section ── */}
        {descriptionParagraphs.length > 1 && (
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
          }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: 'var(--text-2xl)' }}>Product Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {descriptionParagraphs.slice(1).map((para, i) => {
                // Render bullet-point style lines nicely
                const lines = para.split('\n').filter(Boolean);
                const isBulletList = lines.every(l => l.startsWith('✅') || l.startsWith('•') || l.startsWith('-'));

                if (isBulletList) {
                  return (
                    <ul key={i} style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {lines.map((line, j) => (
                        <li key={j} style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-primary)',
                          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        }}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                    {para}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Trust badges ── */}
        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { icon: '🚚', title: 'Same-Day Delivery', desc: 'DHA, Gulberg & more' },
            { icon: '📲', title: 'WhatsApp Orders', desc: 'Instant confirmation' },
            { icon: '💰', title: 'Cash on Delivery', desc: 'Pay when you receive' },
            { icon: '🔄', title: 'Easy Returns', desc: '24-hour return policy' },
          ].map(badge => (
            <div key={badge.title} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem',
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{badge.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>{badge.title}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>You May Also Like</h2>
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`}
                  style={{ color: 'var(--color-brand-purple)', fontWeight: 600, fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
                  View all {product.category.name} →
                </Link>
              )}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
              gap: '1.25rem',
            }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
