import { Pool, PoolClient, PoolConfig, QueryResult, QueryConfig } from 'pg';
import { baseConfig as config } from '@packages/config/env';

// Type definitions
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  poolStats?: PoolStats;
  error?: string;
  timestamp: string;
}

export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
}

export interface QueryOptions {
  name?: string;
  timeout?: number;
  logQuery?: boolean;
}

export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

interface ExtendedPoolClient extends PoolClient {
  processID?: number;
}

// Function to create a new pool with custom config or use defaults
export const createPool = (customConfig?: PoolConfig): Pool => {
  const poolConfig: PoolConfig = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    max: config.database.pool.max,
    min: config.database.pool.min,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
    statement_timeout: 60000,
    ssl: config.database.ssl,
    application_name: `${config.app.name}-${config.app.nodeEnv}`,
    ...customConfig, // override defaults
  };

  return new Pool(poolConfig);
};

// Default pool instance using centralized config
export const defaultPool = createPool();

const getClientId = (client: ExtendedPoolClient): string => {
  return client.processID ? client.processID.toString() : 'unknown';
};

// Register event listeners on the pool (can be called for any pool)
export const registerPoolEventHandlers = (pool: Pool): void => {
  pool.on('connect', (client: PoolClient) => {
    const extendedClient = client as ExtendedPoolClient;
    if (config.app.isDevelopment) {
      console.log('🔗 New database client connected', {
        clientId: getClientId(extendedClient),
        timestamp: new Date().toISOString(),
      });
    }
  });

  pool.on('acquire', (client: PoolClient) => {
    const extendedClient = client as ExtendedPoolClient;
    if (config.app.isDevelopment) {
      console.log('📤 Client acquired from pool', {
        clientId: getClientId(extendedClient),
        timestamp: new Date().toISOString(),
      });
    }
  });

  pool.on('release', (err: Error | undefined, client: PoolClient) => {
    const extendedClient = client as ExtendedPoolClient;
    if (err) {
      console.error('❌ Error releasing client:', {
        error: err.message,
        clientId: getClientId(extendedClient),
        timestamp: new Date().toISOString(),
      });
    } else if (config.app.isDevelopment) {
      console.log('📥 Client released back to pool', {
        clientId: getClientId(extendedClient),
        timestamp: new Date().toISOString(),
      });
    }
  });

  pool.on('remove', (client: PoolClient) => {
    const extendedClient = client as ExtendedPoolClient;
    if (config.app.isDevelopment) {
      console.log('🗑️ Client removed from pool', {
        clientId: getClientId(extendedClient),
        timestamp: new Date().toISOString(),
      });
    }
  });

  pool.on('error', (err: Error, client?: PoolClient) => {
    const extendedClient = client as ExtendedPoolClient;
    console.error('❌ Pool error:', {
      message: err.message,
      code: (err as any).code,
      clientId: client ? getClientId(extendedClient) : 'no-client',
      timestamp: new Date().toISOString(),
    });

    if (config.app.isDevelopment) {
      console.error('Full error:', err);
    }
  });
};

// Register events on defaultPool automatically
registerPoolEventHandlers(defaultPool);

// Query function with optional pool instance
export const query = async <T extends Record<string, any> = any>(
  text: string,
  params?: readonly any[],
  options?: QueryOptions,
  poolInstance: Pool = defaultPool
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const client = await poolInstance.connect();

  try {
    const queryConfig: QueryConfig = {
      text,
      values: params ? Array.from(params) : undefined,
      ...(options?.name && { name: options.name }),
    };

    const result = await client.query<T>(queryConfig);
    const duration = Date.now() - start;

    const slowQueryThreshold = 1000; // 1 second
    if (duration > slowQueryThreshold) {
      console.warn('🐌 Slow query detected:', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rowCount: result.rowCount,
        timestamp: new Date().toISOString(),
      });
    }

    if (config.app.isDevelopment || options?.logQuery) {
      console.log('🔍 Query executed:', {
        query: text,
        params,
        duration: `${duration}ms`,
        rowCount: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ Query error:', {
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params,
      error: errorMessage,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    throw error;
  } finally {
    client.release();
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: TransactionCallback<T>,
  poolInstance: Pool = defaultPool
): Promise<T> => {
  const client = await poolInstance.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');

    if (config.app.isDevelopment) {
      console.log('✅ Transaction committed successfully');
    }

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(
      '❌ Transaction rolled back:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  } finally {
    client.release();
  }
};

// Health check function
export const checkHealth = async (
  poolInstance: Pool = defaultPool
): Promise<HealthCheckResult> => {
  const timestamp = new Date().toISOString();

  try {
    const start = Date.now();
    await poolInstance.query('SELECT 1');
    const latency = Date.now() - start;

    return {
      status: 'healthy',
      latency,
      poolStats: {
        totalConnections: poolInstance.totalCount,
        idleConnections: poolInstance.idleCount,
        waitingClients: poolInstance.waitingCount,
      },
      timestamp,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'unhealthy',
      error: errorMessage,
      timestamp,
    };
  }
};

// Prepared statement helper
export const preparedQuery = async <T extends Record<string, any> = any>(
  name: string,
  text: string,
  values?: readonly any[],
  poolInstance: Pool = defaultPool
): Promise<QueryResult<T>> => {
  const client = await poolInstance.connect();

  try {
    return await client.query<T>({ name, text, values });
  } finally {
    client.release();
  }
};

// Bulk insert helper
export const bulkInsert = async <T extends Record<string, any> = any>(
  tableName: string,
  columns: readonly string[],
  rows: readonly (readonly any[])[],
  onConflict?: string,
  poolInstance: Pool = defaultPool
): Promise<QueryResult<T>> => {
  if (rows.length === 0) {
    throw new Error('No rows provided for bulk insert');
  }

  if (rows.some(row => row.length !== columns.length)) {
    throw new Error('All rows must have the same number of columns');
  }

  const placeholders = rows
    .map((_, rowIndex) => {
      const rowPlaceholders = columns
        .map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
        .join(', ');
      return `(${rowPlaceholders})`;
    })
    .join(', ');

  const values = rows.flat();
  const conflictClause = onConflict ? ` ${onConflict}` : '';

  const queryText = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES ${placeholders}${conflictClause}
  `;

  return query<T>(queryText, values, undefined, poolInstance);
};

// Graceful shutdown for any pool
export const shutdown = async (
  poolInstance: Pool = defaultPool
): Promise<void> => {
  try {
    console.log('🛑 Shutting down database connections...');
    await poolInstance.end();
    console.log('✅ Database connections closed gracefully');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during database shutdown:', errorMessage);
    throw error;
  }
};

// Handle process termination (only hooked for defaultPool here)
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`📢 Received ${signal}, shutting down gracefully...`);
  try {
    await shutdown(defaultPool);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

// Export pg types for external usage
export type { PoolClient, QueryResult, PoolConfig, QueryConfig } from 'pg';

// Query builder helpers with optional poolInstance
export const queryBuilder = {
  select: <T extends Record<string, any> = any>(
    table: string,
    columns: readonly string[] = ['*'],
    where?: string,
    params?: readonly any[],
    poolInstance: Pool = defaultPool
  ) => ({
    text: `SELECT ${columns.join(', ')} FROM ${table}${where ? ` WHERE ${where}` : ''}`,
    values: params,
    execute: () =>
      query<T>(
        `SELECT ${columns.join(', ')} FROM ${table}${where ? ` WHERE ${where}` : ''}`,
        params,
        undefined,
        poolInstance
      ),
  }),

  insert: <T extends Record<string, any> = any>(
    table: string,
    data: Record<string, any>,
    poolInstance: Pool = defaultPool
  ) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    return {
      text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
      execute: () =>
        query<T>(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
          values,
          undefined,
          poolInstance
        ),
    };
  },

  update: <T extends Record<string, any> = any>(
    table: string,
    data: Record<string, any>,
    where: string,
    whereParams: readonly any[],
    poolInstance: Pool = defaultPool
  ) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const whereClause = where.replace(
      /\$(\d+)/g,
      (match, num) => `$${values.length + parseInt(num)}`
    );

    return {
      text: `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`,
      values: [...values, ...whereParams],
      execute: () =>
        query<T>(
          `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`,
          [...values, ...whereParams],
          undefined,
          poolInstance
        ),
    };
  },

  delete: <T extends Record<string, any> = any>(
    table: string,
    where: string,
    params: readonly any[],
    poolInstance: Pool = defaultPool
  ) => ({
    text: `DELETE FROM ${table} WHERE ${where} RETURNING *`,
    values: params,
    execute: () =>
      query<T>(
        `DELETE FROM ${table} WHERE ${where} RETURNING *`,
        params,
        undefined,
        poolInstance
      ),
  }),
};

// Connection testing utility
export const testConnection = async (
  poolInstance: Pool = defaultPool
): Promise<boolean> => {
  try {
    const result = await query(
      'SELECT version() as version',
      undefined,
      undefined,
      poolInstance
    );
    console.log(
      '✅ Database connection test successful:',
      result.rows[0].version
    );
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};
