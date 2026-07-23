'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client for auth (passkeys / OAuth / phone OTP).
 * See docs/ARCHITECTURE.md §3 — Supabase Auth fronts the NestJS services.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Supabase env not set — copy .env.example to .env.local');
  }
  return createBrowserClient(url, anon);
}
