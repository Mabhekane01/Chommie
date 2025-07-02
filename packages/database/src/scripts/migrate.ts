// src/scripts/rollback.ts
import { rollbackLastMigration, cleanup } from '../client/init.js';

export async function rollback() {
  try {
    console.log('🔄 Rolling back last migration...');

    const result = await rollbackLastMigration();

    if (result.success) {
      console.log(`✅ Successfully rolled back: ${result.migrationName}`);
    } else {
      console.error(`❌ Rollback failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error during rollback:', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}
