'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="hover:text-brand transition-colors">
      Basket
      {count > 0 && (
        <span className="ml-1 rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-charcoal">
          {count}
        </span>
      )}
    </Link>
  );
}
