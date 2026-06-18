'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX';

function buildCartWhatsAppURL(items: { name: string; quantity: number; price: number }[]): string {
  const lines = items.map(i =>
    `• ${i.name} x${i.quantity} = PKR ${(i.price * i.quantity).toLocaleString()}`
  ).join('\n');
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const msg =
    `Hello! I want to place an order:\n\n${lines}\n\n` +
    `Total: PKR ${total.toLocaleString()}\n\n` +
    `Please confirm availability and delivery to Lahore.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function CartPage() {
  const { items, totalItems, totalPrice, removeItem, updateQty, clearCart } = useCart();

  const isEmpty = items.length === 0;

  // ── Empty cart ──────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
          Browse our products and add something for your next Lahore event!
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/products" className="btn btn-primary btn-lg">Browse Products</Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello! I need help choosing products for my event.')}`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-whatsapp btn-lg"
          ><WhatsAppIcon size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Ask on WhatsApp</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface-soft)', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* Header bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>🛒 Your Cart</h1>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              {totalItems} item{totalItems !== 1 ? 's' : ''} · PKR {totalPrice.toLocaleString()}
            </p>
          </div>
          <button onClick={clearCart} className="btn btn-ghost btn-sm"
            style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>
            🗑 Clear
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '1rem' }}>
        {/* Cart layout — stacks on mobile, side-by-side on desktop */}
        <div className="cart-layout">

          {/* ── LEFT: Cart Items ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: '#fff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '0.875rem',
                display: 'flex',
                gap: '0.875rem',
                alignItems: 'flex-start',
              }}>
                {/* Thumbnail */}
                <Link href={`/products/${item.slug}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '76px', height: '76px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {item.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '1.75rem' }}>🎈</span>
                    }
                  </div>
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h4 style={{ margin: '0 0 0.15rem', fontSize: 'var(--text-sm)', lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                  </Link>
                  {item.category && (
                    <p style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {item.category}
                    </p>
                  )}

                  {/* Price + qty controls row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>

                    {/* Quantity controls — large tap targets */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        aria-label="Decrease"
                        style={{
                          width: '36px', height: '36px',
                          border: '1.5px solid var(--color-border)', borderRight: 'none',
                          borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                          background: item.quantity <= 1 ? 'var(--color-surface-muted)' : '#fff',
                          cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-text-primary)',
                          touchAction: 'manipulation',
                        }}>−</button>
                      <div style={{
                        width: '40px', height: '36px',
                        border: '1.5px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 'var(--text-sm)',
                      }}>{item.quantity}</div>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase"
                        style={{
                          width: '36px', height: '36px',
                          border: '1.5px solid var(--color-border)', borderLeft: 'none',
                          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                          background: item.quantity >= item.stock ? 'var(--color-surface-muted)' : '#fff',
                          cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                          fontSize: '1.1rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--color-text-primary)',
                          touchAction: 'manipulation',
                        }}>+</button>
                    </div>

                    {/* Line price + remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-brand-purple)' }}>
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--color-error)', fontSize: '1rem',
                          width: '32px', height: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 'var(--radius-md)',
                          touchAction: 'manipulation',
                        }}
                        title="Remove item">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link href="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: 'var(--color-brand-purple)', fontWeight: 600,
              fontSize: 'var(--text-sm)', textDecoration: 'none', padding: '0.5rem 0',
            }}>
              ← Continue Shopping
            </Link>
          </div>

          {/* ── RIGHT: Order Summary (shown below items on mobile, beside on desktop) ── */}
          <div className="cart-summary">
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.25rem',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: 'var(--text-lg)' }}>Order Summary</h3>

              {/* Item breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal ({totalItems} items)</span>
                <span style={{ fontWeight: 600 }}>PKR {totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Delivery</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>At checkout</span>
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-brand-purple)' }}>
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href={buildCartWhatsAppURL(items)}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                  style={{ justifyContent: 'center' }}
                >
                  <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Order via WhatsApp
                </a>
                <Link href="/checkout" className="btn btn-primary btn-lg"
                  style={{ justifyContent: 'center' }}>
                  Proceed to Checkout →
                </Link>
              </div>

              {/* Trust notes */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {['💰 Cash on Delivery available', '🚚 Same-day delivery in Lahore', '🔄 Easy 24-hour returns'].map(t => (
                  <p key={t} style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t}</p>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile sticky checkout bar — replaces the sidebar on small screens ── */}
      <div className="mobile-checkout-bar safe-bottom">
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{totalItems} items</p>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-brand-purple)' }}>
            PKR {totalPrice.toLocaleString()}
          </p>
        </div>
        <a
          href={buildCartWhatsAppURL(items)}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-whatsapp btn-sm"
        ><WhatsAppIcon size={16} style={{ verticalAlign: 'middle' }} /> WA</a>
        <Link href="/checkout" className="btn btn-primary">
          Checkout →
        </Link>
      </div>

      <style>{`
        /* Cart grid: single column on mobile, 2-col on desktop */
        .cart-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .cart-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
            gap: 1.5rem;
            align-items: start;
          }
          .cart-summary > div {
            position: sticky;
            top: 80px;
          }
          .mobile-checkout-bar { display: none !important; }
          body { padding-bottom: 0 !important; }
        }

        /* Mobile sticky bar */
        .mobile-checkout-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #fff;
          border-top: 1px solid var(--color-border);
          padding: 0.75rem 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          z-index: 50;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}
