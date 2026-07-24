'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { tierProgress } from '@/lib/circle-tiers';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

interface Circle {
  id: string;
  name: string;
  type: string;
  region?: string;
  inviteCode: string;
  discountTier: string;
  extraDiscountPct: number;
  memberCount?: number;
}

/** One circle, with progress toward the next discount tier (do.md §3.3). */
function CircleRow({ circle: c }: { circle: Circle }) {
  const [copied, setCopied] = useState(false);
  const members = c.memberCount ?? 1;
  const { next, needed, fraction } = tierProgress(members);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the code is visible next to the button anyway */
    }
  };

  return (
    <li className="rounded-sm border border-beige-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-charcoal">{c.name}</span>
        <span className="whitespace-nowrap rounded-sm bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand-600">
          {c.extraDiscountPct > 0 ? `${c.discountTier.replace('CIRCLE_', '')} · +${c.extraDiscountPct}%` : 'No tier yet'}
        </span>
      </div>

      <p className="mt-1 text-xs text-charcoal-800/60">
        {members} member{members === 1 ? '' : 's'}
        {c.region ? ` · ${c.region}` : ''}
      </p>

      {/* The recruiting nudge: what the next tier is worth, in members. */}
      {next ? (
        <div className="mt-3">
          <div className="flex justify-between text-xs">
            <span className="text-charcoal-800/70">
              {needed} more member{needed === 1 ? '' : 's'} to {next.label}
            </span>
            <span className="font-semibold text-brand-600">+{next.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-beige-200">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.round(fraction * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-brand-600">
          Gold tier — the deepest circle discount.
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-beige-200 pt-3">
        <span className="text-xs text-charcoal-800/50">Invite code</span>
        <code className="rounded-sm bg-beige-200/60 px-2 py-0.5 text-xs font-semibold text-charcoal">
          {c.inviteCode}
        </code>
        <button onClick={copy} className="text-xs font-semibold text-brand-600 hover:underline">
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
    </li>
  );
}

/** Signed-in members create/join circles; the gateway derives their id from the token. */
export function CircleManager() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [invite, setInvite] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

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
      const mine = await authFetch('/circles/mine');
      setCircles(Array.isArray(mine) ? mine : []);
    } catch {
      /* keep prior list */
    }
  }, [token, authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setBusy('create');
    setMsg(null);
    try {
      await authFetch('/circles', {
        method: 'POST',
        body: JSON.stringify({ name, region, type: 'STOKVEL' }),
      });
      setName('');
      setRegion('');
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not create circle.');
    } finally {
      setBusy(null);
    }
  };

  const join = async () => {
    setBusy('join');
    setMsg(null);
    try {
      const res = await authFetch('/circles/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: invite }),
      });
      if (res?.error) setMsg('That invite code was not found.');
      setInvite('');
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not join circle.');
    } finally {
      setBusy(null);
    }
  };

  if (!ready) return null;

  if (!configured || !token) {
    return (
      <div className="mt-8 rounded-sm border border-beige-200 bg-white p-6">
        <p className="text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to create or join a buying circle.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-charcoal">Your circles</h2>
        {circles.length === 0 ? (
          <p className="mt-2 text-sm text-charcoal-800/60">You&apos;re not in a circle yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {circles.map((c) => (
              <CircleRow key={c.id} circle={c} />
            ))}
          </ul>
        )}
      </div>

      {msg && <p className="rounded-sm bg-red-50 p-3 text-sm text-red-700">{msg}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-beige-200 bg-white p-4">
          <h3 className="font-semibold text-charcoal">Start a circle</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Circle name"
            className="mt-2 w-full rounded-sm border border-beige-200 px-3 py-2 text-sm"
          />
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Area (e.g. Soweto)"
            className="mt-2 w-full rounded-sm border border-beige-200 px-3 py-2 text-sm"
          />
          <button
            onClick={create}
            disabled={busy !== null || !name.trim()}
            className="mt-3 w-full rounded-sm bg-brand px-4 py-2 font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
          >
            {busy === 'create' ? 'Creating…' : 'Create circle'}
          </button>
        </div>

        <div className="rounded-sm border border-beige-200 bg-white p-4">
          <h3 className="font-semibold text-charcoal">Join with a code</h3>
          <input
            value={invite}
            onChange={(e) => setInvite(e.target.value.toUpperCase())}
            placeholder="Invite code"
            className="mt-2 w-full rounded-sm border border-beige-200 px-3 py-2 text-sm uppercase"
          />
          <button
            onClick={join}
            disabled={busy !== null || !invite.trim()}
            className="mt-3 w-full rounded-sm border border-charcoal/20 px-4 py-2 font-semibold text-charcoal hover:border-charcoal disabled:opacity-50"
          >
            {busy === 'join' ? 'Joining…' : 'Join circle'}
          </button>
        </div>
      </div>
    </div>
  );
}
