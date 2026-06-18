import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// ─── Delivery zone + fee calculation (matches PDF zones exactly) ──────────────
export function getDeliveryZone(area: string): { zone: 'A' | 'B' | 'C' | 'D'; fee: number } {
  const a = area.toLowerCase();
  if (['dha', 'gulberg', 'model town', 'garden town'].some(z => a.includes(z))) {
    return { zone: 'A', fee: 0 };
  }
  if (['johar', 'bahria', 'wapda', 'faisal town'].some(z => a.includes(z))) {
    return { zone: 'B', fee: 150 };
  }
  if (['ichra', 'anarkali', 'samanabad', 'shadman'].some(z => a.includes(z))) {
    return { zone: 'C', fee: 250 };
  }
  return { zone: 'D', fee: 350 };
}

// ─── Generate human-readable order number ─────────────────────────────────────
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `HEP-${timestamp}-${random}`;
}

// ─── Validate cart items ──────────────────────────────────────────────────────
interface CartItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
}

function validateItems(items: unknown[]): CartItemPayload[] {
  return items.map((item, i) => {
    const it = item as Record<string, unknown>;
    if (!it.product_id || typeof it.product_id !== 'string') {
      throw new Error(`Item ${i}: missing product_id`);
    }
    if (!it.quantity || typeof it.quantity !== 'number' || it.quantity < 1) {
      throw new Error(`Item ${i}: quantity must be >= 1`);
    }
    if (!it.unit_price || typeof it.unit_price !== 'number' || it.unit_price < 0) {
      throw new Error(`Item ${i}: invalid unit_price`);
    }
    return {
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
    };
  });
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, payment_method, delivery_area, full_address, notes } = body;

    // ── Validate required fields ──
    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return NextResponse.json(
        { error: 'Customer name and phone are required.' },
        { status: 400 }
      );
    }
    if (!delivery_area || !full_address) {
      return NextResponse.json(
        { error: 'Delivery area and address are required.' },
        { status: 400 }
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }
    if (!['jazzcash', 'easypay', 'cod'].includes(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
    }

    // ── Validate and sanitise items ──
    let validatedItems: CartItemPayload[];
    try {
      validatedItems = validateItems(items);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid cart items.' },
        { status: 400 }
      );
    }

    // ── Calculate delivery fee and totals ──
    const { zone, fee: deliveryFee } = getDeliveryZone(delivery_area);
    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    const deliveryAddress = {
      label: 'Delivery',
      area: delivery_area,
      full_address,
      is_default: false,
    };

    // ── Use service-role client (bypasses RLS for order creation) ──
    const supabase = createServerClient();

    // ── Step 1: Upsert customer by phone ──
    let customerId: string | null = null;
    try {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customer.phone.trim())
        .maybeSingle();

      if (existingCustomer?.id) {
        customerId = existingCustomer.id;
        // Update name/email in case they changed
        await supabase
          .from('customers')
          .update({ name: customer.name.trim(), email: customer.email || null })
          .eq('id', customerId);
      } else {
        const { data: newCustomer, error: custError } = await supabase
          .from('customers')
          .insert({
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            email: customer.email || null,
            whatsapp_number: customer.phone.trim(),
            city: 'Lahore',
            addresses: [JSON.stringify(deliveryAddress)],
          })
          .select('id')
          .single();

        if (!custError && newCustomer) {
          customerId = newCustomer.id;
        }
      }
    } catch {
      // Customer table may not exist yet — proceed without customer_id
      customerId = null;
    }

    // ── Step 2: Create order ──
    const orderStatus = payment_method === 'cod' ? 'pending_cod' : 'pending';

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: orderStatus,
        total_amount: totalAmount,
        payment_method,
        delivery_address: JSON.stringify(deliveryAddress),
        delivery_zone: zone,
        delivery_fee: deliveryFee,
        notes: notes || null,
        order_number: orderNumber,
      })
      .select('id, order_number, status, total_amount, created_at')
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      // Fallback: try without new columns (Day 11 schema compatibility)
      const { data: orderFallback, error: fallbackError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          status: orderStatus,
          total_amount: totalAmount,
          payment_method,
          delivery_address: JSON.stringify(deliveryAddress),
        })
        .select('id, status, total_amount, created_at')
        .single();

      if (fallbackError) {
        console.error('Fallback order insert error:', fallbackError);
        throw fallbackError;
      }

      // Insert items against fallback order
      await supabase.from('order_items').insert(
        validatedItems.map(item => ({
          order_id: orderFallback.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      );

      return NextResponse.json({
        success: true,
        order_id: orderFallback.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        zone,
        payment_method,
        status: orderStatus,
      });
    }

    // ── Step 3: Insert order items ──
    const { error: itemsError } = await supabase.from('order_items').insert(
      validatedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))
    );

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      // Non-critical — order is saved, items can be retried
    }

    // ── Step 4: Deduct stock for each item (using DB function if available) ──
    for (const item of validatedItems) {
      try {
        const { error: stockErr } = await supabase.rpc('deduct_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
          p_order_id: order.id,
        });
        if (stockErr) {
          // RPC not available yet (Day 12 migration not run) — skip silently
          console.warn('Stock deduction RPC not available:', stockErr.message);
        }
      } catch {
        // Non-critical at this stage — log and continue
      }
    }

    // ── Step 5: Create payment record ──
    try {
      await supabase.from('payments').insert({
        order_id: order.id,
        gateway: payment_method,
        txn_id: null,
        status: 'pending',
        amount: totalAmount,
        raw_response: null,
      });
    } catch {
      // Non-critical — payment record can be created later
    }

    // ── Return success ──
    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number ?? orderNumber,
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      zone,
      payment_method,
      status: orderStatus,
      created_at: order.created_at,
    });

  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create order. Please try WhatsApp order instead.' },
      { status: 500 }
    );
  }
}

// ─── GET /api/orders?phone=03001234567 ───────────────────────────────────────
// Simple order lookup by phone (for customer to track order)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');
  const orderNumber = searchParams.get('order_number');

  if (!phone && !orderNumber) {
    return NextResponse.json(
      { error: 'Provide phone or order_number to look up orders.' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    if (orderNumber) {
      // Look up by order number
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, payment_method, delivery_address, delivery_fee, created_at')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, order: data });
    }

    // Look up by customer phone
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone!)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, payment_method, created_at, delivery_fee')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return NextResponse.json({ success: true, orders });

  } catch (err) {
    console.error('Order lookup error:', err);
    return NextResponse.json({ error: 'Could not retrieve orders.' }, { status: 500 });
  }
}
