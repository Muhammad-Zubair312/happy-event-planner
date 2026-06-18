// app/products/[slug]/opengraph-image.tsx
// Dynamic OG image per product — auto-served at /products/{slug}/opengraph-image
//
// When a customer shares a product link on WhatsApp, this generates a
// 1200×630 branded image showing:
//   - Product name
//   - Price in PKR
//   - Category badge
//   - Happy Event Planner branding
//
// No external API needed — rendered server-side by Next.js using @vercel/og

import { ImageResponse } from 'next/og';
import { getProductBySlug } from '@/lib/supabase';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ─── Fallback product data keyed by slug ─────────────────────────────────────
// Used when Supabase is unavailable (build time, edge cold start)
const FALLBACK: Record<string, { name: string; price: number; category: string; emoji: string }> = {
  'chrome-gold-balloons-pack-20':        { name: 'Chrome Gold Balloons — Pack of 20',       price: 850,  category: 'Balloons',       emoji: '🎈' },
  'pink-rose-gold-balloon-bouquet-15':   { name: 'Pink & Rose Gold Balloon Bouquet — 15pcs', price: 1200, category: 'Balloons',       emoji: '🎈' },
  'number-glitter-birthday-candles':     { name: 'Number Glitter Birthday Candles',           price: 350,  category: 'Candles',        emoji: '🕯️' },
  'rose-pillar-candle-set-3':            { name: 'Rose Pillar Candle Set — 3pcs',            price: 1200, category: 'Candles',        emoji: '🕯️' },
  'gold-happy-birthday-banner':          { name: 'Gold Happy Birthday Banner',               price: 550,  category: 'Paper Decor',    emoji: '🎀' },
  'white-silver-balloon-arch-kit-100':   { name: 'White & Silver Balloon Arch Kit — 100pcs', price: 2800, category: 'Balloons',       emoji: '🎈' },
  'pink-princess-birthday-package':      { name: 'Pink Princess Birthday Package',           price: 4500, category: 'Event Packages', emoji: '🎁' },
  'transparent-confetti-balloons-10':    { name: 'Transparent Confetti Balloons — Pack of 10', price: 750, category: 'Balloons',      emoji: '🎈' },
  'tissue-pompom-set-12':                { name: 'Tissue Pompom Set — 12pcs',                price: 650,  category: 'Paper Decor',    emoji: '🎉' },
  'royal-blue-gold-deluxe-package':      { name: 'Royal Blue & Gold Deluxe Package',         price: 6500, category: 'Event Packages', emoji: '🎁' },
};

// ─── Category → gradient mapping ─────────────────────────────────────────────
function getCategoryGradient(category: string): [string, string] {
  const c = category.toLowerCase();
  if (c.includes('balloon'))  return ['#4c1d95', '#7c3aed'];
  if (c.includes('candle'))   return ['#134e4a', '#0d9488'];
  if (c.includes('paper'))    return ['#831843', '#db2777'];
  if (c.includes('package'))  return ['#1e3a8a', '#2563eb'];
  if (c.includes('wedding'))  return ['#701a75', '#a21caf'];
  return ['#4c1d95', '#0d9488']; // brand default
}

// ─── Generate function ────────────────────────────────────────────────────────
export default async function ProductOgImage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try Supabase first, fall back to static data
  let name = 'Product';
  let price = 0;
  let category = 'Happy Event Planner';
  let emoji = '🎉';

  try {
    const product = await getProductBySlug(slug);
    if (product) {
      name     = product.name;
      price    = product.price;
      category = product.category?.name ?? 'Party Supplies';
      // Pick emoji by category
      const cat = product.category?.slug ?? '';
      if (cat.includes('balloon'))  emoji = '🎈';
      else if (cat.includes('candle'))  emoji = '🕯️';
      else if (cat.includes('paper'))   emoji = '🎀';
      else if (cat.includes('package')) emoji = '🎁';
      else if (cat.includes('wedding')) emoji = '💍';
      else emoji = '🎉';
    }
  } catch {
    // Use fallback
    const fb = FALLBACK[slug];
    if (fb) { name = fb.name; price = fb.price; category = fb.category; emoji = fb.emoji; }
  }

  const [gradStart, gradEnd] = getCategoryGradient(category);
  const formattedPrice = `PKR ${price.toLocaleString('en-PK')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`,
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }} />

        {/* Store logo area — top left */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '52px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '32px', display: 'flex' }}>🎊</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px', display: 'flex' }}>
            Happy Event Planner
          </div>
        </div>

        {/* Category badge — top right */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '52px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '100px',
            padding: '8px 20px',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{emoji}</span>
          <span>{category}</span>
        </div>

        {/* Main content — centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '0 52px',
            flex: 1,
            paddingTop: '80px',
          }}
        >
          {/* Product name — wraps for long names */}
          <div
            style={{
              fontSize: name.length > 50 ? '52px' : '60px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '32px',
              display: 'flex',
              maxWidth: '900px',
            }}
          >
            {name}
          </div>

          {/* Price + CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Price badge */}
            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.35)',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '42px',
                fontWeight: 800,
                color: '#ffffff',
                display: 'flex',
              }}
            >
              {formattedPrice}
            </div>

            {/* Divider dot */}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'flex' }} />

            {/* WhatsApp order CTA */}
            <div
              style={{
                background: '#25D366',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '28px',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span>💬</span>
              <span>Order on WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            height: '56px',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 52px',
          }}
        >
          <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '24px' }}>
            <span>🚀 Same-Day Delivery Lahore</span>
            <span>·</span>
            <span>📦 Cash on Delivery</span>
            <span>·</span>
            <span>💳 JazzCash / EasyPaisa</span>
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
            happyeventplanner.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
