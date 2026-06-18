import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// ─── GET /api/admin/products — fetch all products with categories ─────────────
export async function GET() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, products: data ?? [] });

  } catch (err) {
    console.error('Admin products GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/products — update stock or status ──────────────────────
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();
    const { product_id, stock, status } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required.' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};

    if (stock !== undefined) {
      if (typeof stock !== 'number' || stock < 0) {
        return NextResponse.json({ error: 'stock must be a non-negative number.' }, { status: 400 });
      }
      updatePayload.stock = stock;
      // Auto-set status based on stock
      if (stock === 0) updatePayload.status = 'out_of_stock';
      else if (stock > 0 && status !== 'inactive') updatePayload.status = 'active';
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'inactive', 'out_of_stock'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      updatePayload.status = status;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', product_id)
      .select('id, stock, status')
      .single();

    if (error) throw error;

    // Log inventory change if stock was updated
    if (stock !== undefined && updatePayload.stock !== undefined) {
      try {
        await supabase.from('inventory_log').insert({
          product_id,
          change: 0,       // manual admin set — not a delta
          reason: `admin_set_${stock}`,
          new_stock: stock,
        });
      } catch {
        // Non-critical — log failure doesn't block response
      }
    }

    return NextResponse.json({ success: true, product: data });

  } catch (err) {
    console.error('Admin products PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update product.' },
      { status: 500 }
    );
  }
}
