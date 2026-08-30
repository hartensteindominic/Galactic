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

const integritySource = fs.readFileSync('lib/prototype-migration-integrity.ts', 'utf8');
assert.ok(integritySource.includes('repositoryManifestAvailable: true'));
assert.ok(integritySource.includes('appendOnlyFingerprintEnforcedInCi: true'));
assert.ok(integritySource.includes('targetDatabaseHistoryVerificationImplemented: false'));
assert.ok(integritySource.includes('externalExecutionVerified: false'));
assert.ok(integritySource.includes('restoreExerciseVerified: false'));
assert.ok(integritySource.includes('productionApprovalVerified: false'));

const readinessSource = fs.readFileSync('lib/prototype-readiness.ts', 'utf8');
assert.ok(readinessSource.includes('repositoryMigrationManifestAvailable: migrationIntegrity.repositoryManifestAvailable'));
assert.ok(readinessSource.includes('repositoryMigrationFingerprintsEnforced: migrationIntegrity.appendOnlyFingerprintEnforcedInCi'));
assert.ok(readinessSource.includes('targetDatabaseMigrationHistoryVerified: false'));
assert.ok(readinessSource.includes('prototypeMigrationsExternalExecutionVerified: false'));
assert.ok(readinessSource.includes('migrationRecoveryExerciseVerified: false'));

const trustSource = fs.readFileSync('lib/prototype-trust.ts', 'utf8');
assert.ok(trustSource.includes("id: 'migration-integrity'"));
assert.ok(trustSource.includes('targetDatabaseMigrationHistoryVerified: false'));
assert.ok(trustSource.includes('prototypeMigrationsExternalExecutionVerified: false'));
assert.ok(trustSource.includes('Repository fingerprints do not prove target-database migration history'));

const statusRoute = fs.readFileSync('app/api/prototype/status/route.ts', 'utf8');
assert.ok(statusRoute.includes('migrationIntegrity: prototypeMigrationIntegrityStatus()'));
assert.ok(statusRoute.includes('Repository migration fingerprints'));
assert.ok(statusRoute.includes('do not prove Supabase migration execution/order'));
assert.ok(statusRoute.includes('production approval'));

console.log('Migration ordering, append-only fingerprint, and execution/approval-boundary checks passed.');
