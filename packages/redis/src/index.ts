import IORedis, { Redis } from 'ioredis';
import { baseConfig as config } from '@packages/config/env';
// Type definitions
interface RedisHealthCheck {
  status: 'healthy' | 'unhealthy';
  latency?: string;
  error?: string;
  timestamp: string;
}

interface RedisConnectionInfo {
  host: string;
  port: number;
  db: number;
  timestamp: string;
}

// Create Redis configuration using centralized config
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,

  // Connection pool settings
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
  enableReadyCheck: true,
  // maxLoadingTimeout doesn't exist - removed

  // Connection management
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: config.redis.lazyConnect,
  keepAlive: config.redis.keepAlive,

  // Cluster support (if using Redis Cluster)
  enableOfflineQueue: false,

  // Retry strategy
  retryStrategy: (times: number): number | null => {
    if (times > config.redis.maxRetries) {
      return null; // Stop retrying after max attempts
    }
    // Use retryDelayOnFailover from config for delay calculation
    const delay = Math.min(times * 50, config.redis.retryDelayOnFailover);
    console.warn(
      `Redis retry attempt ${times}/${config.redis.maxRetries}, waiting ${delay}ms`
    );
    return delay;
  },

  // Connection name for monitoring
  connectionName: config.redis.connectionName,

  // TLS support
  ...(config.redis.tls && {
    tls: {
      rejectUnauthorized: config.app.isProduction,
    },
  }),
};

// Create Redis instance - use URL if provided, otherwise use individual config
const redis = config.redis.url
  ? new Redis(config.redis.url, {
      // Override URL-based config with our specific settings
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
      lazyConnect: config.redis.lazyConnect,
      keepAlive: config.redis.keepAlive,
      connectionName: config.redis.connectionName,
      retryStrategy: redisConfig.retryStrategy,
      enableReadyCheck: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableOfflineQueue: false,
      ...(config.redis.tls && {
        tls: {
          rejectUnauthorized: config.app.isProduction,
        },
      }),
    })
  : new Redis(redisConfig);

// Enhanced event handlers
redis.on('connect', () => {
  const connectionInfo: RedisConnectionInfo = {
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    timestamp: new Date().toISOString(),
  };

  console.log('✅ Connected to Redis', connectionInfo);
});

redis.on('ready', () => {
  console.log('🚀 Redis is ready to accept commands');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', {
    message: err.message,
    code: (err as any)?.code,
    timestamp: new Date().toISOString(),
  });

  // Don't exit process in production, let retry strategy handle it
  if (config.app.isDevelopment) {
    console.error('Full error:', err);
  }
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', (ms: number) => {
  console.log(`🔄 Reconnecting to Redis in ${ms}ms...`);
});

redis.on('end', () => {
  console.warn('🔚 Redis connection ended');
});

// Graceful shutdown handler
const gracefulShutdown = async (): Promise<void> => {
  console.log('🛑 Shutting down Redis connection...');
  try {
    await redis.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (err) {
    const error = err as Error;
    console.error('❌ Error during Redis shutdown:', error.message);
    redis.disconnect();
  }
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // nodemon restart

// Health check function
export const checkRedisHealth = async (): Promise<RedisHealthCheck> => {
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    return {
      status: 'healthy',
      latency: `${latency}ms`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const err = error as Error;
    return {
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Utility functions for common operations with error handling
export const safeGet = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key);
  } catch (error) {
    const err = error as Error;
    console.error(`Redis GET error for key ${key}:`, err.message);
    throw error;
  }
};

export const safeSet = async (
  key: string,
  value: string,
  ttl: number | null = null
): Promise<'OK' | null> => {
  try {
    if (ttl) {
      return await redis.setex(key, ttl, value);
    }
    return await redis.set(key, value);
  } catch (error) {
    const err = error as Error;
    console.error(`Redis SET error for key ${key}:`, err.message);
    throw error;
  }
};

export const safeDel = async (key: string): Promise<number> => {
  try {
    return await redis.del(key);
  } catch (error) {
    const err = error as Error;
    console.error(`Redis DEL error for key ${key}:`, err.message);
    throw error;
  }
};

// Enhanced utility functions using config defaults
export const safeSetWithDefaultTTL = async (
  key: string,
  value: string,
  ttl: number | null = config.redis.ttl
): Promise<'OK' | null> => {
  return safeSet(key, value, ttl);
};

// Cache utility with JSON serialization
export const cacheSet = async <T>(
  key: string,
  data: T,
  ttl: number | null = config.redis.ttl
): Promise<'OK' | null> => {
  try {
    const serialized = JSON.stringify(data);
    return await safeSet(key, serialized, ttl);
  } catch (error) {
    const err = error as Error;
    console.error(`Redis cache SET error for key ${key}:`, err.message);
    throw error;
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await safeGet(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    const err = error as Error;
    console.error(`Redis cache GET error for key ${key}:`, err.message);
    throw error;
  }
};

// Connection info getter
export const getConnectionInfo = (): RedisConnectionInfo => ({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
  timestamp: new Date().toISOString(),
});

export default redis;
