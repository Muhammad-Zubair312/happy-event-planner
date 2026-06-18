import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { OrderStatus } from '@/lib/supabase';

// ─── GET /api/admin/orders — fetch all orders with customer + items ───────────
export async function GET() {
  const supabase = createServerClient();

  try {
    // Try to use the order_details view (created in Day 12 migration)
    const { data: viewData, error: viewError } = await supabase
      .from('order_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!viewError && viewData) {
      return NextResponse.json({ success: true, orders: viewData });
    }

    // Fallback: manual join if view doesn't exist yet
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total_amount, payment_method,
        delivery_address, delivery_zone, delivery_fee, notes,
        created_at, updated_at,
        customer:customers(name, phone, email)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (ordersError) throw ordersError;

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      (orders ?? []).map(async (order: Record<string, unknown>) => {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity, unit_price, product:products(name)')
          .eq('order_id', order.id as string);

        const customer = order.customer as Record<string, string> | null;

        return {
          ...order,
          customer_name: customer?.name ?? null,
          customer_phone: customer?.phone ?? null,
          customer_email: customer?.email ?? null,
          items: (items ?? []).map((i: Record<string, unknown>) => ({
            product_id: i.product_id,
            product_name: (i.product as Record<string, string> | null)?.name ?? null,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
        };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithItems });

  } catch (err) {
    console.error('Admin orders GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders. Ensure service role key is set.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/orders — update order status ───────────────────────────
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'order_id and status are required.' },
        { status: 400 }
      );
    }

    const validStatuses: OrderStatus[] = [
      'pending', 'pending_cod', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order_id)
      .select('id, status')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data });

  } catch (err) {
    console.error('Admin orders PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update order status.' },
      { status: 500 }
    );
  }
}