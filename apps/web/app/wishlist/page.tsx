'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IProduct } from '@chommie/shared-types';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/product-card';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export default function WishlistPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const { data: sess } = await supabase.auth.getSession();
      const tok = sess.session?.access_token;
      if (!data.user || !tok) {
        setReady(true);
        return;
      }
      setSignedIn(true);
      try {
        const res = await fetch(`${API}/wishlist/${data.user.id}`, { headers: { Authorization: `Bearer ${tok}` } });
        const wishlist = await res.json();
        const ids: string[] = (wishlist?.productIds ?? wishlist?.products ?? wishlist ?? [])
          .map((x: { productId?: string; _id?: string } | string) =>
            typeof x === 'string' ? x : x?.productId ?? x?._id ?? '',
          )
          .filter(Boolean);
        const fetched = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`${API}/products/${id}`);
              return r.ok ? ((await r.json()) as IProduct) : null;
            } catch {
              return null;
            }
          }),
        );
        setProducts(fetched.filter((p): p is IProduct => !!p));
      } catch {
        /* leave empty */
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal">Your wishlist</h1>

      {!signedIn ? (
        <p className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to see the items you&apos;ve saved.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-4 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          Nothing saved yet — tap ♡ on any product.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id ?? p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
