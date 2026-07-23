'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart, type PriceChange } from '@/lib/cart';
import { rand } from '@/lib/format';

export default function CartPage() {
  const { items, subtotal, retailTotal, savings, setQty, remove, revalidate } = useCart();
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const checked = useRef(false);

  // Re-price the stored basket once per visit, before anyone reads the totals.
  // The cart hydrates from localStorage in an effect, so `items` is empty on the
  // first render — wait for it to fill before latching, or we'd never re-price.
  useEffect(() => {
    if (checked.current || items.length === 0) return;
    checked.current = true;
    revalidate().then(setChanges).catch(() => {});
  }, [revalidate, items.length]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-charcoal">Your basket</h1>
        <p className="mt-3 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          Your basket is empty.{' '}
          <Link href="/staples" className="font-semibold text-brand-600 hover:underline">
            Browse staples
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal">Your basket</h1>

      {changes.length > 0 && (
        <div className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm">
          <p className="font-semibold text-charcoal">Prices updated since you last shopped</p>
          <ul className="mt-2 space-y-1 text-charcoal-800/70">
            {changes.map((c) => (
              <li key={c.productId} className="flex justify-between gap-3">
                <span className="truncate">{c.name}</span>
                <span className="whitespace-nowrap">
                  <span className="line-through">{rand(c.from)}</span>{' '}
                  <span className={c.to < c.from ? 'font-semibold text-brand-600' : 'text-charcoal'}>
                    {rand(c.to)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-6 divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
        {items.map((it) => (
          <li key={it.productId} className="flex items-center gap-3 p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-beige-200">
              {it.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal">{it.name}</p>
              <p className="text-xs text-charcoal-800/60">
                {rand(it.price)} each
                {it.retailPrice && it.retailPrice > it.price && (
                  <span className="ml-1 line-through">{rand(it.retailPrice)}</span>
                )}
              </p>
              {it.stock != null && it.stock > 0 && it.quantity >= it.stock && (
                <p className="text-xs font-semibold text-charcoal-800/50">
                  Only {it.stock} in stock
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQty(it.productId, it.quantity - 1)}
                className="h-7 w-7 rounded-sm border border-beige-200 text-charcoal"
              >
                −
              </button>
              <span className="w-7 text-center text-sm">{it.quantity}</span>
              <button
                onClick={() => setQty(it.productId, it.quantity + 1)}
                className="h-7 w-7 rounded-sm border border-beige-200 text-charcoal"
              >
                +
              </button>
            </div>
            <span className="w-20 text-right text-sm font-semibold text-charcoal">
              {rand(it.price * it.quantity)}
            </span>
            <button
              onClick={() => remove(it.productId)}
              className="text-xs text-charcoal-800/50 hover:text-red-600"
            >
              remove
            </button>
          </li>
        ))}
      </ul>

      {savings > 0 && (
        <div className="mt-4 rounded-sm bg-brand/10 p-4 text-sm">
          <div className="flex justify-between text-charcoal-800/70">
            <span>Same basket at retail</span>
            <span className="line-through">{rand(retailTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between font-bold text-brand-600">
            <span>You save</span>
            <span>{rand(savings)}</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-charcoal-800/60">Subtotal</p>
          <p className="text-xl font-bold text-charcoal">{rand(subtotal)}</p>
          <p className="text-xs text-charcoal-800/50">
            Circle &amp; member pricing applied at checkout.
          </p>
        </div>
        <Link
          href="/checkout"
          className="rounded-sm bg-brand px-6 py-3 font-semibold text-charcoal hover:bg-brand-600 transition-colors"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
