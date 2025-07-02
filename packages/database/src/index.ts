// Re-export everything from client
export {
  query,
  withTransaction,
  preparedQuery,
  checkHealth,
  shutdown,
} from './client/client.js';

// Re-export initialization
export {
  init,
  checkConnection,
  applyMigration,
  cleanup,
  loadMigrationFiles,
  getMigrationStats,
  getDatabaseStatus,
  runCLI,
} from './client/init.js';
export type { User } from './types/UserProfile.js';

export { rollback } from './scripts/migrate.js';
export { checkStatus } from './scripts/db-status.js';

export {
  checkDatabaseHealth,
  checkDatabaseWithMigrationStatus,
} from './client/health.js';
// Re-export pg types for convenience
export type { QueryResult, PoolClient } from 'pg';
