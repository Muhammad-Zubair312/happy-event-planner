'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

// ─── Lahore delivery areas — matches PDF zone strategy exactly ───────────────
const LAHORE_AREAS = [
  { label: '── Zone A — Free Delivery ──', value: '', disabled: true },
  { label: 'DHA Phase 1–8', value: 'DHA', zone: 'A', fee: 0 },
  { label: 'Gulberg', value: 'Gulberg', zone: 'A', fee: 0 },
  { label: 'Model Town', value: 'Model Town', zone: 'A', fee: 0 },
  { label: 'Garden Town', value: 'Garden Town', zone: 'A', fee: 0 },
  { label: '── Zone B — PKR 150 ──', value: '', disabled: true },
  { label: 'Johar Town', value: 'Johar Town', zone: 'B', fee: 150 },
  { label: 'Bahria Town', value: 'Bahria Town', zone: 'B', fee: 150 },
  { label: 'Wapda Town', value: 'Wapda Town', zone: 'B', fee: 150 },
  { label: 'Faisal Town', value: 'Faisal Town', zone: 'B', fee: 150 },
  { label: '── Zone C — PKR 250 ──', value: '', disabled: true },
  { label: 'Ichra', value: 'Ichra', zone: 'C', fee: 250 },
  { label: 'Anarkali', value: 'Anarkali', zone: 'C', fee: 250 },
  { label: 'Samanabad', value: 'Samanabad', zone: 'C', fee: 250 },
  { label: 'Shadman', value: 'Shadman', zone: 'C', fee: 250 },
  { label: '── Zone D — PKR 350 ──', value: '', disabled: true },
  { label: 'Raiwind', value: 'Raiwind', zone: 'D', fee: 350 },
  { label: 'Sheikhupura', value: 'Sheikhupura', zone: 'D', fee: 350 },
  { label: 'Kasur', value: 'Kasur', zone: 'D', fee: 350 },
  { label: 'Other Lahore area', value: 'Other Lahore', zone: 'D', fee: 350 },
];

const PAYMENT_OPTIONS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: '💵',
    desc: 'Pay when your order arrives. PKR 0 extra.',
    badge: 'Most Popular',
    badgeColor: 'var(--color-success)',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    icon: '📲',
    desc: 'Pay via JazzCash wallet or mobile account.',
    badge: 'Instant',
    badgeColor: 'var(--color-brand-purple)',
  },
  {
    id: 'easypay',
    label: 'EasyPaisa',
    icon: '💳',
    desc: 'Pay via EasyPaisa wallet or account.',
    badge: null,
    badgeColor: null,
  },
];

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923XXXXXXXXX';

function buildOrderWhatsAppURL(
  items: CartItem[],
  form: {
    name: string; phone: string; area: string;
    address: string; payment: string; notes: string;
  },
  deliveryFee: number
) {
  const lines = items.map(i =>
    `• ${i.name} ×${i.quantity} = PKR ${(i.price * i.quantity).toLocaleString()}`
  ).join('\n');
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const msg =
    `Hello! I want to place an order:\n\n` +
    `${lines}\n\n` +
    `Subtotal: PKR ${subtotal.toLocaleString()}\n` +
    `Delivery: PKR ${deliveryFee === 0 ? 'FREE' : deliveryFee.toLocaleString()}\n` +
    `Total: PKR ${(subtotal + deliveryFee).toLocaleString()}\n\n` +
    `Name: ${form.name}\n` +
    `Phone: ${form.phone}\n` +
    `Area: ${form.area}\n` +
    `Address: ${form.address}\n` +
    `Payment: ${form.payment.toUpperCase()}\n` +
    (form.notes ? `Notes: ${form.notes}\n` : '') +
    `\nPlease confirm this order.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────
interface FormErrors {
  name?: string;
  phone?: string;
  area?: string;
  address?: string;
}

function validate(fields: {
  name: string; phone: string; area: string; address: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!fields.name.trim() || fields.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }
  const phoneDigits = fields.phone.replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 13) {
    errors.phone = 'Enter a valid Pakistani phone number (e.g. 0300-1234567).';
  }
  if (!fields.area) {
    errors.area = 'Please select your delivery area.';
  }
  if (!fields.address.trim() || fields.address.trim().length < 10) {
    errors.address = 'Please enter your complete street address (minimum 10 characters).';
  }
  return errors;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Your Details' },
    { n: 2, label: 'Review Order' },
    { n: 3, label: 'Confirmed!' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      marginBottom: '2rem',
    }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '2rem', height: '2rem',
              borderRadius: 'var(--radius-full)',
              background: step >= s.n ? 'var(--color-brand-purple)' : 'var(--color-border)',
              color: step >= s.n ? '#fff' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 'var(--text-sm)',
              transition: 'all 0.3s ease',
            }}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: step >= s.n ? 'var(--color-brand-purple)' : 'var(--color-text-muted)',
              fontWeight: step >= s.n ? 600 : 400,
              marginTop: '0.25rem',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              height: '2px', flex: 1,
              background: step > s.n ? 'var(--color-brand-purple)' : 'var(--color-border)',
              marginBottom: '1.25rem',
              transition: 'background 0.3s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Empty cart redirect ──────────────────────────────────────────────────────
function EmptyCartMessage() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Add some products before checking out.
      </p>
      <Link href="/products" className="btn btn-primary btn-lg">
        Browse Products
      </Link>
    </div>
  );
}

// ─── Order Confirmation Screen ────────────────────────────────────────────────
function OrderConfirmed({
  orderNumber,
  orderData,
  cartItems,
  deliveryFee,
  formData,
}: {
  orderNumber: string;
  orderData: {
    order_id: string;
    total_amount: number;
    payment_method: string;
    delivery_fee: number;
    zone: string;
  };
  cartItems: CartItem[];
  deliveryFee: number;
  formData: {
    name: string; phone: string; area: string;
    address: string; payment: string; notes: string;
  };
}) {
  const isCOD = formData.payment === 'cod';

  return (
    <div style={{
      background: 'var(--color-surface-soft)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 2rem)',
      textAlign: 'center',
      border: '1px solid var(--color-border)',
    }}>
      {/* Success icon */}
      <div style={{
        width: '5rem', height: '5rem',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-success-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        fontSize: '2.5rem',
        animation: 'pop 0.4s ease',
      }}>
        ✅
      </div>

      <h2 style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-2xl)', color: 'var(--color-success)' }}>
        Order Placed!
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem' }}>
        Thank you, <strong>{formData.name}</strong>! We&apos;ll confirm your order shortly.
      </p>

      {/* Order number */}
      <div style={{
        background: 'var(--color-brand-purple-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.875rem 1.5rem',
        display: 'inline-block',
        marginBottom: '1.5rem',
      }}>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-brand-purple)', fontWeight: 600 }}>
          ORDER NUMBER
        </p>
        <p style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-brand-purple)' }}>
          {orderNumber}
        </p>
      </div>

      {/* Order summary box */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        padding: '1.25rem',
        textAlign: 'left',
        marginBottom: '1.5rem',
      }}>
        <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>Order Summary</p>
        {cartItems.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 'var(--text-sm)', marginBottom: '0.35rem',
          }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{item.name} ×{item.quantity}</span>
            <span style={{ fontWeight: 600 }}>PKR {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.75rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Delivery ({formData.area})</span>
          <span style={{ fontWeight: 600, color: deliveryFee === 0 ? 'var(--color-success)' : 'inherit' }}>
            {deliveryFee === 0 ? 'FREE' : `PKR ${deliveryFee}`}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-brand-purple)' }}>
            PKR {orderData.total_amount.toLocaleString()}
          </span>
        </div>
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
          <strong>Payment:</strong> {formData.payment === 'cod' ? '💵 Cash on Delivery' : formData.payment === 'jazzcash' ? '📲 JazzCash' : '💳 EasyPaisa'} &nbsp;|&nbsp;
          <strong>Address:</strong> {formData.address}, {formData.area}, Lahore
        </div>
      </div>

      {/* What happens next */}
      <div style={{
        background: isCOD ? 'var(--color-warning-light)' : 'var(--color-brand-purple-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        textAlign: 'left',
        marginBottom: '1.5rem',
      }}>
        <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
          {isCOD ? '⏱ What happens next?' : '📲 Complete your payment'}
        </p>
        {isCOD ? (
          <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>We will call <strong>{formData.phone}</strong> to confirm your order</li>
            <li>Your order will be packed and dispatched</li>
            <li>Pay <strong>PKR {orderData.total_amount.toLocaleString()}</strong> when it arrives</li>
          </ol>
        ) : (
          <p style={{ margin: 0, fontSize: 'var(--text-xs)' }}>
            Our team will contact you on <strong>{formData.phone}</strong> with {formData.payment === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} payment details. Order will be dispatched once payment is confirmed.
          </p>
        )}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <a
          href={buildOrderWhatsAppURL(cartItems, formData, deliveryFee)}
          target="_blank" rel="noopener noreferrer"
          className="btn btn-whatsapp btn-lg"
          style={{ justifyContent: 'center' }}
        >
          <WhatsAppIcon size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Confirm on WhatsApp
        </a>
        <Link href="/products" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('cod');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Step: 1 = form, 2 = review, 3 = confirmed
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    order_id: string; order_number: string; total_amount: number;
    payment_method: string; delivery_fee: number; zone: string;
  } | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);

  // Delivery fee from selected area
  const selectedArea = LAHORE_AREAS.find(a => a.value === area && !a.disabled);
  const deliveryFee = selectedArea?.fee ?? 0;
  const grandTotal = totalPrice + deliveryFee;

  // Real-time validation for touched fields
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate({ name, phone, area, address }));
    }
  }, [name, phone, area, address, touched]);

  function handleBlur(field: string) {
    setTouched(t => ({ ...t, [field]: true }));
  }

  function handleStep1Submit() {
    setTouched({ name: true, phone: true, area: true, address: true });
    const errs = validate({ name, phone, area, address });
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handlePlaceOrder() {
    setSubmitting(true);
    setSubmitError('');

    const snapshot = [...items]; // snapshot before clearing

    try {
      const payload = {
        customer: { name, phone, email: email || null },
        items: snapshot.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        payment_method: payment,
        delivery_area: area,
        full_address: address,
        notes: notes || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order failed. Please try WhatsApp.');
      }

      // Success — save confirmed data, clear cart, move to step 3
      setConfirmedOrder(data);
      setConfirmedItems(snapshot);
      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please order via WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Empty cart ──
  if (items.length === 0 && step !== 3) {
    return <EmptyCartMessage />;
  }

  // ── Confirmed ──
  if (step === 3 && confirmedOrder) {
    return (
      <div style={{ background: 'var(--color-surface-soft)', minHeight: '100vh', paddingBottom: '3rem' }}>
        <div className="container-sm" style={{ padding: '2rem 1rem' }}>
          <StepBar step={3} />
          <OrderConfirmed
            orderNumber={confirmedOrder.order_number}
            orderData={confirmedOrder}
            cartItems={confirmedItems}
            deliveryFee={confirmedOrder.delivery_fee}
            formData={{ name, phone, area, address, payment, notes }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface-soft)', minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/cart" style={{ color: 'var(--color-brand-purple)', fontWeight: 600, fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
            ← Back to Cart
          </Link>
          <div style={{ flex: 1 }} />
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Checkout</h1>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="container" style={{ padding: '1.5rem 1rem' }}>

        <StepBar step={step} />

        <div className="checkout-layout">

          {/* ── LEFT: Form or Review ── */}
          <div>

            {/* ════ STEP 1 — Delivery Form ════ */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Personal details */}
                <section style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                }}>
                  <h2 style={{ margin: '0 0 1.25rem', fontSize: 'var(--text-xl)' }}>
                    📋 Your Details
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Name */}
                    <div>
                      <label className="label" htmlFor="name">
                        Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <input
                        id="name" type="text" className={`input ${errors.name && touched.name ? 'input-error' : ''}`}
                        placeholder="e.g. Ayesha Khan"
                        value={name} onChange={e => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        autoComplete="name"
                      />
                      {errors.name && touched.name && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="label" htmlFor="phone">
                        Phone Number <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <input
                        id="phone" type="tel" className={`input ${errors.phone && touched.phone ? 'input-error' : ''}`}
                        placeholder="e.g. 0300-1234567"
                        value={phone} onChange={e => setPhone(e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        autoComplete="tel"
                      />
                      {errors.phone && touched.phone && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                          {errors.phone}
                        </p>
                      )}
                      <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        We&apos;ll call this number to confirm your order
                      </p>
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <label className="label" htmlFor="email">
                        Email <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional — for order receipt)</span>
                      </label>
                      <input
                        id="email" type="email" className="input"
                        placeholder="ayesha@example.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                  </div>
                </section>

                {/* Delivery address */}
                <section style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                }}>
                  <h2 style={{ margin: '0 0 1.25rem', fontSize: 'var(--text-xl)' }}>
                    🚚 Delivery Address
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Area dropdown */}
                    <div>
                      <label className="label" htmlFor="area">
                        Delivery Area <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <select
                        id="area"
                        className={`select ${errors.area && touched.area ? 'input-error' : ''}`}
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        onBlur={() => handleBlur('area')}
                      >
                        <option value="" disabled>Select your area in Lahore…</option>
                        {LAHORE_AREAS.map((opt, i) =>
                          opt.disabled
                            ? <option key={i} value="" disabled>{opt.label}</option>
                            : <option key={opt.value} value={opt.value}>{opt.label}</option>
                        )}
                      </select>
                      {errors.area && touched.area && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                          {errors.area}
                        </p>
                      )}
                      {/* Live delivery fee preview */}
                      {selectedArea && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.875rem',
                          borderRadius: 'var(--radius-md)',
                          background: deliveryFee === 0 ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: deliveryFee === 0 ? '#065F46' : '#92400E',
                        }}>
                          {deliveryFee === 0
                            ? `✅ Free delivery to ${selectedArea.label}!`
                            : `🚚 Delivery to ${selectedArea.label}: PKR ${deliveryFee}`}
                        </div>
                      )}
                    </div>

                    {/* Full address */}
                    <div>
                      <label className="label" htmlFor="address">
                        Street Address <span style={{ color: 'var(--color-error)' }}>*</span>
                      </label>
                      <textarea
                        id="address"
                        className={`input ${errors.address && touched.address ? 'input-error' : ''}`}
                        placeholder="House/flat no., street name, block…&#10;e.g. House 15, Street 4, Phase 5 DHA Lahore"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        onBlur={() => handleBlur('address')}
                        rows={3}
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      />
                      {errors.address && touched.address && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                          {errors.address}
                        </p>
                      )}
                    </div>

                    {/* Order notes */}
                    <div>
                      <label className="label" htmlFor="notes">
                        Special Instructions <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input
                        id="notes" type="text" className="input"
                        placeholder="e.g. Balloon colors: pink & gold. Ring bell twice."
                        value={notes} onChange={e => setNotes(e.target.value)}
                      />
                    </div>

                  </div>
                </section>

                {/* Payment method */}
                <section style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                }}>
                  <h2 style={{ margin: '0 0 1.25rem', fontSize: 'var(--text-xl)' }}>
                    💳 Payment Method
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {PAYMENT_OPTIONS.map(opt => (
                      <label
                        key={opt.id}
                        htmlFor={`payment-${opt.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: `2px solid ${payment === opt.id ? 'var(--color-brand-purple)' : 'var(--color-border)'}`,
                          background: payment === opt.id ? 'var(--color-brand-purple-light)' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          id={`payment-${opt.id}`}
                          type="radio"
                          name="payment"
                          value={opt.id}
                          checked={payment === opt.id}
                          onChange={() => setPayment(opt.id)}
                          style={{ accentColor: 'var(--color-brand-purple)', width: '1.1rem', height: '1.1rem', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{opt.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{opt.label}</span>
                            {opt.badge && (
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 700,
                                background: opt.badgeColor || 'var(--color-brand-purple)',
                                color: '#fff',
                                borderRadius: 'var(--radius-full)',
                                padding: '0.1rem 0.5rem',
                              }}>{opt.badge}</span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* COD note for high-value orders */}
                  {payment === 'cod' && totalPrice > 2000 && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--color-warning-light)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      color: '#92400E',
                    }}>
                      ⚠️ For orders over PKR 2,000, we verify by calling your phone number before dispatching.
                    </div>
                  )}
                </section>

                {/* Continue button */}
                <button
                  onClick={handleStep1Submit}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                >
                  Review Order →
                </button>

              </div>
            )}

            {/* ════ STEP 2 — Review ════ */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <section style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>📋 Review Your Order</h2>
                    <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-brand-purple)' }}>
                      Edit Details
                    </button>
                  </div>

                  {/* Customer details summary */}
                  <div style={{
                    background: 'var(--color-surface-soft)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    fontSize: 'var(--text-sm)',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                  }}>
                    <div><strong>Name:</strong> {name}</div>
                    <div><strong>Phone:</strong> {phone}</div>
                    {email && <div><strong>Email:</strong> {email}</div>}
                    <div><strong>Delivery:</strong> {address}, {area}, Lahore</div>
                    <div><strong>Payment:</strong> {payment === 'cod' ? '💵 Cash on Delivery' : payment === 'jazzcash' ? '📲 JazzCash' : '💳 EasyPaisa'}</div>
                    {notes && <div><strong>Notes:</strong> {notes}</div>}
                  </div>

                  {/* Items */}
                  <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                    Items ({totalItems})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {items.map(item => (
                      <div key={item.id} style={{
                        display: 'flex', gap: '0.75rem', alignItems: 'center',
                        padding: '0.75rem',
                        background: 'var(--color-surface-soft)',
                        borderRadius: 'var(--radius-lg)',
                      }}>
                        <div style={{
                          width: '48px', height: '48px', flexShrink: 0,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--color-surface-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}>
                          {item.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '1.5rem' }}>🎈</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                          </p>
                          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                            PKR {item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-brand-purple)', flexShrink: 0 }}>
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                      <span style={{ fontWeight: 600 }}>PKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Delivery to {area}</span>
                      <span style={{ fontWeight: 600, color: deliveryFee === 0 ? 'var(--color-success)' : 'inherit' }}>
                        {deliveryFee === 0 ? 'FREE' : `PKR ${deliveryFee}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ fontWeight: 700 }}>Grand Total</span>
                      <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-brand-purple)' }}>
                        PKR {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Error message */}
                {submitError && (
                  <div style={{
                    background: 'var(--color-error-light)',
                    border: '1px solid var(--color-error)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-error)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>⚠️ {submitError}</p>
                    <a
                      href={buildOrderWhatsAppURL(items, { name, phone, area, address, payment, notes }, deliveryFee)}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <WhatsAppIcon size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Order via WhatsApp instead
                    </a>
                  </div>
                )}

                {/* Place order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                >
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '1rem', height: '1rem',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block',
                      }} />
                      Placing Order…
                    </span>
                  ) : (
                    `✅ Place Order — PKR ${grandTotal.toLocaleString()}`
                  )}
                </button>

                {/* WhatsApp fallback */}
                <a
                  href={buildOrderWhatsAppURL(items, { name, phone, area, address, payment, notes }, deliveryFee)}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ justifyContent: 'center' }}
                >
                  <WhatsAppIcon size={16} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Or order via WhatsApp
                </a>

                <style>{`
                  @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sticky Order Summary ── */}
          {step !== 3 && (
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              position: 'sticky',
              top: '80px',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: 'var(--text-lg)' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>PKR {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Delivery {area ? `(${area})` : ''}
                  </span>
                  <span style={{
                    fontWeight: 600,
                    color: selectedArea
                      ? (deliveryFee === 0 ? 'var(--color-success)' : 'inherit')
                      : 'var(--color-text-muted)',
                  }}>
                    {!selectedArea ? 'Select area' : deliveryFee === 0 ? 'FREE' : `PKR ${deliveryFee}`}
                  </span>
                </div>
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--color-brand-purple)' }}>
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Trust bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  '🔒 Secure checkout',
                  '💰 COD available across Lahore',
                  '🚚 Same-day delivery in DHA & Gulberg',
                  'WhatsApp order confirmation',
                ].map(t => (
                  <p key={t} style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>

        <style>{`
          /* Checkout layout: single col mobile → 2 col desktop */
          .checkout-layout {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          @media (min-width: 768px) {
            .checkout-layout {
              display: grid;
              grid-template-columns: minmax(0, 1fr) 320px;
              gap: 1.5rem;
              align-items: start;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
