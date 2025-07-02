// services/authUser/src/server.ts
import http from 'http';
import app from './app.js';
import { baseConfig as config } from '@packages/config/env';
import { logger } from '@packages/config/logger';
import {
  init as initDatabase,
  checkConnection,
  getDatabaseStatus,
  cleanup as cleanupDatabase,
} from '@packages/database';
import { Client } from 'pg';

const server = http.createServer(app);

// Configure server timeouts
server.keepAliveTimeout = config.shutdown?.keepAliveTimeout || 65000;
server.headersTimeout = config.shutdown?.headersTimeout || 66000;

// Database initialization function
/*
 * Creates the database if it doesn't exist
 * Connects to the default 'postgres' database to create the target database
 */
async function createDatabaseIfNotExists(): Promise<void> {
  const client = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();

    // Check if the database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [config.database.name]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      logger.info('Database does not exist, creating...', {
        service: 'notification',
        database: config.database.name,
      });

      await client.query(`CREATE DATABASE "${config.database.name}"`);

      logger.info('Database created successfully', {
        service: 'notification',
        database: config.database.name,
      });
    } else {
      logger.info('Database already exists', {
        service: 'notification',
        database: config.database.name,
      });
    }
  } catch (error) {
    logger.error('Failed to create database', {
      service: 'notification',
      database: config.database.name,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  } finally {
    await client.end();
  }
}

// Enhanced initializeDatabase function with lock handling
async function initializeDatabase(): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info('Initializing database connection...', {
        service: 'notification',
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        attempt: attempt,
        maxRetries: maxRetries,
      });

      // First, ensure the database exists
      await createDatabaseIfNotExists();

      // Check if database is reachable
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to database');
      }

      // Clear any stale migration locks before attempting migration
      await clearStaleMigrationLocks();

      // Run migrations with timeout
      logger.info('Running database migrations...', {
        service: 'notification',
        attempt: attempt,
      });

      const migrationResult = (await Promise.race([
        initDatabase(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Migration timeout')), 30000)
        ),
      ])) as any;

      if (!migrationResult.success) {
        logger.error('Database migration failed', {
          service: 'notification',
          errors: migrationResult.errors,
          warnings: migrationResult.warnings,
          attempt: attempt,
        });

        // If it's a lock error and we have retries left, try again
        const isLockError = migrationResult.errors.some(
          (error: string) =>
            error.includes('migration lock') || error.includes('lock')
        );

        if (isLockError && attempt < maxRetries) {
          logger.warn('Migration lock error, retrying...', {
            service: 'notification',
            attempt: attempt,
            retryingIn: retryDelay,
          });

          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue; // Try again
        }

        throw new Error(
          `Migration failed: ${migrationResult.errors.join(', ')}`
        );
      }

      logger.info('Database initialized successfully', {
        service: 'notification',
        migrationsApplied: migrationResult.migrationsApplied,
        migrationsSkipped: migrationResult.migrationsSkipped,
        duration: migrationResult.totalDuration,
        attempt: attempt,
      });

      // Log final database status
      const dbStatus = await getDatabaseStatus();
      logger.info('Database status', {
        service: 'notification',
        connected: dbStatus.connected,
        migrationsApplied: dbStatus.migrationsApplied,
        lastMigration: dbStatus.lastMigration,
      });

      return; // Success, exit retry loop
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      logger.error('Database initialization failed', {
        service: 'notification',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        attempt: attempt,
        isLastAttempt: isLastAttempt,
      });

      if (isLastAttempt) {
        throw error;
      }

      // Wait before retrying
      logger.info('Retrying database initialization...', {
        service: 'notification',
        attempt: attempt + 1,
        maxRetries: maxRetries,
        retryDelay: retryDelay,
      });

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Clear stale migration locks that might be left from previous failed runs
 */
async function clearStaleMigrationLocks(): Promise<void> {
  const client = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name, // This is super_app_notification
  });

  try {
    await client.connect();

    // Check if migration_locks table exists (your actual table structure)
    const migrationLocksExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'migration_locks'
      )
    `);

    if (migrationLocksExists.rows[0].exists) {
      // Get current lock state
      const currentLock = await client.query(
        'SELECT * FROM migration_locks WHERE id = 1'
      );

      if (currentLock.rows.length > 0) {
        const lock = currentLock.rows[0];

        logger.info('Current migration lock state', {
          service: 'notification',
          locked: lock.locked,
          locked_by: lock.locked_by,
          locked_at: lock.locked_at,
          process_id: lock.process_id,
        });

        // Check if lock is stale (older than 5 minutes or from a specific process)
        const lockAge = lock.locked_at
          ? Math.floor((Date.now() - new Date(lock.locked_at).getTime()) / 1000)
          : 0;

        const isStale =
          lock.locked &&
          (lockAge > 300 || // 5 minutes
            (lock.locked_by && lock.locked_by.includes('API Gateway')) || // Clear API Gateway locks
            lock.process_id === 24680); // Clear the specific problematic process

        if (isStale) {
          // Clear the stale lock
          const result = await client.query(`
            UPDATE migration_locks 
            SET locked = false, 
                locked_by = NULL, 
                locked_at = NULL, 
                process_id = NULL 
            WHERE id = 1
            RETURNING *
          `);

          logger.info('Cleared stale migration lock', {
            service: 'notification',
            previousLock: {
              locked_by: lock.locked_by,
              locked_at: lock.locked_at,
              process_id: lock.process_id,
              age_seconds: lockAge,
            },
            cleared: (result.rowCount ?? 0) > 0,
          });
        } else if (lock.locked) {
          logger.warn('Migration lock is active but not stale, respecting it', {
            service: 'notification',
            locked_by: lock.locked_by,
            locked_at: lock.locked_at,
            process_id: lock.process_id,
            age_seconds: lockAge,
          });
        }
      } else {
        // No lock row exists, create one in unlocked state
        await client.query(`
          INSERT INTO migration_locks (id, locked, locked_by, locked_at, process_id) 
          VALUES (1, false, NULL, NULL, NULL)
          ON CONFLICT (id) DO NOTHING
        `);

        logger.info('Initialized migration lock table', {
          service: 'notification',
        });
      }
    } else {
      logger.debug('Migration locks table does not exist yet', {
        service: 'notification',
      });
    }

    // Also try to release any PostgreSQL advisory locks that might be held
    try {
      await client.query('SELECT pg_advisory_unlock_all()');
      logger.debug('Released all advisory locks', {
        service: 'notification',
      });
    } catch (advisoryError) {
      logger.debug('Could not release advisory locks', {
        service: 'notification',
        error:
          advisoryError instanceof Error
            ? advisoryError.message
            : 'Unknown error',
      });
    }
  } catch (error) {
    logger.warn('Could not clear migration locks', {
      service: 'notification',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  } finally {
    await client.end();
  }
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`, {
    service: 'notification',
    signal,
  });

  // Close HTTP server first
  server.close(async err => {
    if (err) {
      logger.error('Error during server close', {
        service: 'notification',
        error: err.message,
        stack: err.stack,
      });
    } else {
      logger.info('HTTP server closed successfully', {
        service: 'notification',
      });
    }

    try {
      // Clean up database connections
      logger.info('Closing database connections...', {
        service: 'notification',
      });

      await cleanupDatabase();

      logger.info('Database connections closed successfully', {
        service: 'notification',
      });

      logger.info('Graceful shutdown completed', {
        service: 'notification',
      });

      process.exit(err ? 1 : 0);
    } catch (cleanupError) {
      logger.error('Error during cleanup', {
        service: 'notification',
        error:
          cleanupError instanceof Error
            ? cleanupError.message
            : 'Unknown error',
        stack: cleanupError instanceof Error ? cleanupError.stack : undefined,
      });
      process.exit(1);
    }
  });

  // Force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout', {
      service: 'notification',
      timeout: config.shutdown?.timeout || 30000,
    });
    process.exit(1);
  }, config.shutdown?.timeout || 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception', {
    service: 'authUser',
    error: err.message,
    stack: err.stack,
  });

  // Try to cleanup before exiting
  cleanupDatabase()
    .catch(cleanupError => {
      logger.error('Error during emergency cleanup', {
        service: 'notification',
        error:
          cleanupError instanceof Error
            ? cleanupError.message
            : 'Unknown error',
      });
    })
    .finally(() => {
      process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    service: 'notification',
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });

  // Try to cleanup before exiting
  cleanupDatabase()
    .catch(cleanupError => {
      logger.error('Error during emergency cleanup', {
        service: 'notification',
        error:
          cleanupError instanceof Error
            ? cleanupError.message
            : 'Unknown error',
      });
    })
    .finally(() => {
      process.exit(1);
    });
});

// Health check endpoint - add this to your app.ts if not already present
// This should be in your Express app, but adding here for reference
/*
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await getDatabaseStatus();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'authUser',
      version: config.app?.version || '1.0.0',
      database: {
        status: dbStatus.connected ? 'connected' : 'disconnected',
        migrationsApplied: dbStatus.migrationsApplied,
        lastMigration: dbStatus.lastMigration,
        error: dbStatus.error,
      },
      uptime: process.uptime(),
    };

    const statusCode = dbStatus.connected ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'authUser',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
*/

// Start the server
const startServer = async () => {
  try {
    logger.info('Starting AuthUser service...', {
      service: 'notification',
      version: config.app?.version || '1.0.0',
      environment: config.app?.nodeEnv || 'development',
    });

    // Initialize database first
    await initializeDatabase();

    // Extract port from AUTH_SERVICE_URL or use fallback
    const getServicePort = (
      serviceUrl: string,
      fallbackPort: number
    ): number => {
      try {
        const urlObj = new URL(serviceUrl);
        return urlObj.port ? parseInt(urlObj.port) : fallbackPort;
      } catch (error) {
        logger.warn('Invalid service URL, using fallback port', {
          service: 'notification',
          url: serviceUrl,
          fallbackPort,
          error: (error as Error).message,
        });
        return fallbackPort;
      }
    };

    const port = getServicePort(config.services.auth, 4002);

    server.listen(port, () => {
      logger.info('Notification Service started successfully', {
        service: 'notification',
        version: config.app?.version || '1.0.0',
        port,
        environment: config.app?.nodeEnv || 'development',
        healthCheck: `http://localhost:${port}/health`,
      });

      if (config.app?.isDevelopment) {
        logger.info('Development mode enabled', {
          service: 'notification',
          features: ['detailed logging', 'error stack traces'],
        });
      }
    });
  } catch (error) {
    logger.error('Failed to start notification service', {
      service: 'notification',
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
};

startServer();
