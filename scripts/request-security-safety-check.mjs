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
  ['app/api/prototype/capital-planning/route.ts', 'requireJsonRequest', 'capital planning must require JSON'],
  ['app/api/prototype/capital-planning/route.ts', 'requireTrustedOrigin', 'capital planning must enforce trusted origin'],
  ['app/api/prototype/capital-planning/route.ts', 'readJsonBodyLimited', 'capital planning must bound request bodies'],
  ['app/api/prototype/compliance-applicability/route.ts', 'requireJsonRequest', 'compliance applicability must require JSON'],
  ['app/api/prototype/compliance-applicability/route.ts', 'requireTrustedOrigin', 'compliance applicability must enforce trusted origin'],
  ['app/api/prototype/compliance-applicability/route.ts', 'readJsonBodyLimited', 'compliance applicability must bound request bodies'],
  ['app/api/prototype/accountability/route.ts', 'requireJsonRequest', 'accountability planning must require JSON'],
  ['app/api/prototype/accountability/route.ts', 'requireTrustedOrigin', 'accountability planning must enforce trusted origin'],
  ['app/api/prototype/accountability/route.ts', 'readJsonBodyLimited', 'accountability planning must bound request bodies'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'requireJsonRequest', 'three-year bank planning must require JSON'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'requireTrustedOrigin', 'three-year bank planning must enforce trusted origin'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'readJsonBodyLimited', 'three-year bank planning must bound request bodies'],
  ['app/api/prototype/assumption-evidence/route.ts', 'requireJsonRequest', 'assumption evidence must require JSON'],
  ['app/api/prototype/assumption-evidence/route.ts', 'requireTrustedOrigin', 'assumption evidence must enforce trusted origin'],
  ['app/api/prototype/assumption-evidence/route.ts', 'readJsonBodyLimited', 'assumption evidence must bound request bodies'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'requireJsonRequest', 'sponsor diligence must require JSON'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'requireTrustedOrigin', 'sponsor diligence must enforce trusted origin'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'readJsonBodyLimited', 'sponsor diligence must bound request bodies'],
  ['app/api/prototype/operator/session/route.ts', 'requireTrustedOrigin', 'operator session mutation must enforce trusted origin'],
  ['app/api/prototype/operator/session/route.ts', 'readJsonBodyLimited', 'operator sign-in must bound request bodies'],
  ['app/api/assistant/route.ts', 'readJsonBodyLimited', 'assistant endpoint must bound request bodies']
];

const forbidden = [
  ['app/api/prototype/transfers/route.ts', 'await request.json()', 'prototype transfers must not bypass bounded JSON parsing'],
  ['app/api/prototype/reconcile/route.ts', 'await request.json()', 'prototype reconciliation must not bypass bounded JSON parsing'],
  ['app/api/prototype/business-thesis/route.ts', 'await request.json()', 'business thesis must not bypass bounded JSON parsing'],
  ['app/api/prototype/unit-economics/route.ts', 'await request.json()', 'unit economics must not bypass bounded JSON parsing'],
  ['app/api/prototype/capital-planning/route.ts', 'await request.json()', 'capital planning must not bypass bounded JSON parsing'],
  ['app/api/prototype/compliance-applicability/route.ts', 'await request.json()', 'compliance applicability must not bypass bounded JSON parsing'],
  ['app/api/prototype/accountability/route.ts', 'await request.json()', 'accountability planning must not bypass bounded JSON parsing'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'await request.json()', 'three-year bank planning must not bypass bounded JSON parsing'],
  ['app/api/prototype/assumption-evidence/route.ts', 'await request.json()', 'assumption evidence must not bypass bounded JSON parsing'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'await request.json()', 'sponsor diligence must not bypass bounded JSON parsing'],
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
