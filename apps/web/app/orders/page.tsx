'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { rand } from '@/lib/format';
import { ReorderButton, type ReorderItem } from '@/components/reorder-button';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

interface Order {
  id: string;
  totalAmount: number;
  savingsAmount?: number;
  status: string;
  createdAt: string;
  items?: ReorderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const { data: u } = await supabase.auth.getUser();
      if (!token || !u.user) {
        setReady(true);
        return;
      }
      setSignedIn(true);
      try {
        const res = await fetch(`${API}/orders/user/${u.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch {
        /* leave empty */
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Your orders</h1>
        <Link href="/orders/returns" className="text-sm font-semibold text-brand-600 hover:underline">
          Returns &amp; refunds
        </Link>
      </div>

      {!signedIn ? (
        <p className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to see your orders.
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-4 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          No orders yet.{' '}
          <Link href="/staples" className="font-semibold text-brand-600 hover:underline">
            Start with staples
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-sm border border-beige-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <Link href={`/orders/${o.id}`} className="block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-charcoal">#{String(o.id).slice(0, 8)}</p>
                  <p className="text-xs text-charcoal-800/50">
                    {new Date(o.createdAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">{rand(Number(o.totalAmount))}</p>
                  <span className="rounded-sm bg-charcoal/5 px-2 py-0.5 text-xs font-medium text-charcoal-800/70">
                    {o.status?.toLowerCase()}
                  </span>
                </div>
              </div>

              {o.items && o.items.length > 0 && (
                <p className="mt-2 truncate text-xs text-charcoal-800/60">
                  {o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                </p>
              )}

              {Number(o.savingsAmount) > 0 && (
                <p className="mt-1 text-xs font-semibold text-brand-600">
                  Saved {rand(Number(o.savingsAmount))} vs retail
                </p>
              )}
              </Link>

              {o.items && o.items.length > 0 && (
                <div className="mt-3 border-t border-beige-200 pt-3">
                  <ReorderButton
                    items={o.items}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
