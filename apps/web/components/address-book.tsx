'use client';

import { useCallback, useEffect, useState } from 'react';
import { authedFetch, safeAuthedFetch, getUserId } from '@/lib/authed-fetch';
import { formatAddress, SA_PROVINCES, type Address } from '@/lib/address';

const field = 'w-full rounded-sm border border-beige-200 bg-white px-3 py-2 text-sm';

const EMPTY = {
  fullName: '',
  street: '',
  city: '',
  state: 'Gauteng',
  zip: '',
  country: 'South Africa',
  phone: '',
};

/**
 * Saved delivery addresses. `selectable` turns it into a checkout picker;
 * otherwise it's the account-page address book.
 */
export function AddressBook({
  selectable = false,
  selectedId,
  onSelect,
}: {
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (a: Address) => void;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const uid = await getUserId();
    if (!uid) {
      setReady(true);
      return;
    }
    const profile = await safeAuthedFetch<{ addresses?: Address[] }>(`/auth/profile/${uid}`, {});
    const list = profile?.addresses ?? [];
    setAddresses(list);
    setReady(true);
    // Auto-select the default (or first) address in checkout mode.
    if (selectable && !selectedId && list.length > 0) {
      onSelect?.(list.find((a) => a.isDefault) ?? list[0]);
    }
  }, [selectable, selectedId, onSelect]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!form.fullName.trim() || !form.street.trim() || !form.city.trim()) {
      setMsg('Name, street and city are required.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await authedFetch('/auth/address', {
        method: 'POST',
        body: JSON.stringify({ address: { ...form, id: crypto.randomUUID() } }),
      });
      setForm(EMPTY);
      setOpen(false);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not save address.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (addressId: string) => {
    const uid = await getUserId();
    if (!uid) return;
    setBusy(true);
    try {
      await authedFetch(`/auth/address/${uid}/${addressId}`, { method: 'DELETE' });
      await load();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <div>
      {addresses.length === 0 ? (
        <p className="rounded-sm border border-dashed border-beige-200 bg-white p-4 text-sm text-charcoal-800/60">
          No saved addresses yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {addresses.map((a) => {
            const active = selectable && selectedId === a.id;
            return (
              <li
                key={a.id}
                onClick={() => selectable && onSelect?.(a)}
                className={`rounded-sm border p-3 text-sm ${
                  active ? 'border-brand bg-brand/5' : 'border-beige-200 bg-white'
                } ${selectable ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-charcoal">
                      {a.fullName}
                      {a.isDefault && (
                        <span className="ml-2 rounded-sm bg-beige-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-charcoal-800/70">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-charcoal-800/70">{formatAddress(a)}</p>
                    {a.phone && <p className="text-xs text-charcoal-800/50">{a.phone}</p>}
                  </div>
                  {!selectable && (
                    <button
                      onClick={() => remove(a.id)}
                      disabled={busy}
                      className="text-xs text-charcoal-800/50 hover:text-red-600 disabled:opacity-50"
                    >
                      remove
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {msg && <p className="mt-2 text-sm text-red-700">{msg}</p>}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 rounded-sm border border-charcoal/20 px-4 py-2 text-sm font-semibold text-charcoal hover:border-charcoal"
        >
          + Add address
        </button>
      ) : (
        <div className="mt-3 space-y-2 rounded-sm border border-beige-200 bg-white p-4">
          <input className={field} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input className={field} placeholder="Street address" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <div className="flex gap-2">
            <input className={field} placeholder="City / township" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className={field} placeholder="Postal code" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <select className={field} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
              {SA_PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <input className={field} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50">
              {busy ? 'Saving…' : 'Save address'}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-sm px-4 py-2 text-sm text-charcoal-800/60 hover:text-charcoal">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
