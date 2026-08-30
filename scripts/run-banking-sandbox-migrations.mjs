import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Pool } from 'pg';

const databaseUrl = (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim();
const databaseEnabled = process.env.BANKING_SANDBOX_DATABASE_ENABLED === 'true';
const liveWritesRequested = process.env.BANKING_ENABLE_LIVE_WRITES === 'true';
const sslEnabled = process.env.BANKING_SANDBOX_DATABASE_SSL !== 'false';

if (!databaseEnabled) {
  throw new Error('Refusing migration: BANKING_SANDBOX_DATABASE_ENABLED must be true.');
}

if (liveWritesRequested) {
  throw new Error('Refusing migration: production banking live-write flag is enabled.');
}

if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  throw new Error('Refusing migration: BANKING_SANDBOX_DATABASE_URL is not a PostgreSQL connection string.');
}

const migrationsDir = path.resolve('db/migrations');
const files = fs.readdirSync(migrationsDir)
  .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
  .sort();

if (!files.length) throw new Error('No banking migrations found.');

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  application_name: 'galactic-trust-sandbox-migrations',
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 5_000,
  ssl: sslEnabled ? { rejectUnauthorized: true } : false
});

const client = await pool.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS galactic_schema_migrations (
      migration_name text PRIMARY KEY,
      checksum_sha256 text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existing = await client.query(
      'SELECT checksum_sha256 FROM galactic_schema_migrations WHERE migration_name = $1',
      [file]
    );

    if (existing.rowCount) {
      if (existing.rows[0].checksum_sha256 !== checksum) {
        throw new Error(`Migration checksum changed after application: ${file}`);
      }
      console.log(`Already applied: ${file}`);
      continue;
    }

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO galactic_schema_migrations (migration_name, checksum_sha256) VALUES ($1,$2)',
        [file, checksum]
      );
      await client.query('COMMIT');
      console.log(`Applied: ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  console.log('Galactic Trust provider-sandbox banking migrations are current.');
} finally {
  client.release();
  await pool.end();
}
