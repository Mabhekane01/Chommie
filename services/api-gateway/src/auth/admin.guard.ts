import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifySupabaseToken } from './supabase-auth.guard';

/**
 * Admin gate for internal ops routes (suppliers, off-take, campaigns).
 * A user is an admin when their verified Supabase token's email is in the
 * comma-separated ADMIN_EMAILS env, or their app_metadata role is "admin".
 */
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Explicit local-dev escape hatch (used by the seed script). NEVER set in prod.
    if (process.env.ADMIN_BYPASS === 'true' && process.env.NODE_ENV !== 'production') return true;
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const user = await verifySupabaseToken(token);
    if (!user) throw new UnauthorizedException('Invalid or unverifiable token');

    const allowed = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin =
      user.role === 'admin' || (!!user.email && allowed.includes(user.email.toLowerCase()));
    if (!isAdmin) throw new ForbiddenException('Admin access required');

    req.user = user;
    return true;
  }
}
