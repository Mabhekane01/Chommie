//api-gateway/src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        phoneNumber: string;
        role?: string;
        iat?: number;
        exp?: number;
      };

      // Rate limiting properties
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime?: Date;
      };

      // Request timing for metrics
      startTime?: number;

      // Client info
      clientIp?: string;
      userAgent?: string;
    }
  }
}

// Authenticated request interface
export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
    phoneNumber: string;
    role?: string;
    iat: number;
    exp: number;
  };
}

export {};
