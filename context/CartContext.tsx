'use client';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;     // max available — prevents over-ordering
  category: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM';    payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QTY';  payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART';   payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getItemQty: (id: string) => number;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case 'LOAD_CART':
      return { items: action.payload };

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        // Increment qty, but never exceed available stock
        return {
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.id !== action.payload.id) };

    case 'UPDATE_QTY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter(i => i.id !== id) };
      }
      return {
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = 'hep_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from sessionStorage on mount (survives page refresh, cleared on tab close)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: CartItem[] = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: saved });
        }
      }
    } catch {
      // Storage unavailable or corrupt — start with empty cart
    }
  }, []);

  // Persist to sessionStorage on every change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem    = (item: Omit<CartItem, 'quantity'>) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const updateQty  = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } });
  const clearCart  = () => dispatch({ type: 'CLEAR_CART' });
  const isInCart   = (id: string) => state.items.some(i => i.id === id);
  const getItemQty = (id: string) => state.items.find(i => i.id === id)?.quantity ?? 0;

  return (
    <CartContext.Provider value={{
      items: state.items, totalItems, totalPrice,
      addItem, removeItem, updateQty, clearCart, isInCart, getItemQty,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
