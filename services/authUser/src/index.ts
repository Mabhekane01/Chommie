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
        service: 'authUser',
        database: config.database.name,
      });

      await client.query(`CREATE DATABASE "${config.database.name}"`);

      logger.info('Database created successfully', {
        service: 'authUser',
        database: config.database.name,
      });
    } else {
      logger.info('Database already exists', {
        service: 'authUser',
        database: config.database.name,
      });
    }
  } catch (error) {
    logger.error('Failed to create database', {
      service: 'authUser',
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
        service: 'authUser',
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
        service: 'authUser',
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
          service: 'authUser',
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
            service: 'authUser',
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
        service: 'authUser',
        migrationsApplied: migrationResult.migrationsApplied,
        migrationsSkipped: migrationResult.migrationsSkipped,
        duration: migrationResult.totalDuration,
        attempt: attempt,
      });

      // Log final database status
      const dbStatus = await getDatabaseStatus();
      logger.info('Database status', {
        service: 'authUser',
        connected: dbStatus.connected,
        migrationsApplied: dbStatus.migrationsApplied,
        lastMigration: dbStatus.lastMigration,
      });

      return; // Success, exit retry loop
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      logger.error('Database initialization failed', {
        service: 'authUser',
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
        service: 'authUser',
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
    database: config.database.name,
  });

  try {
    await client.connect();

    // First, try to clear locks from the main migrations table
    try {
      const migrationsTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'migrations'
        )
      `);

      if (migrationsTableExists.rows[0].exists) {
        // Clear locks older than 2 minutes or force clear all locks
        const result = await client.query(`
          UPDATE migrations 
          SET is_locked = false, locked_by = NULL, locked_at = NULL 
          WHERE is_locked = true 
          AND (locked_at < NOW() - INTERVAL '2 minutes' OR locked_by LIKE '%auth-user%')
          RETURNING migration_name, locked_by
        `);

        if (result.rowCount && result.rowCount > 0) {
          logger.info('Cleared stale migration locks from migrations table', {
            service: 'authUser',
            locksCleared: result.rowCount,
            migrations: result.rows.map(row => ({
              migration: row.migration_name,
              lockedBy: row.locked_by,
            })),
          });
        }
      }
    } catch (error) {
      logger.debug('Could not clear locks from migrations table', {
        service: 'authUser',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Try to clear common migration lock tables
    const lockTables = [
      'schema_migrations_lock',
      'migration_lock',
      'migrations_lock',
    ];

    for (const table of lockTables) {
      try {
        // Check if table exists
        const tableExists = await client.query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          )
        `,
          [table]
        );

        if (tableExists.rows[0].exists) {
          // Clear old locks (older than 2 minutes)
          const result = await client.query(`
            DELETE FROM ${table} 
            WHERE locked_at < NOW() - INTERVAL '2 minutes'
            OR locked_by LIKE '%auth-user%'
            RETURNING *
          `);

          if (result.rowCount && result.rowCount > 0) {
            logger.info('Cleared stale migration locks', {
              service: 'authUser',
              table: table,
              locksCleared: result.rowCount,
            });
          }
        }
      } catch (tableError) {
        // Table might not exist or have different structure, continue
        logger.debug('Could not clear locks from table', {
          service: 'authUser',
          table: table,
          error:
            tableError instanceof Error ? tableError.message : 'Unknown error',
        });
      }
    }

    // Also try to release any PostgreSQL advisory locks
    try {
      await client.query('SELECT pg_advisory_unlock_all()');
      logger.debug('Released all advisory locks', {
        service: 'authUser',
      });
    } catch (advisoryError) {
      logger.debug('Could not release advisory locks', {
        service: 'authUser',
        error:
          advisoryError instanceof Error
            ? advisoryError.message
            : 'Unknown error',
      });
    }
  } catch (error) {
    logger.warn('Could not clear migration locks', {
      service: 'authUser',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.end();
  }
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`, {
    service: 'authUser',
    signal,
  });

  // Close HTTP server first
  server.close(async err => {
    if (err) {
      logger.error('Error during server close', {
        service: 'authUser',
        error: err.message,
        stack: err.stack,
      });
    } else {
      logger.info('HTTP server closed successfully', {
        service: 'authUser',
      });
    }

    try {
      // Clean up database connections
      logger.info('Closing database connections...', {
        service: 'authUser',
      });

      await cleanupDatabase();

      logger.info('Database connections closed successfully', {
        service: 'authUser',
      });

      logger.info('Graceful shutdown completed', {
        service: 'authUser',
      });

      process.exit(err ? 1 : 0);
    } catch (cleanupError) {
      logger.error('Error during cleanup', {
        service: 'authUser',
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
      service: 'authUser',
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
        service: 'authUser',
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
    service: 'authUser',
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });

  // Try to cleanup before exiting
  cleanupDatabase()
    .catch(cleanupError => {
      logger.error('Error during emergency cleanup', {
        service: 'authUser',
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
      service: 'authUser',
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
          service: 'authUser',
          url: serviceUrl,
          fallbackPort,
          error: (error as Error).message,
        });
        return fallbackPort;
      }
    };

    const port = getServicePort(config.services.auth, 4001);

    server.listen(port, () => {
      logger.info('AuthUser Service started successfully', {
        service: 'authUser',
        version: config.app?.version || '1.0.0',
        port,
        environment: config.app?.nodeEnv || 'development',
        healthCheck: `http://localhost:${port}/health`,
      });

      if (config.app?.isDevelopment) {
        logger.info('Development mode enabled', {
          service: 'authUser',
          features: ['detailed logging', 'error stack traces'],
        });
      }
    });
  } catch (error) {
    logger.error('Failed to start AuthUser service', {
      service: 'authUser',
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
};

startServer();
