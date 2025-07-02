// packages/database/src/health.ts
// Updated health check that doesn't depend on migrations

import { defaultPool as pool } from './client.js';

interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

/**
 * Lightweight health check - NO migration dependencies
 * Perfect for API Gateway and services that don't manage the database
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  latency?: number;
  poolStats?: PoolStats;
  timestamp: string;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Simple ping - just check if DB responds
    await pool.query('SELECT 1 as ping');

    const latency = Date.now() - startTime;

    // Get pool statistics if available
    let poolStats: PoolStats | undefined;
    try {
      // Most PostgreSQL clients (like pg) expose these stats
      const poolAny = pool as any;
      poolStats = {
        totalCount: poolAny.totalCount || 0,
        idleCount: poolAny.idleCount || 0,
        waitingCount: poolAny.waitingCount || 0,
      };
    } catch {
      // Pool stats not available - that's okay
      poolStats = undefined;
    }

    return {
      status: 'healthy',
      connected: true,
      latency,
      poolStats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Get database status with migration info (only if migrations table exists)
 */
export async function checkDatabaseWithMigrationStatus(): Promise<{
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  migrationsTable: boolean;
  migrationsApplied?: number;
  lastMigration?: string;
  latency?: number;
  poolStats?: PoolStats;
  timestamp: string;
  error?: string;
}> {
  const healthResult = await checkDatabaseHealth();

  if (healthResult.status === 'unhealthy') {
    return {
      ...healthResult,
      migrationsTable: false,
    };
  }

  try {
    // Check if migrations table exists
    const tableResult = await pool.query(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'migrations' 
      AND table_schema = current_schema()
    `);

    const migrationsTable = tableResult.rows.length > 0;

    if (!migrationsTable) {
      return {
        ...healthResult,
        migrationsTable: false,
      };
    }

    // Get migration stats
    const migrationResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        MAX(name) as last_migration
      FROM migrations
    `);

    const stats = migrationResult.rows[0];

    return {
      ...healthResult,
      migrationsTable: true,
      migrationsApplied: parseInt(stats.total || '0'),
      lastMigration: stats.last_migration,
    };
  } catch (error) {
    // If we can't check migrations, that's okay - basic health is still good
    return {
      ...healthResult,
      migrationsTable: false,
      error: `Migration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Alias for backward compatibility
 */
export const checkHealth = checkDatabaseHealth;
