import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server Supabase client (RSC / route handlers). The gateway verifies the
 * Supabase JWT; downstream NestJS services key their data off the Supabase
 * user id. See docs/ARCHITECTURE.md §3.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Supabase env not set — copy .env.example to .env.local');
  }
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Record<string, unknown>),
          );
        } catch {
          // called from a Server Component — safe to ignore when middleware refreshes sessions
        }
      },
    },
  });
}
