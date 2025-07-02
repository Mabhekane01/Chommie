// src/scripts/db-status.ts
import { getDatabaseStatus, cleanup } from '../client/init.js';

export async function checkStatus() {
  try {
    console.log('📊 Checking database status...\n');

    const status = await getDatabaseStatus();

    console.log('Database Status:');
    console.log(`  Connected: ${status.connected ? '✅' : '❌'}`);
    console.log(`  Migrations Applied: ${status.migrationsApplied}`);

    if (status.lastMigration) {
      console.log(`  Last Migration: ${status.lastMigration}`);
      console.log(`  Applied At: ${status.lastAppliedAt}`);
    }

    if (status.lockStatus) {
      console.log(
        `  Migration Lock: ${status.lockStatus.locked ? '🔒 Locked' : '🔓 Unlocked'}`
      );
      if (status.lockStatus.locked) {
        console.log(`    Locked By: ${status.lockStatus.lockedBy}`);
        console.log(`    Locked At: ${status.lockStatus.lockedAt}`);
      }
    }

    if (status.error) {
      console.log(`  Error: ${status.error}`);
    }
  } catch (error) {
    console.error('❌ Error checking database status:', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}
