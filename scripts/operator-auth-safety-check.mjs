import fs from 'node:fs';

const required = [
  ['lib/prototype-operator-auth.ts', 'const SESSION_TTL_MS = 8 * 60 * 60 * 1000', 'operator session TTL must remain explicit'],
  ['lib/prototype-operator-auth.ts', 'const MIN_SECRET_LENGTH = 32', 'operator access secret minimum must remain explicit'],
  ['lib/prototype-operator-auth.ts', "'OPERATOR_ACCESS_SECRET_TOO_WEAK'", 'weak operator secrets must fail closed'],
  ['lib/prototype-operator-auth.ts', "'OPERATOR_ACCESS_NOT_CONFIGURED'", 'persistent operator access without a configured secret must fail closed'],
  ['lib/prototype-operator-auth.ts', "'INVALID_OPERATOR_ACCESS'", 'incorrect presented operator secrets must fail closed'],
  ['lib/prototype-operator-auth.ts', "'EXPIRED_OPERATOR_SESSION'", 'expired operator sessions must fail closed'],
  ['lib/prototype-operator-auth.ts', "createHmac('sha256'", 'operator sessions must be signed'],
  ['lib/prototype-operator-auth.ts', 'randomBytes(18)', 'operator sessions must include a random nonce'],
  ['lib/prototype-operator-auth.ts', 'HttpOnly; SameSite=Strict', 'operator session cookie must be HttpOnly and SameSite Strict'],
  ['lib/prototype-operator-auth.ts', "process.env.NODE_ENV === 'production' ? '; Secure' : ''", 'operator cookies must add Secure in production'],
  ['scripts/operator-auth-runtime-check.mjs', 'Operator authentication runtime behavior checks passed.', 'operator authentication must have executable behavioral coverage'],
  ['package.json', 'scripts/operator-auth-runtime-check.mjs', 'operator authentication runtime coverage must run in the CI safety suite']
];

const forbidden = [
  ['app/prototype/operations/operations-shell.tsx', 'localStorage', 'operator credentials/session must not be stored in localStorage'],
  ['app/prototype/operations/operations-shell.tsx', 'sessionStorage', 'operator credentials/session must not be stored in sessionStorage'],
  ['app/prototype/operations/operations-shell.tsx', 'document.cookie', 'operator session cookie must remain HttpOnly and unavailable to browser JS']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype operator secret, signed-session, expiry, cookie, and runtime-coverage safety checks passed.');
