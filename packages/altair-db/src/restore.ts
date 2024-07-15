import 'dotenv/config';
import { spawnSync } from 'child_process';

const restore = spawnSync(
  'psql',
  [
    `--dbname=${process.env.POSTGRES_DB}`,
    `--port=${process.env.POSTGRES_PORT ?? '5432'}`,
    `--host=${process.env.POSTGRES_HOST ?? 'localhost'}`,
    `--username=${process.env.POSTGRES_USER}`,
    `--file=data.sql`,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: process.env.POSTGRES_PASSWORD,
    },
  }
);

if (restore.error) {
  console.error(restore.error);
  process.exit(1);
}
