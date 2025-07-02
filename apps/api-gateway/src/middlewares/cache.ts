// src/middlewares/cache.ts

/*
This middleware checks if the response for a GET request is already saved in cache.
If yes, it sends the cached data fast.
If no, it lets the request run, then saves the successful response for next time.
It adds helpful headers (X-Cache) so you can see if you hit cache or missed.
*/

import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/cache.js';
import { logger } from '@packages/config/logger';

interface CacheOptions {
  ttl: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

export const cacheMiddleware = (options: CacheOptions) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Only cache GET requests by default
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition if provided
    if (options.condition && !options.condition(req)) {
      return next();
    }

    const cacheKey = options.keyGenerator
      ? options.keyGenerator(req)
      : cache.generateKey('response', req.path, JSON.stringify(req.query));

    try {
      const cachedResponse = await cache.get(cacheKey);

      if (cachedResponse) {
        logger.debug('Cache hit', {
          requestId: req.requestId,
          cacheKey,
          path: req.path,
        });

        const parsed = JSON.parse(cachedResponse);
        res.setHeader('X-Cache', 'HIT');
        res.status(parsed.statusCode).json(parsed.data);
      }

      // Cache miss - intercept response
      const originalJson = res.json;
      res.json = function (data: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            statusCode: res.statusCode,
            data,
          };

          cache
            .set(cacheKey, JSON.stringify(cacheData), options.ttl)
            .catch(err => {
              logger.error('Cache set error', {
                requestId: req.requestId,
                error: err.message,
              });
            });
        }

        res.setHeader('X-Cache', 'MISS');
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next();
    }
  };
};
