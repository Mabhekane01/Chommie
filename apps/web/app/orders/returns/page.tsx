'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { rand } from '@/lib/format';
import { authConfigured, getUserId, safeAuthedFetch } from '@/lib/authed-fetch';

interface ReturnRequest {
  id: string;
  orderId: string;
  status?: string;
  reason?: string;
  refundAmount?: number;
  createdAt?: string;
}

export default function ReturnsPage() {
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!authConfigured) {
        setReady(true);
        return;
      }
      const uid = await getUserId();
      if (!uid) {
        setReady(true);
        return;
      }
      setSignedIn(true);
      const data = await safeAuthedFetch<ReturnRequest[]>(`/orders/returns/${uid}`, []);
      setItems(Array.isArray(data) ? data : []);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/orders" className="text-sm text-brand-600 hover:underline">
        ← Back to orders
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-charcoal">Returns &amp; refunds</h1>

      {!signedIn ? (
        <p className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>{' '}
          to see your returns.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          No returns yet. Open any delivered order to request one.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-sm border border-beige-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/orders/${r.orderId}`}
                    className="text-sm font-semibold text-charcoal hover:underline"
                  >
                    Order #{String(r.orderId).slice(0, 8)}
                  </Link>
                  {r.reason && <p className="mt-0.5 text-sm text-charcoal-800/70">{r.reason}</p>}
                  {r.createdAt && (
                    <p className="mt-1 text-xs text-charcoal-800/40">
                      Requested{' '}
                      {new Date(r.createdAt).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="rounded-sm bg-charcoal/5 px-2 py-0.5 text-xs font-medium text-charcoal-800/70">
                    {(r.status ?? 'requested').toLowerCase()}
                  </span>
                  {Number(r.refundAmount) > 0 && (
                    <p className="mt-1 text-sm font-bold text-charcoal">
                      {rand(Number(r.refundAmount))}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
