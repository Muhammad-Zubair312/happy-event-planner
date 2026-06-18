'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

const BASE_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Custom Orders', href: '/products?category=custom-orders' },
  { label: 'Track Order', href: '/orders' },
];

const ADMIN_LINK = { label: 'Admin', href: '/admin' };

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923054390254';

function buildWhatsAppURL() {
  const msg = "Hello! I'd like to ask about your event decoration products.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems: cartCount } = useCart();
  const router = useRouter();

  useEffect(() => {
    function readRoleFromCookie() {
      const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
      const role = match ? decodeURIComponent(match[1]) : null;
      setIsLoggedIn(!!role);
      setIsAdmin(role === 'admin');
    }
    readRoleFromCookie();
  }, []);

  const navLinks = isAdmin ? [...BASE_NAV_LINKS, ADMIN_LINK] : BASE_NAV_LINKS;

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  function handleWhatsAppClick(e: React.MouseEvent) {
    if (!isLoggedIn) {
      e.preventDefault();
      setMobileOpen(false);
      router.push('/login');
    }
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem' }}>

        {/* ✅ FIXED: removed display:'none' — CSS handles hide/show via data-mobile-only */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.5rem' }}
          data-mobile-only
        >
          <MenuIcon open={mobileOpen} />
        </button>

        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/logo.svg"
            alt="Happy Event Planner — Balloons, Candles and Decor, Lahore"
            height={52}
            width={219}
            style={{ display: 'block', flexShrink: 0 }}
          />
        </Link>

        <nav style={{ gap: '1.5rem', marginLeft: '1.5rem' }} data-desktop-only>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* ✅ FIXED: removed display:'none' from inline style — data-desktop-only CSS handles it */}
        <form
          action="/products"
          style={{ alignItems: 'center', position: 'relative', width: '260px' }}
          data-desktop-only
        >
          <input
            type="search"
            name="q"
            placeholder="Search balloons, candles..."
            className="input"
            style={{ paddingRight: '2.25rem' }}
          />
          <button
            type="submit"
            aria-label="Search"
            className="btn btn-ghost btn-sm"
            style={{ position: 'absolute', right: '0.15rem', padding: '0.4rem' }}
          >
            <SearchIcon />
          </button>
        </form>

        {/* ✅ FIXED: removed display:'none' */}
        <button
          aria-label="Search"
          onClick={() => setSearchOpen((v) => !v)}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.5rem' }}
          data-mobile-only
        >
          <SearchIcon />
        </button>

        <Link
          href="/cart"
          aria-label="Cart"
          className="btn btn-ghost btn-sm"
          style={{ position: 'relative', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <CartIcon />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }} data-desktop-only>Cart</span>
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--color-brand-purple)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                minWidth: '1.1rem',
                height: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 0.2rem',
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* ✅ FIXED: removed display:'none' from inline style */}
        <Button
          as="a"
          href={buildWhatsAppURL()}
          target="_blank"
          onClick={handleWhatsAppClick}
          variant="whatsapp"
          size="sm"
          style={{}}
          data-desktop-only
        >
          <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> WhatsApp
        </Button>

        {/* ✅ FIXED: removed display:'none' from inline style */}
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 600, padding: '0.4rem 0.75rem' }}
          data-desktop-only
        >
          Logout
        </button>
      </div>

      {searchOpen && (
        <div className="container" style={{ paddingBottom: '0.75rem' }} data-mobile-only>
          <form action="/products" style={{ position: 'relative' }}>
            <input
              type="search"
              name="q"
              placeholder="Search balloons, candles..."
              className="input"
              style={{ paddingRight: '2.25rem' }}
              autoFocus
            />
            <button
              type="submit"
              aria-label="Search"
              className="btn btn-ghost btn-sm"
              style={{ position: 'absolute', right: '0.15rem', top: '0.15rem', padding: '0.4rem' }}
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <nav
          data-mobile-only
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div className="container" style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 1rem 1rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '0.625rem 0',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-border-soft)',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Button
              as="a"
              href={buildWhatsAppURL()}
              target="_blank"
              onClick={handleWhatsAppClick}
              variant="whatsapp"
              style={{ marginTop: '1rem' }}
            >
              <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Order via WhatsApp
            </Button>
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
              style={{ marginTop: '0.75rem', textAlign: 'left', fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </nav>
      )}

      <style>{`
        [data-desktop-only] { display: none; }
        [data-mobile-only] { display: flex; }
        @media (min-width: 768px) {
          [data-desktop-only] { display: flex !important; }
          [data-mobile-only] { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M3 6h18M3 12h18M3 18h18" />
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}