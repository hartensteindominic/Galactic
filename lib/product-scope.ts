export type GalacticProductArea =
  | 'galactic-trust-banking'
  | 'operations-and-reconciliation'
  | 'customer-support-and-trust'
  | 'cashflow-and-bill-planning'
  | 'compliance-and-charter-readiness'
  | 'provider-sandbox'
  | 'crypto-optional'
  | 'legacy-machine-licensing';

export type GalacticProductScopeRecord = {
  id: GalacticProductArea;
  disposition: 'core' | 'supporting' | 'optional-separated' | 'legacy-quarantined';
  customerSurfaceAllowed: boolean;
  productionAuthorityGranted: false;
  notes: string;
};

const scope: GalacticProductScopeRecord[] = [
  {
    id: 'galactic-trust-banking',
    disposition: 'core',
    customerSurfaceAllowed: true,
    productionAuthorityGranted: false,
    notes: 'Primary product. Customer-facing account, transfer, card, banking insight, and future regulated-program experiences belong here.'
  },
  {
    id: 'operations-and-reconciliation',
    disposition: 'supporting',
    customerSurfaceAllowed: false,
    productionAuthorityGranted: false,
    notes: 'Operator evidence, reconciliation, provider events, incidents, audit, and recovery support Galactic Trust.'
  },
  {
    id: 'customer-support-and-trust',
    disposition: 'supporting',
    customerSurfaceAllowed: true,
    productionAuthorityGranted: false,
    notes: 'Orbit, Trust, transparency, support, privacy, and controlled disclosures support the banking product.'
  },
  {
    id: 'cashflow-and-bill-planning',
    disposition: 'supporting',
    customerSurfaceAllowed: true,
    productionAuthorityGranted: false,
    notes: 'Safe-to-Spend and Bill Guard remain planning features and do not reserve or move money.'
  },
  {
    id: 'compliance-and-charter-readiness',
    disposition: 'supporting',
    customerSurfaceAllowed: false,
    productionAuthorityGranted: false,
    notes: 'Protected planning, evidence, accountability, risk, sponsor-diligence, and charter-readiness tooling.'
  },
  {
    id: 'provider-sandbox',
    disposition: 'supporting',
    customerSurfaceAllowed: false,
    productionAuthorityGranted: false,
    notes: 'Provider sandboxes are operator-controlled engineering environments using pretend money only. Sandbox success never promotes live authority.'
  },
  {
    id: 'crypto-optional',
    disposition: 'optional-separated',
    customerSurfaceAllowed: true,
    productionAuthorityGranted: false,
    notes: 'Crypto may remain as a separately gated optional product. It is not part of banking authority and live crypto remains independently fail-closed.'
  },
  {
    id: 'legacy-machine-licensing',
    disposition: 'legacy-quarantined',
    customerSurfaceAllowed: false,
    productionAuthorityGranted: false,
    notes: 'Historical x402, NFT machine-use licensing, paylink, and agent-discovery tooling is not part of Galactic Trust banking and is disabled by default.'
  }
];

function truthy(value: unknown) {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

export function legacyMachineToolsEnabled(env: NodeJS.ProcessEnv = process.env) {
  return truthy(env.GALACTIC_ENABLE_LEGACY_MACHINE_TOOLS);
}

export function galacticProductScopeStatus(env: NodeJS.ProcessEnv = process.env) {
  return {
    primaryProduct: 'Galactic Trust',
    primaryCustomerPath: '/bank',
    rootBankingPathSupported: true,
    bankAliasSupported: true,
    simulationOnlyUntilApprovedProgram: true,
    liveBankingAuthorityGranted: false,
    liveCryptoAuthorityGranted: false,
    providerSandboxMayMoveRealMoney: false,
    legacyMachineToolsEnabled: legacyMachineToolsEnabled(env),
    legacyMachineToolsDefaultEnabled: false,
    legacyMachineToolsPartOfGalacticTrust: false,
    deletingLegacyCodeRequiredForIsolation: false,
    scope,
    disclosure: 'Repository scope only. Galactic Trust is the primary product. Provider sandboxes use pretend money and do not authorize live financial activity. Legacy x402/NFT machine-licensing tools are quarantined and default off. Crypto remains a separate optional product with an independent live-approval boundary. Repository organization does not create bank, sponsor, deposit-insurance, compliance, licensing, or charter authority.'
  } as const;
}
