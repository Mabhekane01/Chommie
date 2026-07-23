'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import { rand } from '@/lib/format';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
/**
 * Membership fees are stored in cents; catalogue prices come through in rands.
 * Keep the two formatters distinct — conflating them renders prices 100x off.
 */
const randCents = (cents: number) => rand(cents / 100);

interface Membership {
  type: string;
  status: string;
  monthlyFeeCents: number;
  region?: string;
  savingsToDateCents?: number;
}
interface BasketItem {
  id: string;
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export function MembershipManager() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [items, setItems] = useState<BasketItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        setToken(data.session?.access_token ?? null);
        setReady(true);
      });
  }, []);

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(`${API}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json();
    },
    [token],
  );

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setMembership(await authFetch('/membership'));
    } catch {
      setMembership(null);
    }
    try {
      const basket = await authFetch('/membership/basket');
      const list: BasketItem[] = basket?.items ?? [];
      // One batch lookup rather than a request per line.
      const products = await api.products.byIds(list.map((i) => i.productId));
      const byId = new Map(products.map((p) => [String(p.id ?? p._id), p]));
      setItems(
        list.map((it) => {
          const p = byId.get(it.productId);
          return p ? { ...it, name: p.name, price: p.discountPrice ?? p.price } : it;
        }),
      );
    } catch {
      setItems([]);
    }
  }, [token, authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(tag: string, fn: () => Promise<unknown>) {
    setBusy(tag);
    try {
      await fn();
      await load();
    } finally {
      setBusy(null);
    }
  }

  const join = (type: string) =>
    act('join', () => authFetch('/membership/join', { method: 'POST', body: JSON.stringify({ type }) }));
  const setStatus = (status: string) =>
    act('status', () =>
      authFetch('/membership/status', { method: 'POST', body: JSON.stringify({ status }) }),
    );
  const setQty = (productId: string, quantity: number) =>
    act(productId, () =>
      authFetch('/membership/basket', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    );
  const removeItem = (itemId: string) =>
    act(itemId, () => authFetch(`/membership/basket/${itemId}`, { method: 'DELETE' }));

  if (!ready) return null;

  if (!configured || !token) {
    return (
      <div className="mt-8 rounded-sm border border-beige-200 bg-white p-6">
        <p className="text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to join and manage your membership.
        </p>
      </div>
    );
  }

  const basketTotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  return (
    <div className="mt-8 space-y-6">
      {!membership ? (
        <div className="rounded-sm border border-beige-200 bg-white p-6">
          <h2 className="text-lg font-bold text-charcoal">Become a member</h2>
          <p className="mt-1 text-sm text-charcoal-800/60">
            Your fee funds the platform — staples stay near cost.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => join('HOUSEHOLD')}
              disabled={busy !== null}
              className="rounded-sm bg-brand px-4 py-3 text-left font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
            >
              Household · {randCents(9900)}/mo
              <span className="block text-xs font-normal">Standing monthly staples basket</span>
            </button>
            <button
              onClick={() => join('RESELLER')}
              disabled={busy !== null}
              className="rounded-sm border border-charcoal/20 px-4 py-3 text-left font-semibold text-charcoal hover:border-charcoal disabled:opacity-50"
            >
              Reseller · {randCents(29900)}/mo
              <span className="block text-xs font-normal">Wholesale-tier, volume-scaled</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-sm border border-beige-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal">
                {membership.type === 'RESELLER' ? 'Reseller' : 'Household'} member
              </h2>
              <p className="text-sm text-charcoal-800/60">
                {randCents(membership.monthlyFeeCents)}/mo ·{' '}
                <span className={membership.status === 'ACTIVE' ? 'text-brand-600' : ''}>
                  {membership.status.toLowerCase()}
                </span>
              </p>
              {membership.savingsToDateCents ? (
                <p className="mt-1 text-sm font-semibold text-brand-600">
                  You&apos;ve saved {randCents(membership.savingsToDateCents)} vs retail so far
                </p>
              ) : null}
            </div>
            {membership.status === 'ACTIVE' ? (
              <button
                onClick={() => setStatus('PAUSED')}
                disabled={busy !== null}
                className="rounded-sm border border-charcoal/20 px-3 py-1.5 text-sm font-semibold hover:border-charcoal disabled:opacity-50"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={() => setStatus('ACTIVE')}
                disabled={busy !== null}
                className="rounded-sm bg-brand px-3 py-1.5 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
              >
                Resume
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-sm border border-beige-200 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-charcoal">Your standing basket</h2>
          {items.length > 0 && (
            <span className="text-sm font-semibold text-charcoal">{rand(basketTotal)}/mo</span>
          )}
        </div>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-charcoal-800/60">
            Empty. Add staples from any{' '}
            <Link href="/staples" className="text-brand-600 hover:underline">
              product page
            </Link>{' '}
            — they&apos;ll arrive on your monthly cadence and shape your discovery feed.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-beige-200">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-2">
                <span className="flex-1 text-sm text-charcoal">{it.name ?? it.productId}</span>
                {it.price != null && (
                  <span className="text-xs text-charcoal-800/50">{rand(it.price)}</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQty(it.productId, Math.max(0, it.quantity - 1))}
                    disabled={busy !== null}
                    className="h-6 w-6 rounded-sm border border-beige-200 text-charcoal disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{it.quantity}</span>
                  <button
                    onClick={() => setQty(it.productId, it.quantity + 1)}
                    disabled={busy !== null}
                    className="h-6 w-6 rounded-sm border border-beige-200 text-charcoal disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(it.id)}
                  disabled={busy !== null}
                  className="text-xs text-charcoal-800/50 hover:text-red-600 disabled:opacity-50"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
