'use client';

import { useState } from 'react';
import type { IProduct } from '@chommie/shared-types';
import { useCart } from '@/lib/cart';

export function AddToCart({ product }: { product: IProduct }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inStock = (product.stock ?? 0) > 0;

  const onClick = () => {
    add(
      {
        productId: String(product.id ?? product._id),
        name: product.name,
        price: product.discountPrice ?? product.price,
        retailPrice: product.retailPrice,
        image: product.images?.[0],
        supplierId: product.supplierId,
        stock: product.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-sm border border-beige-200 bg-white">
        <button
          onClick={() => setQty((n) => Math.max(1, n - 1))}
          className="h-10 w-9 text-charcoal hover:bg-beige"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-charcoal">{qty}</span>
        <button
          onClick={() => setQty((n) => Math.min(Math.min(product.stock ?? 99, 99), n + 1))}
          className="h-10 w-9 text-charcoal hover:bg-beige"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        onClick={onClick}
        disabled={!inStock}
        className="rounded-sm bg-brand px-5 py-2.5 font-semibold text-charcoal hover:bg-brand-600 transition-colors disabled:opacity-50"
      >
        {!inStock ? 'Out of stock' : added ? 'Added ✓' : 'Add to basket'}
      </button>
    </div>
  );
}
