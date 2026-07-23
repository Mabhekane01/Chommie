'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

/** Adds a product to the signed-in member's standing basket (do.md §3.2). */
export function AddToStandingBasket({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const add = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (!configured) {
        window.location.href = '/login';
        return;
      }
      const { data } = await createClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const res = await fetch(`${API}/membership/basket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error();
      setMsg('Added to your standing basket ✓');
    } catch {
      setMsg('Could not add — please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        onClick={add}
        disabled={busy}
        className="rounded-sm border border-charcoal/20 px-5 py-2.5 font-semibold text-charcoal hover:border-charcoal transition-colors disabled:opacity-50"
      >
        {busy ? 'Adding…' : 'Add to standing basket'}
      </button>
      {msg && <p className="mt-2 text-xs text-brand-600">{msg}</p>}
    </div>
  );
}
