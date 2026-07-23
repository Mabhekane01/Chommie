'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { authConfigured, authedFetch, getUserId, safeAuthedFetch } from '@/lib/authed-fetch';

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const uid = await getUserId();
    if (!uid) {
      setReady(true);
      return;
    }
    setSignedIn(true);
    const data = await safeAuthedFetch<Notification[]>(`/notifications/${uid}`, []);
    setItems(Array.isArray(data) ? data : []);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!authConfigured) {
      setReady(true);
      return;
    }
    load();
  }, [load]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await authedFetch(`/notifications/${id}/read`, { method: 'POST' });
    } catch {
      /* optimistic — refresh will correct */
    }
  };

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal">Notifications</h1>

      {!signedIn ? (
        <p className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>{' '}
          to see your updates.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          Nothing yet. Order updates and circle activity will show up here.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-sm border p-4 ${
                n.isRead ? 'border-beige-200 bg-white' : 'border-brand/40 bg-brand/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-charcoal">{n.title}</p>
                  <p className="mt-0.5 text-sm text-charcoal-800/70">{n.message}</p>
                  {n.createdAt && (
                    <p className="mt-1 text-xs text-charcoal-800/40">
                      {new Date(n.createdAt).toLocaleString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="whitespace-nowrap text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
