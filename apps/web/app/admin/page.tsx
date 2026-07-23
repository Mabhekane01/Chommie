'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { rand } from '@/lib/format';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

interface Supplier {
  id: string;
  name: string;
  region?: string;
  blackOwned: boolean;
  localProducer: boolean;
  reliabilityScore: number;
}

interface Agreement {
  id: string;
  supplierId: string;
  productId?: string;
  category?: string;
  minVolumeUnits: number;
  cappedPriceCents: number;
  termMonths: number;
  status: string;
}

interface DemandRow {
  productId: string;
  standingQty: number;
  circleQty: number;
  members: number;
  totalDemand: number;
  coveredVolume: number;
  uncoveredVolume: number;
}

const input = 'w-full rounded-sm border border-beige-200 bg-white px-3 py-2 text-sm';
const btn =
  'rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50';

/**
 * Chommie ops console (do.md §5, §3.6) — the retailer's internal replacement for
 * the old vendor portal: suppliers, off-take agreements, the demand forecast,
 * and marketplace ad campaigns. NOTE: gate behind an admin role before prod.
 */
export default function AdminPage() {
  const [signedIn, setSignedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [ready, setReady] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [demand, setDemand] = useState<DemandRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [sup, setSup] = useState({ name: '', region: '', blackOwned: false, localProducer: false });
  const [ot, setOt] = useState({ supplierId: '', productId: '', minVolumeUnits: '', cappedPriceCents: '', termMonths: '3' });
  const [camp, setCamp] = useState({ advertiserId: '', productId: '', bidCents: '', dailyBudgetCents: '' });

  const load = useCallback(async (tok: string) => {
    const auth = { Authorization: `Bearer ${tok}` };
    const get = async <T,>(path: string, fallback: T): Promise<T> => {
      try {
        const r = await fetch(`${API}${path}`, { headers: auth });
        if (r.status === 403) {
          setForbidden(true);
          return fallback;
        }
        return r.ok ? await r.json() : fallback;
      } catch {
        return fallback;
      }
    };
    const [s, a, d] = await Promise.all([
      get<Supplier[]>('/suppliers', []),
      get<Agreement[]>('/offtake', []),
      get<DemandRow[]>('/demand-forecast', []),
    ]);
    setSuppliers(Array.isArray(s) ? s : []);
    setAgreements(Array.isArray(a) ? a : []);
    setDemand(Array.isArray(d) ? d : []);
  }, []);

  useEffect(() => {
    (async () => {
      if (configured) {
        const supabase = createClient();
        const { data: sess } = await supabase.auth.getSession();
        const tok = sess.session?.access_token ?? null;
        setToken(tok);
        setSignedIn(!!tok);
        if (tok) await load(tok);
      }
      setReady(true);
    })();
  }, [load]);

  const post = async (tag: string, path: string, body: unknown, after?: () => void) => {
    if (!token) return;
    setBusy(tag);
    setMsg(null);
    try {
      const res = await fetch(`${API}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.status === 403) throw new Error('Admin access required.');
      if (!res.ok || data?.error) throw new Error(data?.message || data?.error || `Failed (${res.status})`);
      after?.();
      await load(token);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setBusy(null);
    }
  };

  if (!ready) return null;

  if (forbidden) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-charcoal">Ops console</h1>
        <p className="mt-3 rounded-sm bg-red-50 p-4 text-sm text-red-700">
          Your account doesn&apos;t have admin access. Ask an operator to add your email to
          <code className="ml-1">ADMIN_EMAILS</code> or set your Supabase role to admin.
        </p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-charcoal">Ops console</h1>
        <p className="mt-3 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>{' '}
          to manage suppliers, off-take and campaigns.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal">Ops console</h1>
      <p className="mt-1 text-sm text-charcoal-800/60">
        Supply side &amp; marketplace advertising — internal only.
      </p>
      {msg && <p className="mt-3 rounded-sm bg-red-50 p-3 text-sm text-red-700">{msg}</p>}

      {/* Demand forecast — the negotiating asset (do.md §5.4) */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-charcoal">Demand forecast</h2>
        <p className="text-xs text-charcoal-800/50">
          Standing baskets + pooled circle demand vs active off-take coverage.
        </p>
        {demand.length === 0 ? (
          <p className="mt-2 rounded-sm border border-dashed border-beige-200 bg-white p-4 text-sm text-charcoal-800/60">
            No demand data yet (needs live services + seeded baskets).
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-sm border border-beige-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-beige-200/60 text-xs uppercase text-charcoal-800/60">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Standing</th>
                  <th className="px-3 py-2 text-right">Circles</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Covered</th>
                  <th className="px-3 py-2 text-right">Uncovered</th>
                </tr>
              </thead>
              <tbody>
                {demand.map((r) => (
                  <tr key={r.productId} className="border-t border-beige-200">
                    <td className="px-3 py-2 font-mono text-xs">{r.productId.slice(0, 10)}…</td>
                    <td className="px-3 py-2 text-right">{r.standingQty}</td>
                    <td className="px-3 py-2 text-right">{r.circleQty}</td>
                    <td className="px-3 py-2 text-right font-semibold">{r.totalDemand}</td>
                    <td className="px-3 py-2 text-right">{r.coveredVolume}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${r.uncoveredVolume > 0 ? 'text-red-600' : 'text-brand-600'}`}>
                      {r.uncoveredVolume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Suppliers */}
        <section>
          <h2 className="text-lg font-bold text-charcoal">Suppliers ({suppliers.length})</h2>
          <ul className="mt-3 space-y-2">
            {suppliers.map((s) => (
              <li key={s.id} className="rounded-sm border border-beige-200 bg-white p-3 text-sm">
                <span className="font-semibold text-charcoal">{s.name}</span>
                <span className="ml-2 text-xs text-charcoal-800/50">
                  {s.region}
                  {s.blackOwned && ' · Black-owned'}
                  {s.localProducer && ' · Local'} · reliability {s.reliabilityScore}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 rounded-sm border border-beige-200 bg-white p-4">
            <p className="text-sm font-semibold text-charcoal">Add supplier</p>
            <input className={input} placeholder="Name" value={sup.name} onChange={(e) => setSup({ ...sup, name: e.target.value })} />
            <input className={input} placeholder="Region" value={sup.region} onChange={(e) => setSup({ ...sup, region: e.target.value })} />
            <div className="flex gap-4 text-sm text-charcoal">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={sup.blackOwned} onChange={(e) => setSup({ ...sup, blackOwned: e.target.checked })} className="accent-brand" />
                Black-owned
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={sup.localProducer} onChange={(e) => setSup({ ...sup, localProducer: e.target.checked })} className="accent-brand" />
                Local producer
              </label>
            </div>
            <button
              className={btn}
              disabled={busy !== null || !sup.name.trim()}
              onClick={() =>
                post('supplier', '/suppliers', sup, () =>
                  setSup({ name: '', region: '', blackOwned: false, localProducer: false }),
                )
              }
            >
              {busy === 'supplier' ? 'Adding…' : 'Add supplier'}
            </button>
          </div>
        </section>

        {/* Off-take agreements */}
        <section>
          <h2 className="text-lg font-bold text-charcoal">Off-take agreements ({agreements.length})</h2>
          <ul className="mt-3 space-y-2">
            {agreements.map((a) => (
              <li key={a.id} className="rounded-sm border border-beige-200 bg-white p-3 text-sm">
                <span className="font-semibold text-charcoal">
                  {a.minVolumeUnits} units @ {rand(a.cappedPriceCents / 100)} · {a.termMonths}mo
                </span>
                <span className="ml-2 text-xs text-charcoal-800/50">
                  {a.productId ? `product ${a.productId.slice(0, 8)}…` : a.category} · {a.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 rounded-sm border border-beige-200 bg-white p-4">
            <p className="text-sm font-semibold text-charcoal">New agreement</p>
            <select className={input} value={ot.supplierId} onChange={(e) => setOt({ ...ot, supplierId: e.target.value })}>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input className={input} placeholder="Product ID" value={ot.productId} onChange={(e) => setOt({ ...ot, productId: e.target.value })} />
            <div className="flex gap-2">
              <input className={input} placeholder="Min units" inputMode="numeric" value={ot.minVolumeUnits} onChange={(e) => setOt({ ...ot, minVolumeUnits: e.target.value })} />
              <input className={input} placeholder="Capped price (cents)" inputMode="numeric" value={ot.cappedPriceCents} onChange={(e) => setOt({ ...ot, cappedPriceCents: e.target.value })} />
              <input className={input} placeholder="Months" inputMode="numeric" value={ot.termMonths} onChange={(e) => setOt({ ...ot, termMonths: e.target.value })} />
            </div>
            <button
              className={btn}
              disabled={busy !== null || !ot.supplierId || !ot.minVolumeUnits}
              onClick={() =>
                post(
                  'offtake',
                  '/offtake',
                  {
                    supplierId: ot.supplierId,
                    productId: ot.productId || undefined,
                    minVolumeUnits: Number(ot.minVolumeUnits) || 0,
                    cappedPriceCents: Number(ot.cappedPriceCents) || 0,
                    termMonths: Number(ot.termMonths) || 3,
                  },
                  () => setOt({ supplierId: '', productId: '', minVolumeUnits: '', cappedPriceCents: '', termMonths: '3' }),
                )
              }
            >
              {busy === 'offtake' ? 'Creating…' : 'Create agreement'}
            </button>
          </div>
        </section>
      </div>

      {/* Ad campaigns (marketplace tier only — staples are rejected by the ad-service) */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-charcoal">Sponsored placement</h2>
        <p className="text-xs text-charcoal-800/50">
          Marketplace tier only — a campaign on a staple is rejected (do.md §3.6).
        </p>
        <div className="mt-3 grid gap-2 rounded-sm border border-beige-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <input className={input} placeholder="Advertiser ID" value={camp.advertiserId} onChange={(e) => setCamp({ ...camp, advertiserId: e.target.value })} />
          <input className={input} placeholder="Product ID" value={camp.productId} onChange={(e) => setCamp({ ...camp, productId: e.target.value })} />
          <input className={input} placeholder="Bid (cents)" inputMode="numeric" value={camp.bidCents} onChange={(e) => setCamp({ ...camp, bidCents: e.target.value })} />
          <input className={input} placeholder="Daily budget (cents)" inputMode="numeric" value={camp.dailyBudgetCents} onChange={(e) => setCamp({ ...camp, dailyBudgetCents: e.target.value })} />
          <button
            className={`${btn} sm:col-span-2 lg:col-span-4`}
            disabled={busy !== null || !camp.advertiserId || !camp.productId}
            onClick={() =>
              post(
                'campaign',
                '/ads/campaigns',
                {
                  advertiserId: camp.advertiserId,
                  productId: camp.productId,
                  bidCents: Number(camp.bidCents) || 0,
                  dailyBudgetCents: Number(camp.dailyBudgetCents) || 0,
                },
                () => setCamp({ advertiserId: '', productId: '', bidCents: '', dailyBudgetCents: '' }),
              )
            }
          >
            {busy === 'campaign' ? 'Creating…' : 'Create campaign'}
          </button>
        </div>
      </section>
    </div>
  );
}
