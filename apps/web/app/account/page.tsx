'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { rand } from '@/lib/format';
import { AccountActions } from '@/components/account-actions';
import { AddressBook } from '@/components/address-book';
import { authConfigured, getUserId, safeAuthedFetch } from '@/lib/authed-fetch';
import { createClient } from '@/lib/supabase/client';

interface Membership {
  type?: string;
  status?: string;
  monthlyFeeCents?: number;
  savingsToDateCents?: number;
}
interface Order {
  id: string;
  totalAmount: number;
  savingsAmount?: number;
  status: string;
  createdAt: string;
}
interface Trust {
  trustScore?: number;
  coins?: number;
  trustCoins?: number;
}
interface Circle {
  id: string;
  name: string;
  discountTier: string;
  extraDiscountPct: number;
}

const LINKS = [
  { href: '/orders', label: 'Orders & tracking', desc: 'Track deliveries and request returns' },
  { href: '/membership', label: 'Membership & standing basket', desc: 'Your plan and monthly staples' },
  { href: '/circles', label: 'Buying circles', desc: 'Pool demand for a deeper discount' },
  { href: '/bnpl', label: 'Pay later & Trust Score', desc: 'Installments and Trust Coins' },
  { href: '/wishlist', label: 'Wishlist', desc: 'Items you saved' },
  { href: '/notifications', label: 'Notifications', desc: 'Order and circle updates' },
];

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trust, setTrust] = useState<Trust | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    (async () => {
      if (!authConfigured) {
        setReady(true);
        return;
      }
      const { data } = await createClient().auth.getUser();
      if (!data.user) {
        setReady(true);
        return;
      }
      setEmail(data.user.email ?? data.user.phone ?? 'Signed in');
      const uid = (await getUserId()) ?? '';
      const [m, o, t, c] = await Promise.all([
        safeAuthedFetch<Membership | null>('/membership', null),
        safeAuthedFetch<Order[]>(`/orders/user/${uid}`, []),
        safeAuthedFetch<Trust | null>(`/bnpl/trust-score/${uid}`, null),
        safeAuthedFetch<Circle[]>('/circles/mine', []),
      ]);
      setMembership(m);
      setOrders(Array.isArray(o) ? o : []);
      setTrust(t);
      setCircles(Array.isArray(c) ? c : []);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  if (!email) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-charcoal">Your account</h1>
        <p className="mt-3 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>{' '}
          to see your savings, orders and membership.
        </p>
      </div>
    );
  }

  const savings = (membership?.savingsToDateCents ?? 0) / 100;
  const feeYear = ((membership?.monthlyFeeCents ?? 0) / 100) * 12;
  const coins = trust?.coins ?? trust?.trustCoins ?? 0;
  const bestCircle = circles.reduce<Circle | null>(
    (best, c) => (!best || c.extraDiscountPct > best.extraDiscountPct ? c : best),
    null,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal">Your account</h1>
      <p className="mt-1 text-sm text-charcoal-800/60">{email}</p>

      {/* The proof: savings vs the fee — do.md §6 */}
      <section className="mt-6 rounded-sm bg-charcoal p-6 text-beige">
        <p className="text-xs uppercase tracking-wide text-beige/50">Saved vs retail so far</p>
        <p className="mt-1 text-4xl font-extrabold text-brand">{rand(savings)}</p>
        {feeYear > 0 && (
          <p className="mt-1 text-sm text-beige/70">
            {savings >= feeYear
              ? `That's more than a full year of membership (${rand(feeYear)}). The model is working for you.`
              : `Membership costs ${rand(feeYear)}/year — keep stocking staples to pull ahead.`}
          </p>
        )}
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-beige-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-charcoal-800/50">Membership</p>
          <p className="mt-1 font-bold text-charcoal">
            {membership ? (membership.type === 'RESELLER' ? 'Reseller' : 'Household') : 'Not a member'}
          </p>
          <p className="text-xs text-charcoal-800/50">
            {membership ? membership.status?.toLowerCase() : 'Join to unlock near-cost staples'}
          </p>
        </div>
        <div className="rounded-sm border border-beige-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-charcoal-800/50">Trust Score</p>
          <p className="mt-1 font-bold text-charcoal">{trust?.trustScore ?? '—'}</p>
          <p className="text-xs text-charcoal-800/50">{coins} Trust Coins</p>
        </div>
        <div className="rounded-sm border border-beige-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-charcoal-800/50">Best circle</p>
          <p className="mt-1 font-bold text-charcoal">
            {bestCircle ? `+${bestCircle.extraDiscountPct}%` : 'None yet'}
          </p>
          <p className="truncate text-xs text-charcoal-800/50">
            {bestCircle ? bestCircle.name : 'Join a circle for a deeper tier'}
          </p>
        </div>
      </div>

      {orders.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-charcoal">Recent orders</h2>
            <Link href="/orders" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {orders.slice(0, 3).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="flex items-center justify-between rounded-sm border border-beige-200 bg-white p-3 text-sm hover:shadow-sm"
                >
                  <span className="text-charcoal">
                    #{String(o.id).slice(0, 8)}
                    <span className="ml-2 text-xs text-charcoal-800/50">{o.status?.toLowerCase()}</span>
                  </span>
                  <span className="font-semibold text-charcoal">{rand(Number(o.totalAmount))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-charcoal">Delivery addresses</h2>
        <div className="mt-3">
          <AddressBook />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-charcoal">Manage</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-sm border border-beige-200 bg-white p-4 hover:shadow-sm"
            >
              <p className="font-semibold text-charcoal">{l.label}</p>
              <p className="text-xs text-charcoal-800/60">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-charcoal">Security</h2>
        <AccountActions />
      </section>
    </div>
  );
}
