// service/scripts/migrate.ts
import { checkStatus } from '@packages/database';

async function check() {
  // optionally override config/env here if needed
  await checkStatus();
}

check();
