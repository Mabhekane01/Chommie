import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Renamed from `middleware` in Next 16 — the file convention is now `proxy`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
