import { bankingStatus } from './banking';

function sandboxConfig() {
  return {
    providerName: process.env.BANKING_SANDBOX_PROVIDER_NAME || '',
    gatewayBaseUrl: process.env.BANKING_SANDBOX_GATEWAY_BASE_URL?.replace(/\/$/, '') || '',
    apiKey: process.env.BANKING_SANDBOX_API_KEY || '',
    programId: process.env.BANKING_SANDBOX_PROGRAM_ID || '',
    webhookSecret: process.env.BANKING_SANDBOX_WEBHOOK_SECRET || '',
    enabledRequested: process.env.BANKING_SANDBOX_PROVIDER_ENABLED === 'true'
  };
}

function productionConfigFingerprints() {
  return {
    gatewayBaseUrl: process.env.BANKING_GATEWAY_BASE_URL?.replace(/\/$/, '') || '',
    apiKey: process.env.BANKING_GATEWAY_API_KEY || '',
    programId: process.env.BANKING_PROGRAM_ID || ''
  };
}

export function providerSandboxStatus() {
  const banking = bankingStatus();
  const sandbox = sandboxConfig();
  const production = productionConfigFingerprints();

  const configured = Boolean(
    sandbox.providerName &&
    sandbox.gatewayBaseUrl &&
    sandbox.apiKey &&
    sandbox.programId &&
    sandbox.webhookSecret
  );

  const gatewayIsolated = !production.gatewayBaseUrl || sandbox.gatewayBaseUrl !== production.gatewayBaseUrl;
  const apiKeyIsolated = !production.apiKey || sandbox.apiKey !== production.apiKey;
  const programIsolated = !production.programId || sandbox.programId !== production.programId;
  const credentialsIsolated = gatewayIsolated && apiKeyIsolated && programIsolated;

  const blockedReasons: string[] = [];
  if (!configured) blockedReasons.push('sandbox_not_configured');
  if (!credentialsIsolated) blockedReasons.push('sandbox_not_isolated_from_production');
  if (!sandbox.enabledRequested) blockedReasons.push('sandbox_network_not_enabled');
  if (banking.liveWritesEnabled) blockedReasons.push('production_live_writes_enabled');

  const networkCallsEnabled =
    configured &&
    credentialsIsolated &&
    sandbox.enabledRequested &&
    !banking.liveWritesEnabled;

  return {
    providerName: sandbox.providerName || null,
    configured,
    credentialsIsolated,
    gatewayIsolated,
    apiKeyIsolated,
    programIsolated,
    enabledRequested: sandbox.enabledRequested,
    networkCallsEnabled,
    productionLiveWritesEnabled: banking.liveWritesEnabled,
    blockedReasons,
    secretsExposed: false,
    disclosure: networkCallsEnabled
      ? 'Provider sandbox networking is enabled with isolated sandbox credentials. Production live writes remain disabled.'
      : 'Provider sandbox networking remains disabled until isolated sandbox credentials are configured and the dedicated sandbox enable flag is explicitly set.'
  };
}
