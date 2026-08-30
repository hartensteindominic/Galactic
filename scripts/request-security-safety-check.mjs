import fs from 'node:fs';

const required = [
  ['lib/request-security.ts', "'JSON_REQUIRED'", 'JSON-only endpoints must fail closed on wrong content type'],
  ['lib/request-security.ts', "'REQUEST_BODY_TOO_LARGE'", 'bounded body reader must reject oversized payloads'],
  ['lib/request-security.ts', "'INVALID_JSON'", 'bounded body reader must reject malformed JSON'],
  ['lib/request-security.ts', "'UNTRUSTED_ORIGIN'", 'browser mutation boundary must reject cross-site origins'],
  ['lib/request-security.ts', 'new TextEncoder().encode(text).byteLength', 'body limits must use byte length rather than JS string length'],
  ['scripts/request-security-runtime-check.mjs', 'Request security runtime behavior checks passed.', 'request-security helpers must have executable behavioral coverage'],
  ['package.json', 'scripts/request-security-runtime-check.mjs', 'request-security runtime coverage must run in the CI safety suite'],
  ['app/api/prototype/transfers/route.ts', 'requireJsonRequest', 'prototype transfers must require JSON'],
  ['app/api/prototype/transfers/route.ts', 'requireTrustedOrigin', 'prototype transfers must enforce trusted origin'],
  ['app/api/prototype/transfers/route.ts', 'readJsonBodyLimited', 'prototype transfers must bound request bodies'],
  ['app/api/prototype/reconcile/route.ts', 'requireJsonRequest', 'prototype reconciliation must require JSON'],
  ['app/api/prototype/reconcile/route.ts', 'requireTrustedOrigin', 'prototype reconciliation must enforce trusted origin'],
  ['app/api/prototype/reconcile/route.ts', 'readJsonBodyLimited', 'prototype reconciliation must bound request bodies'],
  ['app/api/prototype/business-thesis/route.ts', 'requireJsonRequest', 'business thesis must require JSON'],
  ['app/api/prototype/business-thesis/route.ts', 'requireTrustedOrigin', 'business thesis must enforce trusted origin'],
  ['app/api/prototype/business-thesis/route.ts', 'readJsonBodyLimited', 'business thesis must bound request bodies'],
  ['app/api/prototype/unit-economics/route.ts', 'requireJsonRequest', 'unit economics must require JSON'],
  ['app/api/prototype/unit-economics/route.ts', 'requireTrustedOrigin', 'unit economics must enforce trusted origin'],
  ['app/api/prototype/unit-economics/route.ts', 'readJsonBodyLimited', 'unit economics must bound request bodies'],
  ['app/api/prototype/operator/session/route.ts', 'requireTrustedOrigin', 'operator session mutation must enforce trusted origin'],
  ['app/api/prototype/operator/session/route.ts', 'readJsonBodyLimited', 'operator sign-in must bound request bodies'],
  ['app/api/assistant/route.ts', 'readJsonBodyLimited', 'assistant endpoint must bound request bodies']
];

const forbidden = [
  ['app/api/prototype/transfers/route.ts', 'await request.json()', 'prototype transfers must not bypass bounded JSON parsing'],
  ['app/api/prototype/reconcile/route.ts', 'await request.json()', 'prototype reconciliation must not bypass bounded JSON parsing'],
  ['app/api/prototype/business-thesis/route.ts', 'await request.json()', 'business thesis must not bypass bounded JSON parsing'],
  ['app/api/prototype/unit-economics/route.ts', 'await request.json()', 'unit economics must not bypass bounded JSON parsing'],
  ['app/api/prototype/operator/session/route.ts', 'await request.json()', 'operator sign-in must not bypass bounded JSON parsing'],
  ['app/api/assistant/route.ts', 'await request.json()', 'assistant endpoint must not bypass bounded JSON parsing']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Request content-type, body-size, JSON parsing, and trusted-origin safety checks passed.');
