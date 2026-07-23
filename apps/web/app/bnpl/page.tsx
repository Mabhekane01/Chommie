'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { rand } from '@/lib/format';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

interface TrustProfile {
  trustScore?: number;
  coins?: number;
  trustCoins?: number;
}

interface Installment {
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

interface Plan {
  id: string;
  orderId: string;
  totalAmount: number;
  remainingBalance: number;
  status: string;
  installments: Installment[];
}

export default function BnplPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (uid: string, tok: string) => {
    const auth = { Authorization: `Bearer ${tok}` };
    try {
      const [p, pl] = await Promise.all([
        fetch(`${API}/bnpl/trust-score/${uid}`, { headers: auth }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API}/bnpl/plans/${uid}`, { headers: auth }).then((r) => (r.ok ? r.json() : [])),
      ]);
      setProfile(p);
      setPlans(Array.isArray(pl) ? pl : []);
    } catch {
      /* leave empty */
    }
  }, []);

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
      if (data.user && tok) {
        setUserId(data.user.id);
        setToken(tok);
        await load(data.user.id, tok);
      }
      setReady(true);
    })();
  }, [load]);

  const pay = async (planId: string, installmentIndex: number) => {
    setBusy(`${planId}-${installmentIndex}`);
    try {
      await fetch(`${API}/bnpl/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ planId, installmentIndex }),
      });
      if (userId && token) await load(userId, token);
    } finally {
      setBusy(null);
    }
  };

  if (!ready) return null;

  const coins = profile?.coins ?? profile?.trustCoins ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal">Pay later &amp; Trust Score</h1>
      <p className="mt-1 text-sm text-charcoal-800/60">
        Pay staples off in installments. On-time payments grow your Trust Score and unlock more.
      </p>

      {!userId ? (
        <p className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to see your Trust Score and plans.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-beige-200 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-charcoal-800/50">Trust Score</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-600">
                {profile?.trustScore ?? '—'}
              </p>
            </div>
            <div className="rounded-sm border border-beige-200 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-charcoal-800/50">Trust Coins</p>
              <p className="mt-1 text-3xl font-extrabold text-charcoal">{coins}</p>
              <p className="text-xs text-charcoal-800/50">100 coins = R1 off at checkout</p>
            </div>
          </div>

          <h2 className="mt-8 text-lg font-bold text-charcoal">Your payment plans</h2>
          {plans.length === 0 ? (
            <p className="mt-2 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
              No active plans. Choose &quot;BNPL&quot; at checkout to pay in installments.
            </p>
          ) : (
            <ul className="mt-3 space-y-4">
              {plans.map((plan) => (
                <li key={plan.id} className="rounded-sm border border-beige-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-charcoal">
                      Order #{String(plan.orderId).slice(0, 8)}
                    </p>
                    <span className="text-xs font-medium text-charcoal-800/60">{plan.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal-800/70">
                    {rand(Number(plan.remainingBalance))} remaining of {rand(Number(plan.totalAmount))}
                  </p>
                  <ul className="mt-3 divide-y divide-beige-200">
                    {(plan.installments ?? []).map((inst, i) => (
                      <li key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-charcoal-800/70">
                          {new Date(inst.dueDate).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          · {rand(Number(inst.amount))}
                        </span>
                        {inst.status === 'PAID' ? (
                          <span className="text-xs font-semibold text-brand-600">Paid ✓</span>
                        ) : (
                          <button
                            onClick={() => pay(plan.id, i)}
                            disabled={busy !== null}
                            className="rounded-sm bg-brand px-3 py-1 text-xs font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
                          >
                            {busy === `${plan.id}-${i}` ? 'Paying…' : inst.status === 'OVERDUE' ? 'Pay now (overdue)' : 'Pay'}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
