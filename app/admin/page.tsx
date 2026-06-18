'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'pending' | 'pending_cod' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface AdminOrder {
  id: string;
  order_number: string | null;
  status: OrderStatus;
  total_amount: number;
  payment_method: string;
  delivery_address: string;
  delivery_zone: string | null;
  delivery_fee: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  items: Array<{
    product_id: string;
    product_name: string | null;
    quantity: number;
    unit_price: number;
  }> | null;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category_id: string | null;
  images: string[];
  created_at: string;
  category?: { name: string } | null;
}

type AdminTab = 'orders' | 'products';
type OrderFilter = 'all' | OrderStatus;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; next?: OrderStatus[] }> = {
  pending:     { label: 'Pending',      color: '#92400E', bg: '#FEF3C7', icon: '⏳', next: ['confirmed', 'cancelled'] },
  pending_cod: { label: 'Pending COD',  color: '#92400E', bg: '#FEF3C7', icon: '📦', next: ['confirmed', 'cancelled'] },
  confirmed:   { label: 'Confirmed',    color: '#065F46', bg: '#D1FAE5', icon: '✅', next: ['packed', 'cancelled'] },
  packed:      { label: 'Packed',       color: '#1E40AF', bg: '#DBEAFE', icon: '📦', next: ['shipped'] },
  shipped:     { label: 'Shipped',      color: '#6D28D9', bg: '#EDE9FE', icon: '🚚', next: ['delivered'] },
  delivered:   { label: 'Delivered',    color: '#065F46', bg: '#D1FAE5', icon: '🎉', next: [] },
  cancelled:   { label: 'Cancelled',    color: '#991B1B', bg: '#FEE2E2', icon: '❌', next: [] },
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: '💵 COD',
  jazzcash: '📲 JazzCash',
  easypay: '💳 EasyPaisa',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? { label: status, color: '#6B7280', bg: '#F3F4F6', icon: '•' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      background: s.bg, color: s.color,
      fontWeight: 700, fontSize: 'var(--text-xs)',
      whiteSpace: 'nowrap',
    }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--color-border)',
      padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDrawer({
  order, onClose, onStatusUpdate,
}: {
  order: AdminOrder;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const status = STATUS_CONFIG[order.status];
  const nextStatuses = status?.next ?? [];

  const parsed = (() => {
    try { return JSON.parse(order.delivery_address); } catch { return null; }
  })();

  async function handleStatusChange(newStatus: OrderStatus) {
    setUpdating(true);
    await onStatusUpdate(order.id, newStatus);
    setUpdating(false);
  }

  const subtotal = order.items?.reduce((s, i) => s + (i.unit_price ?? 0) * (i.quantity ?? 1), 0) ?? 0;
  const whatsappMsg = encodeURIComponent(
    `Hi ${order.customer_name}! Your Happy Event Planner order ${order.order_number ?? order.id.slice(0, 8).toUpperCase()} has been updated. Status: ${status?.label ?? order.status}. Questions? Reply here.`
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 100, backdropFilter: 'blur(2px)',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(480px, 100vw)',
        background: '#fff',
        zIndex: 101,
        overflowY: 'auto',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Drawer header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>ORDER</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-brand-purple)' }}>
              {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge status={order.status} />
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.25rem', color: 'var(--color-text-muted)', padding: '0.25rem',
            }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>

          {/* Status update buttons */}
          {nextStatuses.length > 0 && (
            <div style={{
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}>
              <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                Update Status
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {nextStatuses.map(s => {
                  const sc = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updating}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${sc.color}`,
                        background: updating ? 'var(--color-surface-soft)' : sc.bg,
                        color: sc.color,
                        fontWeight: 700,
                        fontSize: 'var(--text-sm)',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        opacity: updating ? 0.6 : 1,
                        transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                      }}
                    >
                      {sc.icon} Mark {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer info */}
          <section style={{
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>👤 Customer</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: 'var(--text-sm)' }}>
              <div><strong>Name:</strong> {order.customer_name ?? '—'}</div>
              <div>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--color-brand-purple)' }}>
                  {order.customer_phone ?? '—'}
                </a>
              </div>
              {order.customer_email && <div><strong>Email:</strong> {order.customer_email}</div>}
            </div>
            {/* WhatsApp contact */}
            {order.customer_phone && (
              <a
                href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${whatsappMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ marginTop: '0.75rem', display: 'inline-flex' }}
              >
                <WhatsAppIcon size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> WhatsApp Customer
              </a>
            )}
          </section>

          {/* Delivery info */}
          <section style={{
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>🚚 Delivery</p>
            <div style={{ fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {parsed ? (
                <>
                  <div><strong>Area:</strong> {parsed.area}, Lahore</div>
                  <div><strong>Address:</strong> {parsed.full_address}</div>
                </>
              ) : (
                <div>{order.delivery_address}</div>
              )}
              <div>
                <strong>Zone:</strong> {order.delivery_zone ?? '—'} &nbsp;|&nbsp;
                <strong>Fee:</strong>{' '}
                <span style={{ color: order.delivery_fee === 0 ? 'var(--color-success)' : 'inherit', fontWeight: 600 }}>
                  {order.delivery_fee === 0 ? 'FREE' : `PKR ${order.delivery_fee}`}
                </span>
              </div>
              {order.notes && <div style={{ marginTop: '0.35rem', padding: '0.5rem', background: '#fff', borderRadius: 'var(--radius-md)' }}>
                <strong>Notes:</strong> {order.notes}
              </div>}
            </div>
          </section>

          {/* Items */}
          <section>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>🛍️ Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--color-surface-soft)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.product_name ?? 'Unknown product'}</p>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      PKR {(item.unit_price ?? 0).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-brand-purple)' }}>
                    PKR {((item.unit_price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Total summary */}
          <div style={{
            background: 'var(--color-brand-purple-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--color-brand-purple)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>PKR {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-brand-purple)' }}>Delivery</span>
              <span style={{ fontWeight: 600 }}>
                {order.delivery_fee === 0 ? 'FREE' : `PKR ${order.delivery_fee}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-brand-purple)', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-brand-purple)' }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-brand-purple)' }}>
                PKR {order.total_amount.toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-brand-purple)', fontWeight: 600 }}>
              {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Placed: {formatDate(order.created_at)}
            {order.updated_at && ` · Updated: ${formatDate(order.updated_at)}`}
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({
  product,
  onStockUpdate,
  onStatusUpdate,
  onImageUploaded,
}: {
  product: AdminProduct;
  onStockUpdate: (id: string, stock: number) => Promise<void>;
  onStatusUpdate: (id: string, status: 'active' | 'inactive' | 'out_of_stock') => Promise<void>;
  onImageUploaded: (id: string, url: string) => void;
}) {
  const [editingStock, setEditingStock] = useState(false);
  const [stockVal, setStockVal] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function saveStock() {
    const num = parseInt(stockVal, 10);
    if (isNaN(num) || num < 0) return;
    setSaving(true);
    await onStockUpdate(product.id, num);
    setSaving(false);
    setEditingStock(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('product_id', product.id);
    formData.append('product_slug', product.slug);
    formData.append('index', String(product.images?.length ?? 0));

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      onImageUploaded(product.id, data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const statusColors: Record<string, { color: string; bg: string }> = {
    active:        { color: '#065F46', bg: '#D1FAE5' },
    inactive:      { color: '#6B7280', bg: '#F3F4F6' },
    out_of_stock:  { color: '#991B1B', bg: '#FEE2E2' },
  };
  const sc = statusColors[product.status] ?? statusColors.inactive;
  const firstImage = product.images?.[0];

  return (
    <div style={{
      padding: '0.875rem 1rem',
      borderBottom: '1px solid var(--color-border)',
      fontSize: 'var(--text-sm)',
    }}>
      {/* Main row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 90px 90px 110px 100px',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        {/* Thumbnail */}
        <div style={{
          width: '48px', height: '48px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--color-surface-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative',
          cursor: 'pointer', border: '1px solid var(--color-border)',
        }}
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload image"
        >
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firstImage} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.25rem' }}>📷</span>
          )}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>…</span>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />

        {/* Name + category */}
        <div>
          <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.3 }}>{product.name}</p>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {product.category?.name ?? 'Uncategorised'}
            {!firstImage && (
              <span style={{ color: '#D97706', fontWeight: 600, marginLeft: '0.35rem' }}>
                · No image
              </span>
            )}
          </p>
        </div>

        {/* Stock */}
        <div>
          {editingStock ? (
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <input
                type="number" min="0"
                value={stockVal}
                onChange={e => setStockVal(e.target.value)}
                style={{
                  width: '50px', padding: '0.3rem 0.4rem',
                  border: '1px solid var(--color-brand-purple)',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                  fontFamily: 'inherit',
                }}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveStock(); if (e.key === 'Escape') setEditingStock(false); }}
              />
              <button
                onClick={saveStock} disabled={saving}
                style={{
                  background: 'var(--color-brand-purple)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  padding: '0.3rem 0.5rem', cursor: 'pointer',
                  fontSize: 'var(--text-xs)', fontWeight: 700,
                }}
              >
                {saving ? '…' : '✓'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setStockVal(String(product.stock)); setEditingStock(true); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 'var(--text-sm)',
                color: product.stock === 0 ? 'var(--color-error)' : product.stock < 5 ? '#D97706' : 'inherit',
                textDecoration: 'underline dotted', padding: 0,
              }}
              title="Click to edit stock"
            >
              {product.stock}
            </button>
          )}
        </div>

        {/* Status badge */}
        <div>
          <span style={{
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            background: sc.bg, color: sc.color,
            fontWeight: 700, fontSize: '0.65rem',
            whiteSpace: 'nowrap',
          }}>
            {product.status.replace('_', ' ')}
          </span>
        </div>

        {/* Status toggle */}
        <select
          value={product.status}
          onChange={e => onStatusUpdate(product.id, e.target.value as 'active' | 'inactive' | 'out_of_stock')}
          style={{
            padding: '0.35rem 0.4rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        {/* Price */}
        <div style={{ fontWeight: 700, color: 'var(--color-brand-purple)', textAlign: 'right', whiteSpace: 'nowrap' }}>
          PKR {product.price.toLocaleString()}
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <p style={{
          margin: '0.5rem 0 0 56px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-error)',
        }}>
          ⚠️ {uploadError}
        </p>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [productSearch, setProductSearch] = useState('');
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // ── Load orders ──
  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    }
  }, []);

  // ── Load products ──
  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOrders(), loadProducts()]).finally(() => setLoading(false));
  }, [loadOrders, loadProducts]);

  // ── Update order status ──
  async function handleOrderStatusUpdate(orderId: string, status: OrderStatus) {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
      showToast(`✅ Order marked as ${STATUS_CONFIG[status]?.label ?? status}`);
    } catch {
      showToast('❌ Failed to update status');
    }
  }

  // ── Update product stock ──
  async function handleStockUpdate(productId: string, stock: number) {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, stock }),
      });
      if (!res.ok) throw new Error('Update failed');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock } : p));
      showToast(`✅ Stock updated to ${stock}`);
    } catch {
      showToast('❌ Failed to update stock');
    }
  }

  // ── Update product status ──
  async function handleProductStatusUpdate(productId: string, status: 'active' | 'inactive' | 'out_of_stock') {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p));
      showToast(`✅ Product status updated`);
    } catch {
      showToast('❌ Failed to update product');
    }
  }

  // ── Handle image uploaded from ProductRow ──
  function handleImageUploaded(productId: string, url: string) {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const images = [...(p.images ?? [])];
      if (!images.includes(url)) images.push(url);
      return { ...p, images };
    }));
    showToast('✅ Image uploaded successfully');
  }

  // ── Filtered orders ──
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // ── Filtered products ──
  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    return p.name.toLowerCase().includes(productSearch.toLowerCase());
  });

  // ── Stats ──
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => new Date(o.created_at) >= todayStart);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total_amount, 0);
  const pendingCount = orders.filter(o => ['pending', 'pending_cod'].includes(o.status)).length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: '2.5rem', height: '2.5rem',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-brand-purple)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Loading admin dashboard…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface-soft)', minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: '#1F2937', color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600, fontSize: 'var(--text-sm)',
          zIndex: 200,
          animation: 'slideUp 0.2s ease',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--color-brand-purple)', fontWeight: 600, fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
            ← Store
          </Link>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', flex: 1 }}>
            🛠️ Admin Dashboard
          </h1>
          <button
            onClick={() => { loadOrders(); loadProducts(); showToast('🔄 Refreshed'); }}
            style={{
              background: 'none', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.875rem', cursor: 'pointer',
              fontSize: 'var(--text-sm)', fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '1.5rem 1rem' }}>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          <StatCard icon="📦" label="Today's Orders" value={todayOrders.length} color="var(--color-brand-purple)" />
          <StatCard icon="💰" label="Today's Revenue" value={`PKR ${todayRevenue.toLocaleString()}`} color="var(--color-success)" />
          <StatCard icon="⏳" label="Pending Action" value={pendingCount} color="#D97706" />
          <StatCard icon="🛍️" label="Active Products" value={activeProducts} color="var(--color-brand-teal)" />
          <StatCard icon="⚠️" label="Low Stock" value={lowStockCount} color={lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-success)'} />
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 0,
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}>
          {(['orders', 'products'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '0.875rem',
                background: tab === t ? 'var(--color-brand-purple)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--color-text-secondary)',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 'var(--text-sm)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {t === 'orders' ? '📋' : '🛍️'} {t.charAt(0).toUpperCase() + t.slice(1)}
              <span style={{
                background: tab === t ? 'rgba(255,255,255,0.25)' : 'var(--color-surface-muted)',
                color: tab === t ? '#fff' : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-full)',
                padding: '0.1rem 0.5rem',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}>
                {t === 'orders' ? orders.length : products.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'var(--color-error-light)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem 1rem',
            marginBottom: '1rem',
            color: 'var(--color-error)',
            fontSize: 'var(--text-sm)',
          }}>
            ⚠️ {error} — Make sure /api/admin routes and Supabase are configured.
          </div>
        )}

        {/* ══════════ ORDERS TAB ══════════ */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['all', 'pending', 'pending_cod', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as const).map(f => {
                const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length;
                const sc = f === 'all' ? null : STATUS_CONFIG[f];
                return (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    style={{
                      padding: '0.35rem 0.875rem',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${orderFilter === f ? 'var(--color-brand-purple)' : 'var(--color-border)'}`,
                      background: orderFilter === f ? 'var(--color-brand-purple)' : '#fff',
                      color: orderFilter === f ? '#fff' : 'var(--color-text-secondary)',
                      fontWeight: 600, fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {sc ? `${sc.icon} ${sc.label}` : 'All'} ({count})
                  </button>
                );
              })}
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '2.5rem', margin: '0 0 0.75rem' }}>📭</p>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No orders {orderFilter !== 'all' ? `with status "${STATUS_CONFIG[orderFilter]?.label}"` : 'yet'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredOrders.map(order => {
                  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                  const parsed = (() => { try { return JSON.parse(order.delivery_address); } catch { return null; } })();

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        background: '#fff',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--color-border)',
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '0.75rem',
                        alignItems: 'center',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-brand-purple)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: 'var(--color-brand-purple)', fontSize: 'var(--text-sm)' }}>
                            {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <StatusBadge status={order.status} />
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            👤 {order.customer_name ?? '—'} · {order.customer_phone ?? '—'}
                          </span>
                          {parsed && (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                              📍 {parsed.area}, Lahore
                            </span>
                          )}
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                            {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-brand-purple)' }}>
                          PKR {order.total_amount.toLocaleString()}
                        </p>
                        {/* Quick action buttons for next statuses */}
                        {(status.next ?? []).length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                            {(status.next ?? []).slice(0, 2).map(s => {
                              const sc = STATUS_CONFIG[s];
                              return (
                                <button
                                  key={s}
                                  onClick={e => { e.stopPropagation(); handleOrderStatusUpdate(order.id, s); }}
                                  style={{
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${sc.color}`,
                                    background: sc.bg, color: sc.color,
                                    fontWeight: 700, fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {sc.icon} {sc.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ PRODUCTS TAB ══════════ */}
        {tab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Search + summary */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input"
                placeholder="Search products…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ maxWidth: '320px', flex: 1 }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {filteredProducts.length} products
                {lowStockCount > 0 && (
                  <span style={{ color: 'var(--color-error)', fontWeight: 700, marginLeft: '0.5rem' }}>
                    · ⚠️ {lowStockCount} low stock
                  </span>
                )}
              </span>
            </div>

            {/* Products table */}
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}>
              {/* Horizontal scroll wrapper for mobile */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: '640px' }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 90px 90px 110px 100px',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--color-surface-soft)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <div>Img</div>
                <div>Product</div>
                <div>Stock</div>
                <div>Status</div>
                <div>Set Status</div>
                <div style={{ textAlign: 'right' }}>Price</div>
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No products found
                </div>
              ) : (
                filteredProducts.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onStockUpdate={handleStockUpdate}
                    onStatusUpdate={handleProductStatusUpdate}
                    onImageUploaded={handleImageUploaded}
                  />
                ))
              )}
              </div>{/* end minWidth wrapper */}
              </div>{/* end overflow-x: auto */}
            </div>

            {/* Low stock alert */}
            {lowStockCount > 0 && (
              <div style={{
                background: '#FEF3C7',
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem 1rem',
                fontSize: 'var(--text-sm)',
                color: '#92400E',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                ⚠️ {lowStockCount} product{lowStockCount !== 1 ? 's are' : ' is'} low on stock (less than 5 units). Click the stock number to update.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Order Detail Drawer ── */}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 1rem); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}