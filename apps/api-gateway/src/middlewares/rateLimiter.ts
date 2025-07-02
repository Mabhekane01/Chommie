// src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '@packages/redis/index'; // This should be your ioredis client instance
import { baseConfig as config } from '@packages/config/env';
import { Request, Response, NextFunction } from 'express';

// Store rate limiter instances
let globalRateLimitInstance: ReturnType<typeof rateLimit> | null = null;
let authRateLimitInstance: ReturnType<typeof rateLimit> | null = null;
let strictRateLimitInstance: ReturnType<typeof rateLimit> | null = null;

/**
 * Creates a rate limiter middleware instance.
 *
 * @param windowMs - Time window in milliseconds during which `max` requests are allowed.
 * @param max - The maximum number of requests allowed during the `windowMs`.
 * @param skipSuccessful - Whether to skip counting successful requests towards the limit.
 * @returns A rate limit middleware function.
 */
export const createRateLimiter = (
  windowMs: number,
  max: number,
  skipSuccessful = false
) => {
  return rateLimit({
    // FIX: Wrap redis.call in an arrow function to explicitly match SendCommandFn signature.
    // This clarifies to TypeScript that we are using the overload of redis.call that takes
    // variadic arguments and returns a Promise, without a callback parameter.
    store: new RedisStore({
      sendCommand: (
        ...args: [command: string, ...args: (string | number | Buffer)[]]
      ): Promise<import('rate-limit-redis').RedisReply> =>
        redis.call(...args) as Promise<import('rate-limit-redis').RedisReply>, // Explicitly cast to Promise<RedisReply>
      prefix: 'rl:', // Optional: prefix for rate limit keys in Redis
    }),
    windowMs, // Time window for the rate limit
    max, // Max requests allowed within the windowMs
    skipSuccessfulRequests: skipSuccessful, // Whether to count successful requests
    message: {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the deprecated `X-RateLimit-*` headers
    keyGenerator: req => {
      // Generate a unique key for rate limiting based on user ID or IP address
      return req.user?.id || req.clientIp || req.ip || 'unknown';
    },
    handler: (req: Request, res: Response) => {
      // Custom handler for when the rate limit is exceeded
      res.status(429).json({
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        requestId: req.requestId, // Assuming you have a requestId on the request object
        retryAfter: Math.ceil(windowMs / 1000), // Time in seconds to wait before retrying
      });
    },
  });
};

/**
 * Initializes the global, authentication, and strict rate limiter instances.
 * This function should be called once the Redis client is ready.
 */
const initializeRateLimiters = () => {
  console.log('Initializing rate limiters...');
  globalRateLimitInstance = createRateLimiter(
    config.rateLimit.windowMs,
    config.rateLimit.maxRequests,
    config.rateLimit.skipSuccessfulRequests
  );

  authRateLimitInstance = createRateLimiter(60000, 5); // Example: 5 requests per minute for auth routes
  strictRateLimitInstance = createRateLimiter(60000, 10); // Example: 10 requests per minute for strict routes
  console.log('Rate limiters initialized.');
};

// Wait for the Redis client to be 'ready' before creating the rate limiters.
// This prevents trying to interact with Redis before the connection is established.
if (redis.status === 'ready') {
  initializeRateLimiters();
} else {
  redis.on('ready', () => {
    initializeRateLimiters();
  });
  // Consider also handling 'error' or 'end' events from redis client if needed
  redis.on('error', err => {
    console.error(
      'Redis client error during rate limiter initialization:',
      err
    );
    // You might want to implement a retry mechanism or graceful fallback here
  });
}

/**
 * Global rate limit middleware.
 * Ensures the rate limiter is initialized before use.
 */
export const globalRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!globalRateLimitInstance) {
    console.warn(
      'Global rate limit instance not initialized. Service unavailable.'
    );
    return res.status(503).json({
      error: 'Rate limiting service unavailable',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
  return globalRateLimitInstance(req, res, next);
};

/**
 * Authentication-specific rate limit middleware.
 * Ensures the rate limiter is initialized before use.
 */
export const authRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!authRateLimitInstance) {
    console.warn(
      'Auth rate limit instance not initialized. Service unavailable.'
    );
    return res.status(503).json({
      error: 'Rate limiting service unavailable',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
  return authRateLimitInstance(req, res, next);
};

/**
 * Strict rate limit middleware for sensitive operations.
 * Ensures the rate limiter is initialized before use.
 */
export const strictRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!strictRateLimitInstance) {
    console.warn(
      'Strict rate limit instance not initialized. Service unavailable.'
    );
    return res.status(503).json({
      error: 'Rate limiting service unavailable',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
  return strictRateLimitInstance(req, res, next);
};
