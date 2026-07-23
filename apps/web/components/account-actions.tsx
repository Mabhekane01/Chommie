'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AccountActions() {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const registerPasskey = async () => {
    setBusy('passkey');
    setMsg(null);
    try {
      const { error } = await createClient().auth.registerPasskey();
      setMsg(error ? error.message : 'Passkey added — you can use it to sign in next time.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not add passkey.');
    } finally {
      setBusy(null);
    }
  };

  const signOut = async () => {
    setBusy('signout');
    try {
      await createClient().auth.signOut();
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={registerPasskey}
        disabled={busy !== null}
        className="w-full rounded-sm bg-charcoal px-4 py-2.5 font-semibold text-beige hover:bg-charcoal-800 disabled:opacity-50"
      >
        {busy === 'passkey' ? 'Following the passkey prompt…' : '🔑 Add a passkey to this account'}
      </button>
      <button
        onClick={signOut}
        disabled={busy !== null}
        className="w-full rounded-sm border border-charcoal/20 px-4 py-2.5 font-semibold text-charcoal hover:border-charcoal disabled:opacity-50"
      >
        Sign out
      </button>
      {msg && <p className="rounded-sm bg-brand/10 p-3 text-sm text-brand-600">{msg}</p>}
    </div>
  );
}
