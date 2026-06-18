'use client';
import { useState } from 'react';
import type { Product } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX';

function buildWhatsAppURL(product: Product, qty: number): string {
  const msg =
    `Hello! I want to order:\n\n` +
    `Product: ${product.name}\n` +
    `Quantity: ${qty}\n` +
    `Price: PKR ${(product.price * qty).toLocaleString()}\n\n` +
    `Please confirm availability and delivery to Lahore.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function ProductActions({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, isInCart, getItemQty } = useCart();

  const outOfStock = product.status === 'out_of_stock' || product.stock <= 0;
  const maxQty     = Math.min(product.stock, 20);
  const totalPrice = product.price * qty;
  const inCart     = isInCart(product.id);
  const cartQty    = getItemQty(product.id);

  function handleAddToCart() {
    addItem({
      id:       product.id,
      name:     product.name,
      slug:     product.slug,
      price:    product.price,
      image:    product.images?.[0] ?? '',
      stock:    product.stock,
      category: product.category?.name ?? '',
    });
    // Add qty times if qty > 1
    for (let i = 1; i < qty; i++) {
      addItem({
        id:       product.id,
        name:     product.name,
        slug:     product.slug,
        price:    product.price,
        image:    product.images?.[0] ?? '',
        stock:    product.stock,
        category: product.category?.name ?? '',
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Price ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-brand-purple)' }}>
          PKR {totalPrice.toLocaleString()}
        </span>
        {qty > 1 && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            (PKR {product.price.toLocaleString()} each)
          </span>
        )}
      </div>

      {/* ── Stock status ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-sm)', fontWeight: 600,
          background: outOfStock ? 'var(--color-error-light)' : product.stock <= 5 ? 'var(--color-warning-light)' : 'var(--color-success-light)',
          color: outOfStock ? 'var(--color-error)' : product.stock <= 5 ? 'var(--color-warning)' : 'var(--color-success)',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block',
            background: outOfStock ? 'var(--color-error)' : product.stock <= 5 ? 'var(--color-warning)' : 'var(--color-success)',
          }} />
          {outOfStock ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `In Stock (${product.stock} available)`}
        </span>
        {inCart && !outOfStock && (
          <span style={{
            fontSize: 'var(--text-xs)', color: 'var(--color-brand-purple)',
            fontWeight: 600, padding: '0.3rem 0.6rem',
            background: 'var(--color-brand-purple-light)',
            borderRadius: 'var(--radius-full)',
          }}>
            🛒 {cartQty} in cart
          </span>
        )}
      </div>

      {!outOfStock && (
        <>
          {/* ── Quantity selector ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Quantity
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { label: '−', action: () => setQty(q => Math.max(1, q - 1)), disabled: qty <= 1,    radius: 'var(--radius-lg) 0 0 var(--radius-lg)', border: '1.5px solid var(--color-border)', borderRight: 'none' },
              ].map(btn => null)}
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                aria-label="Decrease" style={{
                  width: '40px', height: '40px',
                  border: '1.5px solid var(--color-border)', borderRight: 'none',
                  borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
                  background: qty <= 1 ? 'var(--color-surface-muted)' : '#fff',
                  cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>−</button>
              <div style={{
                width: '52px', height: '40px',
                border: '1.5px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)',
              }}>{qty}</div>
              <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}
                aria-label="Increase" style={{
                  width: '40px', height: '40px',
                  border: '1.5px solid var(--color-border)', borderLeft: 'none',
                  borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
                  background: qty >= maxQty ? 'var(--color-surface-muted)' : '#fff',
                  cursor: qty >= maxQty ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>+</button>
            </div>
          </div>

          {/* ── Buttons ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href={buildWhatsAppURL(product, qty)} target="_blank" rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg" style={{ justifyContent: 'center' }}>
              <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Order via WhatsApp — PKR {totalPrice.toLocaleString()}
            </a>
            <button onClick={handleAddToCart} className="btn btn-primary btn-lg"
              style={{ justifyContent: 'center', background: added ? 'var(--color-success)' : undefined, borderColor: added ? 'var(--color-success)' : undefined }}>
              {added ? '✓ Added to Cart!' : inCart ? `🛒 Add More (${cartQty} in cart)` : '🛒 Add to Cart'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              💬 WhatsApp:{' '}
              <a href={`tel:+${WHATSAPP_NUMBER}`} style={{ color: 'var(--color-brand-purple)', fontWeight: 600 }}>
                +{WHATSAPP_NUMBER}
              </a>
            </p>
          </div>
        </>
      )}

      {outOfStock && (
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}" — when will it be back in stock?`)}`}
          target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg"
          style={{ justifyContent: 'center' }}>
          <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Ask About Restock on WhatsApp
        </a>
      )}

      {/* ── Delivery info ── */}
      <div style={{
        background: 'var(--color-surface-soft)', border: '1px solid var(--color-border-soft)',
        borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>🚚 Delivery Information</p>
        {[
          { area: 'DHA, Gulberg, Model Town, Garden Town', fee: 'FREE',    color: 'var(--color-success)' },
          { area: 'Johar Town, Bahria Town, Wapda Town',  fee: 'PKR 150', color: 'var(--color-text-secondary)' },
          { area: 'Ichra, Anarkali, Samanabad, Shadman',  fee: 'PKR 250', color: 'var(--color-text-secondary)' },
        ].map(z => (
          <div key={z.area} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>📍 {z.area}</span>
            <span style={{ fontWeight: 700, color: z.color }}>{z.fee}</span>
          </div>
        ))}
        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          ⚡ Same-day delivery via Bykea · Order before 6pm
        </p>
      </div>
    </div>
  );
}
