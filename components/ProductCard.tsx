'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import type { Product } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { getThumbnailUrl, getBlurByCategory, getProductEmoji } from '@/lib/images';
import { buildWhatsAppURL } from '@/lib/whatsapp';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart, getItemQty } = useCart();
  const [flash, setFlash] = useState(false);
  const [hovered, setHovered] = useState(false);

  const rawImage   = product.images?.[0];
  const image      = rawImage ? getThumbnailUrl(rawImage, 400) : null;
  const outOfStock = product.status === 'out_of_stock' || product.stock <= 0;
  const inCart     = isInCart(product.id);
  const cartQty    = getItemQty(product.id);
  const blurUrl    = getBlurByCategory(product.category?.slug);
  const emoji      = getProductEmoji(product.name, product.category?.slug);
  const lowStock   = !outOfStock && product.stock > 0 && product.stock <= 5;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      id:       product.id,
      name:     product.name,
      slug:     product.slug,
      price:    product.price,
      image:    rawImage ?? '',
      stock:    product.stock,
      category: product.category?.name ?? '',
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ── */}
      <Link href={`/products/${product.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{
          position: 'relative',
          height: '200px',
          backgroundColor: 'var(--color-surface-muted)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        }}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
              style={{
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
              placeholder="blur"
              blurDataURL={blurUrl}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-brand-purple-light) 0%, var(--color-surface-soft) 100%)',
            }}>
              <span style={{ fontSize: '4rem' }}>{emoji}</span>
            </div>
          )}

          {/* Top-left: category badge */}
          {product.category?.name && (
            <span style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', zIndex: 1 }}>
              <Badge variant="purple">{product.category.name}</Badge>
            </span>
          )}

          {/* Top-right: low stock or cart qty */}
          {lowStock && (
            <span style={{
              position: 'absolute', top: '0.65rem', right: '0.65rem',
              background: '#F59E0B', color: '#fff',
              fontSize: '0.6rem', fontWeight: 700,
              borderRadius: 'var(--radius-full)', padding: '0.25rem 0.6rem',
              zIndex: 1, letterSpacing: '0.02em',
            }}>
              Only {product.stock} left
            </span>
          )}
          {inCart && !outOfStock && !lowStock && (
            <span style={{
              position: 'absolute', top: '0.65rem', right: '0.65rem',
              background: 'var(--color-brand-purple)', color: '#fff',
              fontSize: '0.6rem', fontWeight: 700,
              borderRadius: 'var(--radius-full)', padding: '0.25rem 0.6rem',
              zIndex: 1,
            }}>
              🛒 {cartQty} in cart
            </span>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}>
              <span style={{
                background: '#fff', color: 'var(--color-error)',
                fontWeight: 800, fontSize: 'var(--text-sm)',
                padding: '0.4rem 1.1rem', borderRadius: 'var(--radius-full)',
                letterSpacing: '0.03em',
              }}>
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Card body ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        flex: 1, padding: '1rem 1rem 1.1rem',
        gap: '0.35rem',
      }}>

        {/* Product name */}
        <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h4 style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            lineHeight: 1.35,
            color: 'var(--color-text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.name}
          </h4>
        </Link>

        {/* Description */}
        {product.description && (
          <p style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {product.description}
          </p>
        )}

        <div style={{ flex: 1, minHeight: '0.5rem' }} />

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginTop: '2px',
          }}>PKR</span>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--color-brand-purple)',
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}>
            {product.price.toLocaleString()}
          </span>
        </div>

        {/* CTA buttons */}
        {outOfStock ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '40px', borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface-muted)',
            fontSize: 'var(--text-xs)', fontWeight: 700,
            color: 'var(--color-text-muted)',
          }}>
            Out of Stock
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>

            {/* Primary: Add to Cart */}
            <button
              onClick={handleAdd}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.4rem',
                minHeight: '40px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                background: flash ? 'var(--color-success)' : undefined,
                borderColor: flash ? 'var(--color-success)' : undefined,
                transition: 'background 0.25s, border-color 0.25s',
              }}
            >
              {flash ? <CheckIcon /> : <CartBtnIcon />}
              {flash ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            {/* Secondary: WhatsApp */}
            <a
              href={buildWhatsAppURL(product)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.4rem',
                minHeight: '36px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid #25D366',
                color: '#128C4F',
                background: 'transparent',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#25D366';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#128C4F';
              }}
            >
              <WhatsAppIcon />
              Order via WhatsApp
            </a>

          </div>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function CartBtnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}