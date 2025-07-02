// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { baseConfig as config } from '@packages/config/env';
import { cache } from '../utils/cache.js';
import { logger } from '@packages/config/logger';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/health',
  '/api/docs',
];

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip auth for public routes
  if (PUBLIC_ROUTES.some(route => req.path.startsWith(route))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'NO_TOKEN',
      requestId: req.requestId,
    });
    return;
  }

  try {
    // Check if token is blacklisted
    const blacklistKey = cache.generateKey('blacklist', token);
    const blacklistedToken = await cache.get(blacklistKey);

    if (blacklistedToken !== null) {
      res.status(401).json({
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED',
        requestId: req.requestId,
      });
      return;
    }

    // Verify JWT token
    if (!config.jwt.secret) {
      res.status(500).json({
        error: 'JWT secret is not configured',
        code: 'NO_JWT_SECRET',
        requestId: req.requestId,
      });
      return;
    }
    const payload = jwt.verify(token, config.jwt.secret as string) as any;
    req.user = payload;

    // Log successful authentication
    logger.info('User authenticated', {
      requestId: req.requestId,
      userId: payload.id,
      route: req.path,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      requestId: req.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      route: req.path,
    });

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        requestId: req.requestId,
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        requestId: req.requestId,
      });
    } else {
      res.status(401).json({
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
        requestId: req.requestId,
      });
    }
  }
};
