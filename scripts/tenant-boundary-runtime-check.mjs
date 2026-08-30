import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class BankingError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const processShim = { env: {} };

function transpile(path) {
  return ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: path
  }).outputText;
}

function evaluateWhiteLabel() {
  const moduleShim = { exports: {} };
  vm.runInNewContext(transpile('lib/white-label.ts'), {
    module: moduleShim,
    exports: moduleShim.exports,
    console,
    process: processShim,
    Map,
    Set,
    JSON,
    require(specifier) {
      if (specifier === './banking') return { BankingError };
      throw new Error(`Unexpected white-label runtime import: ${specifier}`);
    }
  }, { filename: 'white-label.runtime.cjs' });
  return moduleShim.exports;
}

const whiteLabel = evaluateWhiteLabel();

const tenantModule = { exports: {} };
vm.runInNewContext(transpile('lib/tenant-boundary.ts'), {
  module: tenantModule,
  exports: tenantModule.exports,
  console,
  process: processShim,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    if (specifier === './white-label') return whiteLabel;
    throw new Error(`Unexpected tenant-boundary runtime import: ${specifier}`);
  }
}, { filename: 'tenant-boundary.runtime.cjs' });

const {
  resolveRequestBrand,
  resolveAuthenticatedServerTenant,
  tenantBoundaryStatus
} = tenantModule.exports;

function tenant(key, name, domain) {
  return {
    key,
    name,
    shortName: name,
    legalName: name,
    supportEmail: `${key}@example.com`,
    accent: '#4f46e5',
    accentSecondary: '#22d3ee',
    logoText: key.slice(0, 2).toUpperCase(),
    domains: [domain],
    productDisclosure: 'Prototype only.',
    bankingDisclosure: 'No real money movement.'
  };
}

processShim.env.WHITE_LABEL_TENANTS_JSON = JSON.stringify([
  tenant('galactic-trust', 'Galactic Trust', 'galactic.example'),
  tenant('orbit-bank', 'Orbit Bank Experience', 'orbit.example')
]);
processShim.env.VERCEL_ENV = 'production';

assert.equal(resolveRequestBrand({ host: 'galactic.example' }).key, 'galactic-trust');
assert.equal(resolveRequestBrand({ host: 'GALACTIC.EXAMPLE:443' }).key, 'galactic-trust');
assert.equal(resolveRequestBrand({ host: 'orbit.example.' }).key, 'orbit-bank');
assert.equal(resolveRequestBrand({ host: 'orbit.example', requestedKey: 'orbit-bank' }).key, 'orbit-bank');

assert.throws(
  () => resolveRequestBrand({ host: 'galactic.example', requestedKey: 'orbit-bank' }),
  (error) => error instanceof BankingError && error.status === 403 && error.code === 'TENANT_HOST_MISMATCH'
);
assert.throws(
  () => resolveRequestBrand({ host: 'unknown.example', requestedKey: 'orbit-bank' }),
  (error) => error instanceof BankingError && error.status === 403 && error.code === 'TENANT_QUERY_OVERRIDE_FORBIDDEN'
);
assert.throws(
  () => resolveRequestBrand({ host: 'orbit.example', requestedKey: 'does-not-exist' }),
  (error) => error instanceof BankingError && error.status === 404 && error.code === 'UNKNOWN_TENANT'
);

processShim.env.VERCEL_ENV = 'preview';
assert.equal(resolveRequestBrand({ host: 'galactic-pr-123.vercel.app', requestedKey: 'orbit-bank' }).key, 'orbit-bank');
processShim.env.VERCEL_ENV = 'production';
assert.throws(
  () => resolveRequestBrand({ host: 'galactic-pr-123.vercel.app', requestedKey: 'orbit-bank' }),
  (error) => error instanceof BankingError && error.code === 'TENANT_QUERY_OVERRIDE_FORBIDDEN'
);

assert.equal(resolveAuthenticatedServerTenant('orbit-bank').key, 'orbit-bank');
assert.throws(
  () => resolveAuthenticatedServerTenant(''),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'TENANT_REQUIRED'
);
assert.throws(
  () => resolveAuthenticatedServerTenant('missing-tenant'),
  (error) => error instanceof BankingError && error.status === 404 && error.code === 'UNKNOWN_TENANT'
);

processShim.env.WHITE_LABEL_TENANTS_JSON = JSON.stringify([
  tenant('galactic-trust', 'Galactic Trust', 'shared.example'),
  tenant('orbit-bank', 'Orbit Bank Experience', 'shared.example')
]);
assert.throws(
  () => whiteLabel.configuredBrands(),
  (error) => error instanceof BankingError && error.status === 500 && error.code === 'WHITE_LABEL_CONFIG_INVALID'
);

processShim.env.WHITE_LABEL_TENANTS_JSON = JSON.stringify([
  tenant('galactic-trust', 'Galactic Trust', 'galactic.example'),
  tenant('galactic-trust', 'Duplicate Galactic', 'duplicate.example')
]);
assert.throws(
  () => whiteLabel.configuredBrands(),
  (error) => error instanceof BankingError && error.code === 'WHITE_LABEL_CONFIG_INVALID'
);

const controls = tenantBoundaryStatus();
assert.equal(controls.productionHostBinding, true);
assert.equal(controls.previewTenantOverrideAllowed, true);
assert.equal(controls.previewOverrideRequiresExplicitVercelPreviewEnvironment, true);
assert.equal(controls.crossTenantHostOverrideRejected, true);
assert.equal(controls.unknownTenantRejected, true);
assert.equal(controls.authenticatedServerRoutesRequireExplicitTenant, true);

console.log('Tenant boundary runtime behavior checks passed.');
