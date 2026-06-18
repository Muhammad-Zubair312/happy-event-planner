// ============================================================
// Happy Event Planner — Supabase Database Types
// Auto-matched to the 8 tables defined in the PDF schema
// ============================================================

export type PaymentGateway = 'jazzcash' | 'easypay' | 'cod'

export type OrderStatus =
  | 'pending'
  | 'pending_cod'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// ── 1. categories ────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

// ── 2. products ──────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number           // stored in PKR
  stock: number
  category_id: string
  images: string[]        // array of Supabase storage URLs
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── 3. customers ─────────────────────────────────────────────
export interface Customer {
  id: string              // matches Supabase auth.users id
  name: string
  phone: string
  email: string | null
  whatsapp_number: string | null
  city: string
  addresses: Address[]    // JSONB array
  created_at: string
}

export interface Address {
  label: string           // e.g. "Home", "Office"
  area: string            // e.g. "DHA Phase 5"
  full_address: string
  is_default: boolean
}

// ── 4. orders ────────────────────────────────────────────────
export interface Order {
  id: string
  customer_id: string
  status: OrderStatus
  total_amount: number    // PKR
  payment_method: PaymentGateway
  delivery_address: Address
  delivery_zone: 'A' | 'B' | 'C' | 'D'
  delivery_fee: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ── 5. order_items ───────────────────────────────────────────
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number      // PKR at time of order (snapshot)
  created_at: string
}

// ── 6. payments ──────────────────────────────────────────────
export interface Payment {
  id: string
  order_id: string
  gateway: PaymentGateway
  txn_id: string | null   // null for COD until confirmed
  status: PaymentStatus
  amount: number          // PKR
  raw_response: Record<string, unknown> | null  // full gateway response JSONB
  created_at: string
}

// ── 7. reviews ───────────────────────────────────────────────
export interface Review {
  id: string
  product_id: string
  customer_id: string
  rating: number          // 1–5
  comment: string | null
  is_approved: boolean
  created_at: string
}

// ── 8. inventory_log ─────────────────────────────────────────
export interface InventoryLog {
  id: string
  product_id: string
  change: number          // positive = restock, negative = sold/adjustment
  reason: string          // e.g. "sale", "restock", "damage", "manual"
  new_stock: number       // stock level after this change
  order_id: string | null // linked order if reason = "sale"
  created_at: string
}

// ── Database wrapper (for createClient<Database>) ────────────
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'created_at'>
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      inventory_log: {
        Row: InventoryLog
        Insert: Omit<InventoryLog, 'id' | 'created_at'>
        Update: never  // logs are immutable
      }
    }
  }
}
