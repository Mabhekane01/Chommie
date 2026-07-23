'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authConfigured, getUserId, safeAuthedFetch } from '@/lib/authed-fetch';

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!authConfigured) return;
    (async () => {
      const uid = await getUserId();
      if (!uid) return;
      setShow(true);
      const items = await safeAuthedFetch<{ isRead?: boolean }[]>(`/notifications/${uid}`, []);
      setUnread(Array.isArray(items) ? items.filter((n) => !n.isRead).length : 0);
    })();
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
      className="relative text-beige/80 transition-colors hover:text-beige"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-brand px-1 text-center text-[10px] font-bold leading-4 text-charcoal">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
