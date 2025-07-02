import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Base user interface for consistency
export interface BaseUser {
  id: number;
  phoneNumber: string;
  role?: string;
}

// JWT payload interface
export interface JWTUser extends BaseUser {
  iat: number;
  exp: number;
}

// Rate limiting interface
export interface RateLimit {
  limit: number;
  current: number;
  remaining: number;
  resetTime?: Date;
}

// Extend Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: JWTUser;

      // Rate limiting properties
      rateLimit?: RateLimit;

      // Request timing for metrics
      startTime?: number;

      // Client info
      clientIp?: string;
      userAgent?: string;
    }
  }
}

// Authenticated request interface - ensures user is always present
export interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user: JWTUser;
  requestId: string;
}

// Type guard to check if request is authenticated
export function isAuthenticatedRequest(
  req: Request
): req is AuthenticatedRequest {
  return (
    req.user !== undefined &&
    typeof req.user.id === 'number' &&
    typeof req.user.phoneNumber === 'string' &&
    typeof req.user.iat === 'number' &&
    typeof req.user.exp === 'number'
  );
}

// Utility type for route handlers that require authentication
export type AuthenticatedHandler<T = any> = (
  req: AuthenticatedRequest,
  res: Response<T>,
  next: NextFunction
) => void | Promise<void>;

// Helper function to type authenticated routes properly
export const withAuth = <T = any>(
  handler: AuthenticatedHandler<T>
): RequestHandler => {
  return handler as RequestHandler;
};
