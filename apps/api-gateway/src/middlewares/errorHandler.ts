// src/middlewares/errorHandler.ts

/*
When your app breaks or someone asks for something that doesn’t exist, this code:

Writes down all the important details in a secret notebook (logs)

Sends a clear message back to the person who asked

Keeps some secrets safe in production so bad guys don’t see them

Helps you find bugs faster because every error has a unique ID
*/

import { Request, Response, NextFunction } from 'express';
import { logger } from '@packages/config/logger';
import { baseConfig as config } from '@packages/config/env';

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = config.app.nodeEnv === 'development';

  // Log error with context
  logger.error('Request error', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode,
    error: err.message,
    stack: isDevelopment ? err.stack : undefined,
    userId: req.user?.id,
    clientIp: req.clientIp,
    userAgent: req.userAgent,
  });

  // Don't expose internal errors in production
  const message =
    statusCode < 500 || isDevelopment ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    requestId: req.requestId,
    ...(isDevelopment && { stack: err.stack }),
  });
};

// Handle 404 errors
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    requestId: req.requestId,
    path: req.path,
  });
};
