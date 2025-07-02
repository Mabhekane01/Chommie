import { rollback } from '@packages/database';

async function rollbackLast() {
  await rollback();
}

rollbackLast();
