import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './supabase-auth.guard';

/** Injects the verified Supabase user attached by SupabaseAuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
