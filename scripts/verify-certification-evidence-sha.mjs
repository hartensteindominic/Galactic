import { createHash } from 'node:crypto';
import fs from 'node:fs';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) sorted[key] = canonicalize(value[key]);
    return sorted;
  }
  return value;
}

const filePath = process.argv[2];
if (!filePath) fail('Usage: node scripts/verify-certification-evidence-sha.mjs <evidence-bundle.json>');

let envelope;
try {
  envelope = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch {
  fail('Evidence bundle could not be read as JSON.');
}

const candidate = envelope?.evidence || envelope;
if (!candidate?.manifest || typeof candidate.manifestSha256 !== 'string') {
  fail('Evidence bundle must contain manifest and manifestSha256.');
}

const canonical = JSON.stringify(canonicalize(candidate.manifest));
const actual = createHash('sha256').update(canonical).digest('hex');
const expected = candidate.manifestSha256.toLowerCase();

if (!/^[a-f0-9]{64}$/.test(expected)) fail('Stored manifestSha256 is not a valid SHA-256 hex digest.');
if (actual !== expected) {
  fail(`INVALID: manifest SHA-256 mismatch\nexpected=${expected}\nactual=${actual}`);
}

console.log(`VALID: manifest SHA-256 matches ${actual}`);
console.log('Note: this verifies manifest integrity only. The Galactic internal HMAC requires server-side verification and is not a third-party notarization.');
