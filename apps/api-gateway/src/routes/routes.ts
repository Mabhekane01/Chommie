// src/routes/index.ts
import { Router } from 'express';
import { authProxy } from '../proxies/authProxy.js';
import { userProxy } from '../proxies/userProxy.js';
import { healthRouter } from './health.js';
import { authRateLimit, strictRateLimit } from '../middlewares/rateLimiter.js';
import { cacheMiddleware } from '../middlewares/cache.js';

export const router: Router = Router();

// Health checks (no rate limiting)
router.use('/health', healthRouter);

// Authentication routes (strict rate limiting)
router.use('/auth', authRateLimit, authProxy);

// User routes (with caching for GET requests)
router.use(
  '/users',
  strictRateLimit,
  cacheMiddleware({
    ttl: 300, // 5 minutes
    condition: req => req.method === 'GET' && !req.path.includes('profile'),
  }),
  userProxy
);
