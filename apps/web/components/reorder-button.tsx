'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart, type CartItem } from '@/lib/cart';

export interface ReorderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  retailPrice?: number;
  supplierId?: string;
}

/**
 * Refills the basket from a past order — the core repeat action for a staples
 * business (do.md §3.2, and Route A of the discovery algorithm).
 */
export function ReorderButton({
  items,
  label = 'Buy these again',
  className,
}: {
  items: ReorderItem[];
  label?: string;
  className?: string;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = () => {
    if (items.length === 0) return;
    setBusy(true);
    for (const it of items) {
      const entry: Omit<CartItem, 'quantity'> = {
        productId: String(it.productId),
        name: it.productName,
        price: Number(it.price),
        retailPrice: it.retailPrice != null ? Number(it.retailPrice) : undefined,
        image: it.productImage,
        supplierId: it.supplierId,
      };
      add(entry, it.quantity);
    }
    router.push('/cart');
  };

  return (
    <button
      onClick={onClick}
      disabled={busy || items.length === 0}
      className={
        className ??
        'rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50'
      }
    >
      {busy ? 'Adding…' : label}
    </button>
  );
}
