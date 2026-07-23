import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Verifies a Supabase-issued JWT at the edge (docs/ARCHITECTURE.md §3) and
 * attaches `req.user`. Supports both asymmetric (JWKS) and legacy HS256 projects:
 *   - SUPABASE_URL         → verify via {url}/auth/v1/.well-known/jwks.json
 *   - SUPABASE_JWT_SECRET  → verify HS256 with the shared secret
 * Downstream NestJS services key their data off `user.id` (the Supabase `sub`).
 */
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  /** From Supabase app_metadata.role (operator-set; users cannot self-assign). */
  role?: string;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwks && SUPABASE_URL) {
    jwks = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  }
  return jwks;
}

function bearer(req: { headers?: Record<string, unknown> }): string | undefined {
  const header = req.headers?.authorization as string | undefined;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

/** Verifies a token and returns the user, or null if it can't be verified. */
export async function verifySupabaseToken(token: string): Promise<AuthUser | null> {
  const attempts: Array<Promise<{ payload: Record<string, unknown> }>> = [];
  const set = getJwks();
  if (set) attempts.push(jwtVerify(token, set) as Promise<{ payload: Record<string, unknown> }>);
  if (JWT_SECRET) {
    attempts.push(
      jwtVerify(token, new TextEncoder().encode(JWT_SECRET)) as Promise<{
        payload: Record<string, unknown>;
      }>,
    );
  }
  for (const attempt of attempts) {
    try {
      const { payload } = await attempt;
      if (payload.sub) {
        const appMeta = payload.app_metadata as Record<string, unknown> | undefined;
        return {
          id: String(payload.sub),
          email: payload.email as string | undefined,
          phone: payload.phone as string | undefined,
          role: appMeta?.role as string | undefined,
        };
      }
    } catch {
      /* try the next verification method */
    }
  }
  return null;
}

/** Hard guard — rejects requests without a valid Supabase token. */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = bearer(req);
    if (!token) throw new UnauthorizedException('Missing bearer token');
    const user = await verifySupabaseToken(token);
    if (!user) throw new UnauthorizedException('Invalid or unverifiable token');
    req.user = user;
    return true;
  }
}

/**
 * Soft guard — attaches `req.user` when a valid token is present, but never rejects.
 * Used on routes that accept an authenticated user OR a trusted server caller
 * (e.g. the seed script) during the migration.
 */
@Injectable()
export class OptionalSupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = bearer(req);
    if (token) req.user = (await verifySupabaseToken(token)) ?? undefined;
    return true;
  }
}
