import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { defaultPool as pool } from './client.js';
import { baseConfig as config } from '@packages/config/env';
import type { PoolClient } from 'pg';

// Types
interface Migration {
  id: number;
  name: string;
  applied_at: Date;
  checksum: string;
  execution_time_ms: number;
}

interface MigrationFile {
  filename: string;
  sql: string;
  checksum: string;
  order: number;
}

interface MigrationResult {
  success: boolean;
  migrationName: string;
  duration: number;
  error?: string;
  skipped?: boolean;
  checksumVerified?: boolean;
}

interface InitializationResult {
  success: boolean;
  totalDuration: number;
  migrationsApplied: number;
  migrationsSkipped: number;
  errors: string[];
  warnings: string[];
}

export interface MigrationLock {
  locked: boolean;
  lockedBy?: string;
  lockedAt?: Date;
}

// Configuration
// Near the top of your init.ts file, replace the MIGRATIONS_DIR line with:

// Configuration - make migrations directory configurable
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR
  ? resolve(process.env.MIGRATIONS_DIR)
  : resolve(process.cwd(), 'src', 'db', 'migrations');

// For health checks, add a flag to skip migration directory validation
const SKIP_MIGRATIONS_CHECK = process.env.SKIP_MIGRATIONS_CHECK === 'true';
console.log(SKIP_MIGRATIONS_CHECK);
console.log(process.env.HEALTH_CHECK_ONLY);
// Update the validation to be conditional
if (!SKIP_MIGRATIONS_CHECK && !existsSync(MIGRATIONS_DIR)) {
  console.warn(`⚠️  Migrations directory not found: ${MIGRATIONS_DIR}`);
  // Don't throw error if we're just doing health checks
  if (!process.env.HEALTH_CHECK_ONLY) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }
}

const MIGRATION_LOCK_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DANGEROUS_OPERATIONS = [
  /DROP\s+DATABASE/i,
  /DROP\s+SCHEMA/i,
  /TRUNCATE\s+TABLE/i,
  /DELETE\s+FROM\s+\w+\s*;?\s*$/i, // DELETE without WHERE clause
  /UPDATE\s+\w+\s+SET\s+.*\s*;?\s*$/i, // UPDATE without WHERE clause
];

// Migration file naming pattern validation
const MIGRATION_PATTERN = /^(\d{3,4})_([a-zA-Z0-9_]+)\.sql$/;
const TIMESTAMP_PATTERN = /^(\d{8}_\d{6})_([a-zA-Z0-9_]+)\.sql$/;

/**
 * Load and validate migration files
 */
function loadMigrationFiles(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('📝 No migration files found');
    return [];
  }

  const migrations: MigrationFile[] = [];

  for (const filename of files) {
    const filePath = resolve(MIGRATIONS_DIR, filename);

    // Validate filename pattern
    const orderMatch = filename.match(MIGRATION_PATTERN);
    const timestampMatch = filename.match(TIMESTAMP_PATTERN);

    if (!orderMatch && !timestampMatch) {
      throw new Error(
        `Invalid migration filename: ${filename}. ` +
          `Use format: 001_description.sql or 20231201_120000_description.sql`
      );
    }

    const sql = readFileSync(filePath, 'utf-8').trim();

    if (!sql) {
      throw new Error(`Migration file is empty: ${filename}`);
    }

    const checksum = calculateChecksum(sql);
    const order = orderMatch
      ? parseInt(orderMatch[1], 10)
      : parseInt(timestampMatch![1].replace('_', ''), 10);

    migrations.push({
      filename,
      sql,
      checksum,
      order,
    });
  }

  // Validate order sequence
  validateMigrationOrder(migrations);

  return migrations.sort((a, b) => a.order - b.order);
}

/**
 * Validate migration order to prevent gaps
 */
function validateMigrationOrder(migrations: MigrationFile[]): void {
  const orders = migrations.map(m => m.order).sort((a, b) => a - b);

  for (let i = 1; i < orders.length; i++) {
    if (orders[i] <= orders[i - 1]) {
      throw new Error(
        `Duplicate or invalid migration order detected: ${orders[i]}. ` +
          `Migration files must have unique, sequential order numbers.`
      );
    }
  }
}

/**
 * Validate SQL for dangerous operations
 */
function validateMigrationSQL(sql: string, filename: string): string[] {
  const warnings: string[] = [];

  for (const pattern of DANGEROUS_OPERATIONS) {
    if (pattern.test(sql)) {
      const warning = `Potentially dangerous operation detected in ${filename}`;
      warnings.push(warning);
      console.warn(`⚠️  ${warning}`);

      if (config.app.isProduction && !process.env.FORCE_DANGEROUS_MIGRATIONS) {
        throw new Error(
          `Dangerous operation blocked in production: ${filename}. ` +
            `Set FORCE_DANGEROUS_MIGRATIONS=true to override.`
        );
      }
    }
  }

  return warnings;
}

/**
 * Calculate SHA-256 checksum for migration content
 */
function calculateChecksum(content: string): string {
  return createHash('sha256').update(content.trim()).digest('hex');
}

/**
 * Create enhanced migrations tracking table
 */
async function createMigrationsTable(): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      checksum VARCHAR(64) NOT NULL,
      execution_time_ms INTEGER DEFAULT 0,
      applied_by VARCHAR(100) DEFAULT current_user,
      environment VARCHAR(50) DEFAULT '${config.app.nodeEnv}',
      
      CONSTRAINT valid_checksum CHECK (length(checksum) = 64)
    );
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name);
    CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at DESC);
  `;

  try {
    await pool.query(createTableSQL);
    console.log('📋 Migrations table ready');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to create migrations table:', errorMessage);
    throw error;
  }
}

/**
 * Create migration lock table for concurrent protection
 */
async function createMigrationLockTable(): Promise<void> {
  const createLockTableSQL = `
    CREATE TABLE IF NOT EXISTS migration_locks (
      id INTEGER PRIMARY KEY DEFAULT 1,
      locked BOOLEAN DEFAULT FALSE,
      locked_by VARCHAR(255),
      locked_at TIMESTAMP,
      process_id INTEGER,
      
      CONSTRAINT single_lock CHECK (id = 1)
    );
    
    -- Insert default row if not exists
    INSERT INTO migration_locks (id, locked) 
    VALUES (1, FALSE) 
    ON CONFLICT (id) DO NOTHING;
  `;

  try {
    await pool.query(createLockTableSQL);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to create migration lock table:', errorMessage);
    throw error;
  }
}

/**
 * Acquire migration lock to prevent concurrent migrations
 */
async function acquireMigrationLock(client: PoolClient): Promise<boolean> {
  const lockIdentifier = `${config.app.name}-${process.pid}-${Date.now()}`;

  try {
    // Check for existing locks and clean up stale ones
    const lockResult = await client.query(`
      SELECT locked, locked_by, locked_at, 
             EXTRACT(EPOCH FROM (NOW() - locked_at)) * 1000 as age_ms
      FROM migration_locks 
      WHERE id = 1
    `);

    if (lockResult.rows.length > 0) {
      const lock = lockResult.rows[0];

      if (lock.locked) {
        const ageMs = parseInt(lock.age_ms || '0');

        if (ageMs > MIGRATION_LOCK_TIMEOUT) {
          console.warn(
            `⚠️  Cleaning up stale migration lock (${Math.round(ageMs / 1000)}s old)`
          );
          await client.query(`
            UPDATE migration_locks 
            SET locked = FALSE, locked_by = NULL, locked_at = NULL, process_id = NULL
            WHERE id = 1
          `);
        } else {
          console.error(
            `❌ Migration already in progress by: ${lock.locked_by}`
          );
          return false;
        }
      }
    }

    // Attempt to acquire lock
    const acquireResult = await client.query(
      `
      UPDATE migration_locks 
      SET locked = TRUE, locked_by = $1, locked_at = NOW(), process_id = $2
      WHERE id = 1 AND NOT locked
      RETURNING locked
    `,
      [lockIdentifier, process.pid]
    );

    if (acquireResult.rows.length === 0) {
      console.error('❌ Failed to acquire migration lock');
      return false;
    }

    console.log(`🔒 Migration lock acquired by: ${lockIdentifier}`);
    return true;
  } catch (error) {
    console.error('❌ Error acquiring migration lock:', error);
    return false;
  }
}

/**
 * Release migration lock
 */
async function releaseMigrationLock(client: PoolClient): Promise<void> {
  try {
    await client.query(`
      UPDATE migration_locks 
      SET locked = FALSE, locked_by = NULL, locked_at = NULL, process_id = NULL
      WHERE id = 1
    `);
    console.log('🔓 Migration lock released');
  } catch (error) {
    console.error('❌ Error releasing migration lock:', error);
  }
}

/**
 * Check if migration has been applied and verify checksum
 */
async function getMigrationStatus(migrationName: string): Promise<{
  applied: boolean;
  checksum?: string;
  needsChecksumUpdate?: boolean;
}> {
  try {
    // Check if migrations table exists
    const tableResult = await pool.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'migrations' 
      AND table_schema = current_schema()
    `);

    if (tableResult.rows.length === 0) {
      return { applied: false };
    }

    const migrationResult = await pool.query<Migration>(
      'SELECT name, checksum FROM migrations WHERE name = $1',
      [migrationName]
    );

    if (migrationResult.rows.length === 0) {
      return { applied: false };
    }

    const migration = migrationResult.rows[0];
    return {
      applied: true,
      checksum: migration.checksum,
      needsChecksumUpdate: !migration.checksum, // Handle legacy migrations without checksums
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('relation "migrations" does not exist')
    ) {
      return { applied: false };
    }
    throw error;
  }
}

/**
 * Verify migration checksum against stored value
 */
function verifyMigrationChecksum(
  migrationName: string,
  currentChecksum: string,
  storedChecksum?: string
): void {
  if (!storedChecksum) {
    return; // No stored checksum to verify against
  }

  if (currentChecksum !== storedChecksum) {
    throw new Error(
      `Migration checksum mismatch for ${migrationName}. ` +
        `This indicates the migration file has been modified after being applied. ` +
        `Expected: ${storedChecksum}, Got: ${currentChecksum}`
    );
  }
}

/**
 * Apply a single migration with enhanced error handling and verification
 */
async function applyMigration(
  migration: MigrationFile
): Promise<MigrationResult> {
  const startTime = Date.now();
  let client: PoolClient | null = null;
  let lockAcquired = false;

  console.log(`🔄 Processing migration: ${migration.filename}`);

  try {
    // Validate SQL for dangerous operations
    const warnings = validateMigrationSQL(migration.sql, migration.filename);

    // Check migration status
    const status = await getMigrationStatus(migration.filename);

    if (status.applied) {
      // Verify checksum if available
      if (status.checksum) {
        verifyMigrationChecksum(
          migration.filename,
          migration.checksum,
          status.checksum
        );
        console.log(
          `⏭️  Migration ${migration.filename} already applied, skipping`
        );
        return {
          success: true,
          migrationName: migration.filename,
          duration: Date.now() - startTime,
          skipped: true,
          checksumVerified: true,
        };
      } else if (status.needsChecksumUpdate) {
        console.log(
          `🔄 Updating checksum for legacy migration: ${migration.filename}`
        );
        await pool.query(
          'UPDATE migrations SET checksum = $1 WHERE name = $2',
          [migration.checksum, migration.filename]
        );
      }

      return {
        success: true,
        migrationName: migration.filename,
        duration: Date.now() - startTime,
        skipped: true,
      };
    }

    // Acquire database client
    try {
      client = await pool.connect();
    } catch (error) {
      throw new Error(
        `Failed to acquire database connection: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (!client) {
      throw new Error('Database client is null after connection attempt');
    }

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Acquire migration lock
      lockAcquired = await acquireMigrationLock(client);
      if (!lockAcquired) {
        throw new Error('Failed to acquire migration lock');
      }

      // Double check if migration was applied by another process
      const doubleCheckStatus = await getMigrationStatus(migration.filename);
      if (doubleCheckStatus.applied) {
        console.log(
          `⏭️  Migration ${migration.filename} was applied by another process, skipping`
        );
        return {
          success: true,
          migrationName: migration.filename,
          duration: Date.now() - startTime,
          skipped: true,
        };
      }

      // Apply the migration
      const migrationStartTime = Date.now();
      await client.query(migration.sql);
      const executionTime = Date.now() - migrationStartTime;

      // Record the migration
      await client.query(
        `
        INSERT INTO migrations (name, checksum, execution_time_ms, applied_by, environment) 
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          migration.filename,
          migration.checksum,
          executionTime,
          process.env.USER || process.env.USERNAME || 'system',
          config.app.nodeEnv,
        ]
      );

      // Commit transaction (lock will be released automatically on commit/rollback)
      await client.query('COMMIT');
      lockAcquired = false; // Lock is released after commit

      console.log(
        `✅ Migration ${migration.filename} applied successfully (${executionTime}ms)`
      );

      return {
        success: true,
        migrationName: migration.filename,
        duration: Date.now() - startTime,
        checksumVerified: true,
      };
    } catch (transactionError) {
      // Handle transaction-level errors
      try {
        if (client) {
          // Release lock if we still have it (only if transaction hasn't been rolled back yet)
          if (lockAcquired) {
            try {
              await releaseMigrationLock(client);
            } catch (lockError) {
              console.warn(
                `Warning: Failed to release migration lock: ${lockError instanceof Error ? lockError.message : 'Unknown error'}`
              );
            }
          }

          // Rollback transaction
          await client.query('ROLLBACK');
        }
      } catch (rollbackError) {
        // Log rollback failure but don't mask the original error
        console.error(
          `Failed to rollback transaction: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`
        );
      }

      // Re-throw the original transaction error
      throw transactionError;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `❌ Failed to apply migration ${migration.filename}:`,
      errorMessage
    );

    return {
      success: false,
      migrationName: migration.filename,
      duration: Date.now() - startTime,
      error: errorMessage,
    };
  } finally {
    // Ensure client is always released
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error(
          `Failed to release database client: ${releaseError instanceof Error ? releaseError.message : 'Unknown error'}`
        );
      }
    }
  }
}

/**
 * Check database connection with enhanced diagnostics
 */
async function checkConnection(): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT 
        version() as version,
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_addr,
        inet_server_port() as server_port,
        NOW() as current_time
    `);

    const info = result.rows[0];
    console.log(`🔗 Database connected:`, {
      database: info.database,
      user: info.user,
      server: info.server_addr
        ? `${info.server_addr}:${info.server_port}`
        : 'local',
      time: info.current_time,
      version: info.version.split(' ')[0] + ' ' + info.version.split(' ')[1],
    });

    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database connection failed:', errorMessage);
    return false;
  }
}

/**
 * Get migration statistics
 */
async function getMigrationStats(): Promise<{
  totalMigrations: number;
  appliedMigrations: number;
  lastMigration?: string;
  lastAppliedAt?: Date;
}> {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        MAX(name) as last_migration,
        MAX(applied_at) as last_applied_at
      FROM migrations
    `);

    if (result.rows.length === 0) {
      return { totalMigrations: 0, appliedMigrations: 0 };
    }

    const stats = result.rows[0];
    return {
      totalMigrations: parseInt(stats.total),
      appliedMigrations: parseInt(stats.total),
      lastMigration: stats.last_migration,
      lastAppliedAt: stats.last_applied_at,
    };
  } catch (error) {
    return { totalMigrations: 0, appliedMigrations: 0 };
  }
}

/**
 * Main initialization function with comprehensive error handling
 */
async function init(): Promise<InitializationResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  let migrationsApplied = 0;
  let migrationsSkipped = 0;

  try {
    console.log('🚀 Starting database initialization...');
    console.log(`📁 Using migrations directory: ${MIGRATIONS_DIR}`);
    console.log(`🌍 Environment: ${config.app.nodeEnv}`);

    // Check database connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }

    // Load migration files
    const migrations = loadMigrationFiles();
    console.log(`📋 Found ${migrations.length} migration file(s)`);

    if (migrations.length === 0) {
      console.log('✅ No migrations to apply');
      return {
        success: true,
        totalDuration: Date.now() - startTime,
        migrationsApplied: 0,
        migrationsSkipped: 0,
        errors: [],
        warnings: [],
      };
    }

    // Create necessary tables
    await createMigrationsTable();
    await createMigrationLockTable();

    // Get current migration stats
    const initialStats = await getMigrationStats();
    console.log(
      `📊 Database has ${initialStats.appliedMigrations} applied migration(s)`
    );

    // Apply migrations in order
    for (const migration of migrations) {
      const result = await applyMigration(migration);

      if (result.success) {
        if (result.skipped) {
          migrationsSkipped++;
        } else {
          migrationsApplied++;
        }
      } else if (result.error) {
        errors.push(`${migration.filename}: ${result.error}`);

        // Stop on first error in production
        if (config.app.isProduction) {
          break;
        }
      }
    }

    const duration = Date.now() - startTime;
    const finalStats = await getMigrationStats();

    // Log final results
    if (errors.length > 0) {
      console.error(
        `⚠️  Database initialization completed with ${errors.length} error(s) in ${duration}ms`
      );
      console.log(
        `📊 Final state: ${finalStats.appliedMigrations} migration(s) applied`
      );

      return {
        success: false,
        totalDuration: duration,
        migrationsApplied,
        migrationsSkipped,
        errors,
        warnings,
      };
    }

    console.log(
      `✅ Database initialization completed successfully in ${duration}ms`
    );
    console.log(
      `📊 Applied: ${migrationsApplied}, Skipped: ${migrationsSkipped}, Total: ${finalStats.appliedMigrations}`
    );

    if (finalStats.lastMigration) {
      console.log(`📅 Latest migration: ${finalStats.lastMigration}`);
    }

    return {
      success: true,
      totalDuration: duration,
      migrationsApplied,
      migrationsSkipped,
      errors: [],
      warnings,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database initialization failed:', errorMessage);

    // Log additional context in development
    if (config.app.isDevelopment) {
      console.error('Full error:', error);
    }

    const duration = Date.now() - startTime;
    return {
      success: false,
      totalDuration: duration,
      migrationsApplied,
      migrationsSkipped,
      errors: [errorMessage],
      warnings,
    };
  }
}

/**
 * Graceful cleanup with timeout
 */
async function cleanup(): Promise<void> {
  try {
    console.log('🧹 Cleaning up database connections...');

    // Set a timeout for cleanup
    const cleanupPromise = pool.end();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cleanup timeout')), 10000)
    );

    await Promise.race([cleanupPromise, timeoutPromise]);
    console.log('✅ Database connections closed');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during cleanup:', errorMessage);
  }
}

// Enhanced process termination handlers
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`📢 Received ${signal}, shutting down gracefully...`);
  try {
    await cleanup();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

/**
 * Enhanced utility function for health checks
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  migrationsApplied: number;
  lastMigration?: string;
  lastAppliedAt?: Date;
  lockStatus?: MigrationLock;
  error?: string;
}> {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return {
        connected: false,
        migrationsApplied: 0,
        error: 'Connection failed',
      };
    }

    const stats = await getMigrationStats();

    // Check lock status
    let lockStatus: MigrationLock = { locked: false };
    try {
      const lockResult = await pool.query(`
        SELECT locked, locked_by, locked_at 
        FROM migration_locks 
        WHERE id = 1
      `);

      if (lockResult.rows.length > 0) {
        const lock = lockResult.rows[0];
        lockStatus = {
          locked: lock.locked,
          lockedBy: lock.locked_by,
          lockedAt: lock.locked_at,
        };
      }
    } catch (error) {
      // Lock table might not exist yet
    }

    return {
      connected: true,
      migrationsApplied: stats.appliedMigrations,
      lastMigration: stats.lastMigration,
      lastAppliedAt: stats.lastAppliedAt,
      lockStatus,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      migrationsApplied: 0,
      error: errorMessage,
    };
  }
}

/**
 * CLI runner function with enhanced error handling
 */
export async function runCLI(): Promise<void> {
  try {
    console.log(
      `🏁 Starting migration CLI for ${config.app.name} (${config.app.nodeEnv})`
    );

    const result = await init();

    // Always cleanup, regardless of success
    await cleanup();

    if (result.success) {
      console.log('🎉 Migration process completed successfully');
      process.exit(0);
    } else {
      console.error('💥 Migration process failed');
      console.error('Errors:', result.errors);
      process.exit(1);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Fatal error during migration:', errorMessage);

    try {
      await cleanup();
    } catch (cleanupError) {
      console.error('❌ Additional error during cleanup:', cleanupError);
    }

    process.exit(1);
  }
}

/**
 * Rollback functionality (basic implementation)
 */
export async function rollbackLastMigration(): Promise<{
  success: boolean;
  migrationName?: string;
  error?: string;
}> {
  try {
    const stats = await getMigrationStats();

    if (!stats.lastMigration) {
      return {
        success: false,
        error: 'No migrations to rollback',
      };
    }

    console.log(`⚠️  Rolling back migration: ${stats.lastMigration}`);
    console.log(
      'Note: This only removes the migration record. Manual cleanup may be required.'
    );

    await pool.query('DELETE FROM migrations WHERE name = $1', [
      stats.lastMigration,
    ]);

    console.log(`✅ Migration record removed: ${stats.lastMigration}`);

    return {
      success: true,
      migrationName: stats.lastMigration,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Export enhanced functions
export {
  init,
  checkConnection,
  applyMigration,
  cleanup,
  loadMigrationFiles,
  getMigrationStats,
};

export default init;
