import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// ─── TypeScript Types (matching all 8 DB tables) ────────────────────────────

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type OrderStatus = 'pending' | 'pending_cod' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentGateway = 'jazzcash' | 'easypay' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  images: string[];
  status: ProductStatus;
  created_at: string;
  category?: Category;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsapp_number: string | null;
  city: string;
  addresses: string[];
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  status: OrderStatus;
  total_amount: number;
  payment_method: PaymentGateway;
  delivery_address: string;
  created_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  gateway: PaymentGateway;
  txn_id: string | null;
  status: PaymentStatus;
  amount: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  change: number;
  reason: string;
  new_stock: number;
  created_at: string;
}

// ─── Supabase Browser Client (uses @supabase/ssr for cookie-based auth) ──────
// This is the ONLY client to use in 'use client' components.
// It stores the session in cookies so the proxy/middleware can read it server-side.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase env vars missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// ─── Helper: Server-side admin client (for API routes / webhooks only) ───────
// Uses service role key — NEVER import this in 'use client' files.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── DB Query Helpers ─────────────────────────────────────────────────────────

/** Fetch all active products with their category */
export async function getProducts(categorySlug?: string) {
  let query = supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

/** Fetch a single product by slug */
export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as Product;
}

/** Fetch all categories */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Category[];
}

/** Create a new order */
export async function createOrder(order: Omit<Order, 'id' | 'created_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (orderError) throw orderError;

  const orderItems = items.map(item => ({ ...item, order_id: orderData.id }));
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  return orderData as Order;
}

/** Fetch orders for a customer */
export async function getCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(name, images, price))')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

/** Update order status (admin) */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

/** Log inventory change */
export async function logInventoryChange(productId: string, change: number, reason: string, newStock: number) {
  const { error } = await supabase
    .from('inventory_log')
    .insert({ product_id: productId, change, reason, new_stock: newStock });
  if (error) throw error;
}

/** Get product reviews */
export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, customer:customers(name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Review[];
}

/** Fetch related products (same category, exclude current) */
export async function getRelatedProducts(categoryId: string, excludeSlug: string, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('slug', excludeSlug)
    .limit(limit);
  if (error) throw error;
  return data as Product[];
}