/**
 * Resolves the acting user for routes that accept unauthenticated server callers
 * (currently only the seed script).
 *
 * A verified token always wins. A client-supplied userId is honoured *only*
 * under the explicit local-dev escape hatch — otherwise anyone could act as any
 * user simply by putting their id in the request body.
 */
export function resolveActingUserId(
  tokenUserId: string | undefined,
  bodyUserId: unknown,
): string | undefined {
  if (tokenUserId) return tokenUserId;

  const devBypass =
    process.env.ADMIN_BYPASS === 'true' && process.env.NODE_ENV !== 'production';
  if (devBypass && typeof bodyUserId === 'string' && bodyUserId.length > 0) {
    return bodyUserId;
  }

  return undefined;
}
