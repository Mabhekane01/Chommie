import { app } from './app.js';
import { baseConfig as config } from '@packages/config/env'; // Updated import path to use the merged config
import { logger } from '@packages/config/logger';
import { cache } from './utils/cache.js';
import redis from '@packages/redis/index';

async function startServer() {
  try {
    // Initialize Redis connection properly
    logger.info('Initializing Redis connection...');
    await initializeRedis();
    logger.info('✅ Redis connection established successfully');

    app.listen(config.app.port, () => {
      logger.info(`🚀 API Gateway running on port ${config.app.port}`, {
        port: config.app.port,
        nodeEnv: config.app.nodeEnv,
        environment: config.app.nodeEnv,
        version: config.app.version,
        name: config.app.name,
      });
    });

    // Log additional startup information
    logger.info('Server configuration loaded', {
      services: Object.keys(config.services),
      redisConnected: !!config.redis.host,
      databaseConfigured: !!config.database.host,
      metricsEnabled: config.metrics.enabled,
      circuitBreakerEnabled: config.circuitBreaker.enabled,
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
}

async function initializeRedis() {
  try {
    // For ioredis with lazyConnect, we need to ensure connection is established
    if (config.redis.lazyConnect) {
      await redis.connect();
      logger.info('Redis lazy connection established');
    }

    // Test the Redis connection with a ping command first
    const pingStart = Date.now();
    await redis.ping();
    const pingLatency = Date.now() - pingStart;

    logger.info('Redis ping successful', { latency: `${pingLatency}ms` });

    // Test the Redis connection with cache operations
    const testKey = cache.generateKey('redis', 'health', 'check');
    const testValue = Date.now().toString();

    // Set a test value with 60 second TTL
    await cache.set(testKey, testValue, 60);

    // Get the test value back
    const retrievedValue = await cache.get(testKey);

    if (retrievedValue !== testValue) {
      throw new Error('Redis connection test failed - value mismatch');
    }

    // Clean up test key
    await cache.del(testKey);

    logger.info('Redis health check passed', {
      testKey,
      connectionActive: true,
      pingLatency: `${pingLatency}ms`,
    });
  } catch (error) {
    logger.error('Redis initialization failed', {
      error: (error as Error).message,
      host: config.redis?.host || 'unknown',
      port: config.redis?.port || 'unknown',
    });
    throw error;
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  try {
    // Close Redis connection using ioredis quit() method
    // ioredis primarily uses quit() for graceful shutdown
    logger.info('Closing Redis connection...');
    await redis.quit();
    logger.info('Redis connection closed gracefully');
  } catch (error) {
    logger.error('Error during Redis graceful shutdown, forcing disconnect', {
      error: (error as Error).message,
    });
    // If quit() fails, force disconnect
    redis.disconnect();
  } finally {
    process.exit(0);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

startServer();
