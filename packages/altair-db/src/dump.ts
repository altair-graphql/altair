import 'dotenv/config';
import { spawnSync } from 'child_process';
import { createWriteStream } from 'fs';

const dump = spawnSync(
  'pg_dump',
  [
    `--dbname=${process.env.POSTGRES_DB}`,
    `--port=${process.env.POSTGRES_PORT ?? '5432'}`,
    `--host=${process.env.POSTGRES_HOST ?? 'localhost'}`,
    `--username=${process.env.POSTGRES_USER}`,
    `--data-only`,
    `--inserts`,
    `--exclude-table=_prisma_migrations`,
    `--on-conflict-do-nothing`,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: process.env.POSTGRES_PASSWORD,
    },
  }
);

if (dump.error) {
  console.error(dump.error);
  process.exit(1);
}

if (dump.status !== 0) {
  console.error('Failed to dump database');
  process.exit(1);
}

const writeStream = createWriteStream('data.sql');
writeStream.write(dump.stdout);

console.log('Database dumped successfully');
