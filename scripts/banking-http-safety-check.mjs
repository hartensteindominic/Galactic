import fs from 'node:fs';

const required = [
  ['lib/banking-http.ts', "headers.set('Cache-Control', 'no-store, max-age=0')", 'banking JSON responses must remain non-cacheable'],
  ['lib/banking-http.ts', "headers.set('Pragma', 'no-cache')", 'banking JSON responses must retain legacy no-cache protection'],
  ['lib/banking-http.ts', "code: 'INTERNAL_ERROR'", 'unexpected API failures must use a generic client error code'],
  ['lib/banking-http.ts', "message: 'Banking service is temporarily unavailable.'", 'unexpected API failures must use a generic client message'],
  ['lib/banking-http.ts', "{ 'X-Error-ID': errorId }", 'banking API failures must expose a correlation ID header'],
  ['lib/banking-http.ts', "name: error instanceof Error ? error.name : 'UnknownError'", 'unexpected server logging must retain only a safe error type plus correlation ID'],
  ['scripts/banking-http-runtime-check.mjs', 'Banking HTTP error sanitization runtime behavior checks passed.', 'banking HTTP sanitization must have executable runtime coverage'],
  ['package.json', 'scripts/banking-http-runtime-check.mjs', 'banking HTTP sanitization runtime coverage must run in the CI safety suite']
];

const forbidden = [
  ['lib/banking-http.ts', 'message: error instanceof Error ? error.message', 'unexpected raw exception messages must never be logged'],
  ['lib/banking-http.ts', 'stack:', 'unexpected banking errors must not serialize stack traces'],
  ['lib/banking-http.ts', 'cause:', 'unexpected banking errors must not serialize raw causes'],
  ['lib/banking-http.ts', 'JSON.stringify(error)', 'unexpected banking errors must not dump arbitrary error payloads']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Banking API no-cache, correlation-ID, and unexpected-error sanitization safety checks passed.');
