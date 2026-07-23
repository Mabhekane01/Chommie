'use client';

import { createClient } from '@/lib/supabase/client';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
export const authConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Current access token, or null when signed out / auth not configured. */
export async function getToken(): Promise<string | null> {
  if (!authConfigured) return null;
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token ?? null;
}

/** Current user id, or null. */
export async function getUserId(): Promise<string | null> {
  if (!authConfigured) return null;
  const { data } = await createClient().auth.getUser();
  return data.user?.id ?? null;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Fetch against the gateway with the caller's bearer token attached.
 * Throws ApiError on non-2xx so callers can branch on status (401/403).
 */
export async function authedFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message || body?.error || message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Same as authedFetch but resolves to a fallback instead of throwing. */
export async function safeAuthedFetch<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    return await authedFetch<T>(path, init);
  } catch {
    return fallback;
  }
}
