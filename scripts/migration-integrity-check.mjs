import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = 'supabase/migrations';
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.externalExecutionVerified, false, 'repository fingerprints must not imply migrations were executed externally');
assert.equal(manifest.productionApprovalVerified, false, 'repository fingerprints must not imply production approval');
assert.match(manifest.appendOnlyPolicy, /new sequential migration/i);
assert.ok(Array.isArray(manifest.migrations));
assert.ok(manifest.migrations.length > 0);

const sqlFiles = fs.readdirSync(root)
  .filter((name) => /^\d{3}_.+\.sql$/.test(name))
  .sort();
const manifestFiles = manifest.migrations.map((migration) => migration.filename);
assert.deepEqual(sqlFiles, manifestFiles, 'migration manifest must enumerate every sequential SQL migration exactly once');

const ids = new Set();
const filenames = new Set();
for (let index = 0; index < manifest.migrations.length; index += 1) {
  const migration = manifest.migrations[index];
  const expectedId = String(index + 1).padStart(3, '0');

  assert.equal(migration.id, expectedId, `migration ${migration.filename} must preserve sequential numbering`);
  assert.match(migration.filename, new RegExp(`^${expectedId}_[a-z0-9_]+\\.sql$`));
  assert.equal(migration.simulationOnly, true, `${migration.filename} must remain explicitly simulation-only`);
  assert.match(migration.gitBlobSha, /^[0-9a-f]{40}$/);
  assert.equal(ids.has(migration.id), false, `duplicate migration id ${migration.id}`);
  assert.equal(filenames.has(migration.filename), false, `duplicate migration filename ${migration.filename}`);
  ids.add(migration.id);
  filenames.add(migration.filename);

  const bytes = fs.readFileSync(path.join(root, migration.filename));
  const actualGitBlobSha = createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex');
  assert.equal(
    actualGitBlobSha,
    migration.gitBlobSha,
    `${migration.filename} changed after being fingerprinted; add a new migration instead of silently editing locked history`
  );
}

console.log('Migration ordering, append-only fingerprint, and execution/approval-boundary checks passed.');
