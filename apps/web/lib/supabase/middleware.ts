import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Refreshes the Supabase session on every request (docs/ARCHITECTURE.md §3).
 * No-ops when Supabase env isn't configured, so the app runs without auth set up.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as Record<string, unknown>),
        );
      },
    },
  });

  // Touch the session so expired tokens refresh into the response cookies.
  //
  // This must never throw. Middleware runs on every request — including the RSC
  // payload fetches the router makes when prefetching links — so an unhandled
  // rejection here 500s those requests and surfaces in the browser as an opaque
  // "Failed to fetch". An unreachable or misconfigured Supabase should degrade
  // to "signed out", not take the whole app down.
  try {
    await supabase.auth.getUser();
  } catch {
    /* leave the session untouched; the user simply reads as signed out */
  }
  return response;
}
