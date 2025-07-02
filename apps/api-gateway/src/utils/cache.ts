// src/utils/cache.ts
import redis, { safeGet, safeSet, safeDel } from '@packages/redis/index';

// Optionally wrap for domain-specific logic
export const cache = {
  get: safeGet,
  set: (key: string, value: string, ttl = 300) => safeSet(key, value, ttl),
  del: safeDel,
  generateKey: (...parts: string[]) => parts.join(':'),
};
