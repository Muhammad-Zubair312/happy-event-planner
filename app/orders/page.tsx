'use client';

import { useState } from 'react';
import Link from 'next/link';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

// Status badge colors
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:      { label: 'Pending',      color: '#92400E', bg: '#FEF3C7', icon: '⏳' },
  pending_cod:  { label: 'Awaiting COD', color: '#92400E', bg: '#FEF3C7', icon: '📦' },
  confirmed:    { label: 'Confirmed',    color: '#065F46', bg: '#D1FAE5', icon: '✅' },
  packed:       { label: 'Packed',       color: '#1E40AF', bg: '#DBEAFE', icon: '📦' },
  shipped:      { label: 'Shipped',      color: '#6D28D9', bg: '#EDE9FE', icon: '🚚' },
  delivered:    { label: 'Delivered',    color: '#065F46', bg: '#D1FAE5', icon: '🎉' },
  cancelled:    { label: 'Cancelled',    color: '#991B1B', bg: '#FEE2E2', icon: '❌' },
};

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  delivery_fee: number;
}

export default function OrderTrackingPage() {
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() && !orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrders([]);
    setSingleOrder(null);

    try {
      const params = new URLSearchParams();
      if (orderNumber.trim()) params.set('order_number', orderNumber.trim().toUpperCase());
      else params.set('phone', phone.trim());

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not find orders.');

      if (data.order) setSingleOrder(data.order);
      else setOrders(data.orders || []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function OrderCard({ order }: { order: Order }) {
    const status = STATUS_CONFIG[order.status] ?? {
      label: order.status, color: '#6B7280', bg: '#F3F4F6', icon: '•'
    };

    return (
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
      }}>
        {/* Order number + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              ORDER NUMBER
            </p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-brand-purple)' }}>
              {order.order_number || order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.35rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            background: status.bg, color: status.color,
            fontWeight: 700, fontSize: 'var(--text-xs)',
          }}>
            {status.icon} {status.label}
          </span>
        </div>

        {/* Details row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.75rem',
          background: 'var(--color-surface-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.875rem',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Total</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm)' }}>
              PKR {order.total_amount?.toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Payment</p>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
              {order.payment_method === 'cod' ? '💵 COD' : order.payment_method === 'jazzcash' ? '📲 JazzCash' : '💳 EasyPaisa'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Placed</p>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              {order.created_at ? formatDate(order.created_at) : '—'}
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <OrderProgress status={order.status} />

        {/* WhatsApp support */}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX'}?text=${encodeURIComponent(
            `Hi! I want to check on my order ${order.order_number || order.id.slice(0,8).toUpperCase()}. Status shows: ${status.label}`
          )}`}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-whatsapp btn-sm"
          style={{ alignSelf: 'flex-start' }}
        >
          <WhatsAppIcon size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Ask about this order on WhatsApp
        </a>
      </div>
    );
  }

  function OrderProgress({ status }: { status: string }) {
    const steps = ['pending_cod', 'confirmed', 'packed', 'shipped', 'delivered'];
    // Map pending → pending_cod for display
    const normalised = status === 'pending' ? 'pending_cod' : status;
    const currentIdx = steps.indexOf(normalised);
    if (status === 'cancelled') {
      return (
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-error)', fontWeight: 600 }}>
          ❌ This order was cancelled. Please contact us on WhatsApp for help.
        </p>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          const icons = ['📋', '✅', '📦', '🚚', '🎉'];
          const labels = ['Received', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: active ? '2.2rem' : '1.75rem',
                  height: active ? '2.2rem' : '1.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: done ? 'var(--color-brand-purple)' : 'var(--color-surface-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: active ? '1rem' : '0.8rem',
                  transition: 'all 0.3s',
                  boxShadow: active ? '0 0 0 3px var(--color-brand-purple-light)' : 'none',
                }}>
                  {icons[i]}
                </div>
                <span style={{
                  fontSize: '0.6rem', fontWeight: done ? 700 : 400,
                  color: done ? 'var(--color-brand-purple)' : 'var(--color-text-muted)',
                  marginTop: '0.2rem', textAlign: 'center',
                }}>
                  {labels[i]}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  height: '2px', flex: 1,
                  background: i < currentIdx ? 'var(--color-brand-purple)' : 'var(--color-border)',
                  marginBottom: '1rem',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface-soft)', minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--color-brand-purple)', fontWeight: 600, fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
            ← Home
          </Link>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', flex: 1, textAlign: 'center' }}>
            📦 Track Your Order
          </h1>
          <div style={{ width: '3rem' }} />
        </div>
      </div>

      <div className="container-sm" style={{ padding: '2rem 1rem' }}>

        {/* Search form */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: 'var(--text-xl)' }}>Find your order</h2>
          <p style={{ margin: '0 0 1.25rem', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Enter your order number (e.g. HEP-123456-789) or the phone number you used at checkout.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="order-number">Order Number</label>
              <input
                id="order-number"
                type="text"
                className="input"
                placeholder="HEP-123456-789"
                value={orderNumber}
                onChange={e => { setOrderNumber(e.target.value); setPhone(''); }}
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>OR</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
            </div>

            <div>
              <label className="label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="input"
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={e => { setPhone(e.target.value); setOrderNumber(''); }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!phone.trim() && !orderNumber.trim())}
              style={{ justifyContent: 'center' }}
            >
              {loading ? 'Searching…' : '🔍 Track Order'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--color-error-light)', border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.25rem',
            color: 'var(--color-error)', fontSize: 'var(--text-sm)',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {singleOrder ? (
              <OrderCard order={singleOrder} />
            ) : orders.length > 0 ? (
              <>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Found {orders.length} order{orders.length !== 1 ? 's' : ''}
                </p>
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
              </>
            ) : (
              <div style={{
                background: '#fff', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)', padding: '2.5rem',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '2.5rem', margin: '0 0 0.75rem' }}>🔍</p>
                <h3 style={{ margin: '0 0 0.5rem' }}>No orders found</h3>
                <p style={{ margin: '0 0 1.5rem', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  No orders found for that number. Check the number and try again, or contact us on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/923XXXXXXXXX?text=${encodeURIComponent('Hi! I need help finding my order.')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <WhatsAppIcon size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Contact Us on WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        {!searched && (
          <div style={{
            background: 'var(--color-brand-purple-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-brand-purple)' }}>
              💡 Where to find your order number?
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-brand-purple)' }}>
              Your order number (e.g. HEP-123456-789) was shown on the confirmation screen after placing your order. You can also use the phone number you entered at checkout.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
