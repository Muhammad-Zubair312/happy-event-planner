import Link from 'next/link';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX';

function buildWhatsAppURL() {
  const msg = "Hello! I'd like to ask about your event decoration products.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const SHOP_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Balloons', href: '/products?category=balloons' },
  { label: 'Candles', href: '/products?category=candles' },
  { label: 'Paper Decor', href: '/products?category=paper-decor' },
  { label: 'Party Packages', href: '/products?category=packages' },
];

const HELP_LINKS = [
  { label: 'Track Your Order', href: '/track' },
  { label: 'Delivery Areas', href: '/delivery' },
  { label: 'Returns & Exchanges', href: '/returns' },
  { label: 'Custom Orders', href: '/custom-orders' },
  { label: 'Contact Us', href: '/contact' },
];

const DELIVERY_ZONES = [
  { zone: 'Free Delivery', areas: 'DHA, Gulberg, Model Town, Garden Town' },
  { zone: 'Standard Delivery — PKR 150', areas: 'Johar Town, Bahria Town, Wapda Town' },
  { zone: 'Standard Delivery — PKR 250', areas: 'Ichra, Anarkali, Samanabad, Shadman' },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: <InstagramIcon /> },
  { label: 'Facebook', href: 'https://facebook.com', icon: <FacebookIcon /> },
  { label: 'TikTok', href: 'https://tiktok.com', icon: <TikTokIcon /> },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-text-primary)', color: '#fff', marginTop: 'auto' }}>
      {/* ── Main grid ─────────────────────────────────────────── */}
      <div
        className="container"
        style={{
          padding: '3rem 1rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ marginBottom: '0.75rem' }}>
            <img src="/logo-dark.svg" alt="Happy Event Planner" height={52}
                 style={{ display: 'block', width: 'auto', maxWidth: '210px' }} />
          </div>
          <p style={{ color: '#9CA3AF', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
            Lahore&apos;s go-to store for balloons, candles, paper decor &amp; party
            accessories. Order online or via WhatsApp — fast delivery across Lahore.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h6 style={{ color: '#fff', marginBottom: '0.9rem' }}>Shop</h6>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={{ color: '#9CA3AF', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help links */}
        <div>
          <h6 style={{ color: '#fff', marginBottom: '0.9rem' }}>Help &amp; Info</h6>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={{ color: '#9CA3AF', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Delivery zones + contact */}
        <div>
          <h6 style={{ color: '#fff', marginBottom: '0.9rem' }}>Delivery Areas</h6>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DELIVERY_ZONES.map((z) => (
              <li key={z.zone} style={{ fontSize: 'var(--text-xs)', color: '#9CA3AF' }}>
                <span style={{ color: 'var(--color-brand-teal-light)', fontWeight: 700 }}>{z.zone}:</span> {z.areas}
              </li>
            ))}
          </ul>

          <a
            href={buildWhatsAppURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Chat on WhatsApp
          </a>
          <p style={{ fontSize: 'var(--text-xs)', color: '#9CA3AF', marginTop: '0.75rem' }}>
            Open daily 10am – 10pm · Lahore, Pakistan
          </p>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          className="container"
          style={{
            padding: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--text-xs)',
            color: '#9CA3AF',
          }}
        >
          <span>© {new Date().getFullYear()} Happy Event Planner. All rights reserved.</span>
          <span>Made with ♥️ in Lahore, Pakistan</span>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
    </svg>
  );
}
