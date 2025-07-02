import { runCLI } from '@packages/database';

async function migrate() {
  await runCLI();
}

migrate();
