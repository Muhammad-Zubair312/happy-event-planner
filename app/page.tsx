import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Card, CardBody, ProductCardSkeleton } from '@/components/ui';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import ProductCard from '@/components/ProductCard';
import { getCategories, getProducts, type Category, type Product } from '@/lib/supabase';
import { PRODUCT_IMAGES, buildImageSet, getBlurByCategory, IMAGE_SIZES } from '@/lib/images';

// ─── Fallback content with real Unsplash images ──────────────────────────────
const FALLBACK_CATEGORIES: (Category & { icon: string })[] = [
  { id: 'c1', name: 'Balloons', slug: 'balloons', description: 'Latex, foil & balloon arches', image_url: PRODUCT_IMAGES.chromeBalloons + '?w=400&q=75&auto=format&fit=crop', created_at: '', icon: '🎈' },
  { id: 'c2', name: 'Candles', slug: 'candles', description: 'Scented, decorative & birthday candles', image_url: PRODUCT_IMAGES.birthdayCandles + '?w=400&q=75&auto=format&fit=crop', created_at: '', icon: '🕯️' },
  { id: 'c3', name: 'Paper Decor', slug: 'paper-decor', description: 'Banners, garlands & backdrops', image_url: PRODUCT_IMAGES.partyBanner + '?w=400&q=75&auto=format&fit=crop', created_at: '', icon: '🎉' },
  { id: 'c4', name: 'Event Packages', slug: 'event-packages', description: 'Complete themed event kits', image_url: PRODUCT_IMAGES.balloonArch + '?w=400&q=75&auto=format&fit=crop', created_at: '', icon: '🎁' },
  { id: 'c5', name: 'Accessories', slug: 'accessories', description: 'Ribbon, confetti & balloon pumps', image_url: PRODUCT_IMAGES.ribbon + '?w=400&q=75&auto=format&fit=crop', created_at: '', icon: '🎊' },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Chrome Gold Balloons — Pack of 20', slug: 'chrome-gold-balloons-pack-20',
    description: 'Shiny metallic chrome gold latex balloons, 12 inch. Perfect for DHA and Gulberg birthday parties.',
    price: 850, stock: 120, category_id: 'c1', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.chromeBalloons, PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.partyBanner),
  },
  {
    id: 'p2', name: 'Pink & Rose Gold Balloon Bouquet — 15pcs', slug: 'pink-rose-gold-balloon-bouquet-15',
    description: 'Romantic pink and rose gold metallic latex balloons. Top choice for girls\' birthday parties.',
    price: 1200, stock: 80, category_id: 'c1', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.pinkBalloons, PRODUCT_IMAGES.heartBalloon, PRODUCT_IMAGES.chromeBalloons),
  },
  {
    id: 'p3', name: 'Number Glitter Birthday Candles', slug: 'number-glitter-birthday-candles',
    description: 'Gold glitter number birthday candles. Any digit 0–9. Burns with a beautiful golden glow.',
    price: 350, stock: 200, category_id: 'c2', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.birthdayCandles, PRODUCT_IMAGES.scentedCandles),
  },
  {
    id: 'p4', name: 'Rose Pillar Candle Set — 3pcs', slug: 'rose-pillar-candle-set-3',
    description: 'Luxury rose-scented pillar candles. 3 sizes. Perfect for wedding tables and home decor.',
    price: 1200, stock: 50, category_id: 'c2', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.scentedCandles, PRODUCT_IMAGES.pillarCandle, PRODUCT_IMAGES.birthdayCandles),
  },
  {
    id: 'p5', name: 'Gold Happy Birthday Banner', slug: 'gold-happy-birthday-banner',
    description: 'Glittery gold letter banner, 2 meters long. Reusable. Includes string for easy hanging.',
    price: 550, stock: 150, category_id: 'c3', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.partyBanner, PRODUCT_IMAGES.partyDecor, PRODUCT_IMAGES.balloonArch),
  },
  {
    id: 'p6', name: 'White & Silver Balloon Arch Kit — 100pcs', slug: 'white-silver-balloon-arch-kit-100',
    description: 'Complete balloon arch kit in white and silver. 100 balloons + arch strip + pump.',
    price: 2800, stock: 35, category_id: 'c1', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.chromeBalloons, PRODUCT_IMAGES.partyBanner),
  },
  {
    id: 'p7', name: 'Pink Princess Birthday Package', slug: 'pink-princess-birthday-package',
    description: 'Complete pink birthday setup: 30 balloons, banner, candles, paper plates for 10 guests.',
    price: 4500, stock: 20, category_id: 'c4', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.balloonArch, PRODUCT_IMAGES.pinkBalloons, PRODUCT_IMAGES.partyDecor),
  },
  {
    id: 'p8', name: 'Transparent Confetti Balloons — Pack of 10', slug: 'transparent-confetti-balloons-10',
    description: 'Clear latex balloons filled with gold confetti. Creates magical floating effect.',
    price: 750, stock: 100, category_id: 'c1', status: 'active', created_at: '',
    images: buildImageSet(PRODUCT_IMAGES.confettiBalloon, PRODUCT_IMAGES.chromeBalloons),
  },
];

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://happyeventplanner.vercel.app';

export const metadata: Metadata = {
  title: 'Happy Event Planner Lahore | Balloons, Candles & Party Decoration',
  description:
    'Lahore\'s top event decoration store. Buy balloons, candles, paper decor & party packages. Same-day delivery to DHA, Gulberg, Johar Town. JazzCash & EasyPaisa accepted.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Happy Event Planner Lahore | Balloons, Candles & Party Decoration',
    description:
      'Lahore\'s top event decoration store. Same-day delivery to DHA, Gulberg, Johar Town. WhatsApp orders welcome.',
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Happy Event Planner Lahore' }],
  },
};

// WebSite schema — enables Google Sitelinks search box
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Happy Event Planner',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default async function HomePage() {
  let categories: (Category & { icon?: string })[] = [];
  let featuredProducts: Product[] = [];

  try {
    const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
    categories = cats?.length ? cats : FALLBACK_CATEGORIES;
    featuredProducts = prods?.length ? prods.slice(0, 8) : FALLBACK_PRODUCTS;
  } catch {
    categories = FALLBACK_CATEGORIES;
    featuredProducts = FALLBACK_PRODUCTS;
  }

  return (
    <div>
      {/* WebSite structured data for Google Sitelinks search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-soft-gradient" style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
        <div className="container" style={{ textAlign: 'center', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img
              src="/logo.svg"
              alt="Happy Event Planner"
              height={56}
              width={236}
              style={{ display: 'block' }}
            />
          </div>
          <h1 style={{ color: 'var(--color-brand-purple)', marginBottom: '0.75rem' }}>
            Balloons, Candles &amp; Decor — Delivered Across Lahore
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '600px', margin: '0 auto 1.75rem', lineHeight: 1.7 }}>
            From birthday balloon arches to wedding stage setups — browse online or
            order on WhatsApp. Enjoy <strong>free delivery</strong> to DHA, Gulberg,
            Model Town &amp; Garden Town.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button as="a" href="/products" variant="primary" size="lg">
              Browse Products
            </Button>
            <Button as="a" href="/products?category=custom-orders" variant="outline" size="lg">
              Custom Orders
            </Button>
          </div>

          {/* Mobile trust badges */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {['🚚 Same-day Delivery', '💵 Cash on Delivery', 'WhatsApp Orders'].map(badge => (
              <span key={badge} style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                background: 'rgba(255,255,255,0.8)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid with images ────────────────────────── */}
      <section className="container" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Shop by Category</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>
            Everything you need for your next event in Lahore
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.875rem',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Card>
                {cat.image_url && (
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100px',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                  }}>
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      sizes={IMAGE_SIZES.category}
                      style={{ objectFit: 'cover' }}
                      placeholder="blur"
                      blurDataURL={getBlurByCategory(cat.slug)}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)',
                    }} />
                    <span style={{
                      position: 'absolute', bottom: '0.4rem', left: '0.6rem',
                      color: '#fff', fontWeight: 700, fontSize: 'var(--text-xs)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    }}>
                      {cat.name}
                    </span>
                  </div>
                )}
                <CardBody style={{ textAlign: 'center', padding: cat.image_url ? '0.6rem 0.75rem 1rem' : '1.25rem 0.75rem' }}>
                  {!cat.image_url && (
                    <>
                      <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
                        {('icon' in cat && cat.icon) || '🎀'}
                      </div>
                      <h4 style={{ margin: '0 0 0.2rem', fontSize: 'var(--text-sm)' }}>{cat.name}</h4>
                    </>
                  )}
                  {cat.description && (
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {cat.description}
                    </p>
                  )}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────── */}
      <section className="container" style={{ padding: '0 1rem clamp(2rem, 5vw, 3.5rem)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Featured Products</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>Popular picks for Lahore events</p>
          </div>
          <Link href="/products" style={{ color: 'var(--color-brand-purple)', fontWeight: 600, fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
              gap: '0.875rem',
            }}
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '0.875rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── WhatsApp CTA banner ──────────────────────────────── */}
      <section
        className="bg-brand-gradient"
        style={{ padding: 'clamp(2rem, 5vw, 3rem) 1rem', textAlign: 'center' }}
      >
        <div className="container">
          <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Planning an Event?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-base)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Chat with us on WhatsApp for custom packages, bulk orders &amp; same-day delivery in Lahore.
          </p>
          <Button
            as="a"
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX'}?text=${encodeURIComponent('Hello! I want to plan an event with Happy Event Planner.')}`}
            target="_blank"
            variant="whatsapp"
            size="lg"
          >
            <WhatsAppIcon size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Chat on WhatsApp
          </Button>
        </div>
      </section>

      {/* ── Trust Badges ─────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-surface-soft)', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { icon: <TrustIcon type="delivery" />, title: 'Same-Day Delivery', desc: 'Order before 2 PM for evening delivery in Lahore' },
              { icon: <TrustIcon type="payment" />, title: 'Flexible Payment', desc: 'JazzCash, EasyPaisa, bank transfer or cash on delivery' },
              { icon: <TrustIcon type="whatsapp" />, title: 'WhatsApp Support', desc: 'Chat with us any time — fast replies, 7 days a week' },
              { icon: <TrustIcon type="quality" />, title: 'Quality Guaranteed', desc: 'Fresh stock, premium materials, no compromises' },
            ].map((badge) => (
              <div key={badge.title} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                gap: '0.6rem', padding: '1.25rem 1rem',
                background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: '3rem', height: '3rem',
                  background: 'var(--color-brand-purple-light)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-brand-purple)',
                }}>
                  {badge.icon}
                </div>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{badge.title}</strong>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ─────────────────────────────────────── */}
      <section className="container" style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
            Get your event decorated in 3 simple steps
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          position: 'relative',
        }}>
          {[
            { step: '1', icon: <StepIcon type="browse" />, title: 'Browse & Pick', desc: 'Choose from balloons, candles, paper decor, or let us design a custom package for your event theme.' },
            { step: '2', icon: <StepIcon type="order" />, title: 'Order on WhatsApp', desc: 'Add items to cart and checkout, or simply send us a message on WhatsApp — we\'ll confirm within minutes.' },
            { step: '3', icon: <StepIcon type="deliver" />, title: 'We Deliver', desc: 'Your decorations arrive fresh and on time, ready to set up. Free delivery across DHA, Gulberg & more.' },
          ].map((item) => (
            <div key={item.step} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem',
              padding: '2rem 1.5rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-soft)',
              borderRadius: 'var(--radius-2xl)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-1px', right: '-1px',
                background: 'var(--color-brand-purple)', color: '#fff',
                width: '2rem', height: '2rem', borderRadius: '0 var(--radius-2xl) 0 var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 'var(--text-sm)',
              }}>{item.step}</div>
              <div style={{
                width: '4rem', height: '4rem',
                background: 'linear-gradient(135deg, var(--color-brand-purple-light), var(--color-brand-teal-light))',
                borderRadius: 'var(--radius-xl)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-brand-purple)',
              }}>
                {item.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{item.title}</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Customer Reviews ─────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-surface-soft)', padding: 'clamp(2rem, 5vw, 3.5rem) 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>What Lahore Says</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <StarRow />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>4.9 out of 5 · 200+ happy customers</span>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { name: 'Ayesha R.', area: 'DHA Phase 5', text: 'Got the balloon arch kit for my daughter\'s birthday — stunning quality and delivered right on time. The chrome gold balloons were exactly as pictured. Will order again!', stars: 5 },
              { name: 'Bilal A.', area: 'Gulberg III', text: 'Ordered a custom wedding stage balloon setup. The team was super helpful on WhatsApp, guided me through the whole design. Guests couldn\'t stop complimenting it.', stars: 5 },
              { name: 'Sadia M.', area: 'Johar Town', text: 'Fast delivery, friendly staff, and beautiful products. The confetti balloons looked magical at my son\'s first birthday. Will definitely recommend to friends!', stars: 5 },
            ].map((review) => (
              <div key={review.name} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-soft)' }}>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{review.name}</strong>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>{review.area}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustIcon({ type }: { type: string }) {
  if (type === 'delivery') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
  if (type === 'payment') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
  if (type === 'whatsapp') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function StepIcon({ type }: { type: string }) {
  if (type === 'browse') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  );
  if (type === 'order') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

function StarRow() {
  return (
    <span style={{ display: 'inline-flex', gap: '0.1rem' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
    </span>
  );
}

