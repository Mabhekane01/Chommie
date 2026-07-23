'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';

export interface PriceChange {
  productId: string;
  name: string;
  from: number;
  to: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  /** Retail benchmark for the savings line (do.md §6); absent for non-staples. */
  retailPrice?: number;
  image?: string;
  quantity: number;
  supplierId?: string;
  /** Cap for quantity steppers so we never let someone order past stock. */
  stock?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** What the same basket would cost at retail, for items we have a benchmark for. */
  retailTotal: number;
  /** retailTotal − subtotal, floored at zero. */
  savings: number;
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Re-syncs stored lines against live catalogue pricing; returns what changed. */
  revalidate: () => Promise<PriceChange[]>;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'chommie_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt cart */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.stock && i.stock > 0 ? Math.min(qty, i.stock) : qty }
              : i,
          ),
    );
  }, []);

  const remove = useCallback(
    (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  /**
   * A basket lives in localStorage indefinitely, so its prices drift from the
   * catalogue. We sell on price transparency — showing a stale number is worse
   * than showing none — so re-sync against live pricing and report what moved.
   * The server still recomputes the real total at order time; this is display
   * accuracy, not enforcement.
   */
  const revalidate = useCallback(async (): Promise<PriceChange[]> => {
    const ids = items.map((i) => i.productId);
    if (ids.length === 0) return [];

    const fresh = await api.products.byIds(ids);
    if (fresh.length === 0) return [];

    const byId = new Map(fresh.map((p) => [String(p.id ?? p._id), p]));
    const changes: PriceChange[] = [];

    setItems((prev) =>
      prev.map((item) => {
        const p = byId.get(item.productId);
        if (!p) return item; // delisted or gateway hiccup — leave the line alone
        const price = p.discountPrice ?? p.price;
        if (price !== item.price) {
          changes.push({ productId: item.productId, name: item.name, from: item.price, to: price });
        }
        return {
          ...item,
          price,
          retailPrice: p.retailPrice,
          stock: p.stock,
          quantity: p.stock && p.stock > 0 ? Math.min(item.quantity, p.stock) : item.quantity,
        };
      }),
    );

    return changes;
  }, [items]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  // Items without a benchmark fall back to their own price, so they contribute
  // zero savings rather than inflating or deflating the comparison.
  const retailTotal = items.reduce(
    (s, i) => s + Math.max(i.retailPrice ?? i.price, i.price) * i.quantity,
    0,
  );
  const savings = Math.max(0, retailTotal - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        retailTotal,
        savings,
        add,
        setQty,
        remove,
        clear,
        revalidate,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
