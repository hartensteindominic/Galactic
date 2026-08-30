import { aiGovernanceStatus } from './ai-governance';
import { customerTermsControlStatus } from './customer-terms-control';
import { financialIntentControlStatus } from './financial-intent-state';
import { prototypeIncidentCommunicationControlStatus } from './prototype-incident-status';
import { prototypeMigrationIntegrityStatus } from './prototype-migration-integrity';
import { supportCaseControlStatus } from './support-case-state';
import { supportSensitiveDataControlStatus } from './support-sensitive-data';
import { tenantBoundaryStatus } from './tenant-boundary';
import { thirdPartyInventoryStatus } from './third-party-inventory';

export type TrustControlStatus = 'implemented-prototype' | 'not-production-ready' | 'external-approval-required';

export type TrustControl = {
  id: string;
  name: string;
  status: TrustControlStatus;
  summary: string;
  limitation: string;
};

export function prototypeTrustCenter() {
  const ai = aiGovernanceStatus();
  const terms = customerTermsControlStatus();
  const intents = financialIntentControlStatus();
  const incident = prototypeIncidentCommunicationControlStatus();
  const migrations = prototypeMigrationIntegrityStatus();
  const support = supportCaseControlStatus();
  const sensitiveData = supportSensitiveDataControlStatus();
  const tenant = tenantBoundaryStatus();
  const vendors = thirdPartyInventoryStatus();

  const controls: TrustControl[] = [
    {
      id: 'simulation-only',
      name: 'Simulation-only financial activity',
      status: 'implemented-prototype',
      summary: 'Prototype balances and transfers are synthetic. Prototype routes do not move real customer money.',
      limitation: 'This is not a deposit account, payment account, or authorization to offer live banking services.'
    },
    {
      id: 'tenant-isolation',
      name: 'White-label tenant boundary',
      status: 'implemented-prototype',
      summary: tenant.productionHostBinding && tenant.crossTenantHostOverrideRejected
        ? 'Configured hostnames are bound to their tenant and cross-tenant hostname overrides are rejected.'
        : 'Tenant routing controls are not fully active.',
      limitation: 'Production still requires independent tenant-isolation and security testing appropriate to the deployed architecture.'
    },
    {
      id: 'financial-intent-safety',
      name: 'Retry and unknown-transfer safety',
      status: 'implemented-prototype',
      summary: intents.explicitUnknownState && intents.timeoutIsNotFailure
        ? 'A timeout or provider ambiguity can remain pending/unknown instead of being mislabeled as failure, and automatic replacement is disabled.'
        : 'Financial-intent ambiguity controls are incomplete.',
      limitation: 'Provider-specific state mapping and disappearance/recovery behavior remain unverified until a real provider certification environment is selected.'
    },
    {
      id: 'incident-communication',
      name: 'Truthful incident-status wording',
      status: 'implemented-prototype',
      summary: incident.explicitTemporaryUnavailableVsTransactionOutcome && incident.unknownOutcomeDoesNotBecomeFailure
        ? 'Prototype incident wording keeps service availability separate from transaction outcome and preserves submitted/unknown instructions as awaiting confirmation.'
        : 'Incident-status wording controls are incomplete.',
      limitation: 'No production customer-status channel, approved incident-message workflow, production human incident-support path, provider-status integration, or measured customer-visible status timing is connected or verified.'
    },
    {
      id: 'migration-integrity',
      name: 'Migration source integrity',
      status: 'implemented-prototype',
      summary: migrations.repositoryManifestAvailable && migrations.appendOnlyFingerprintEnforcedInCi
        ? `Migrations 001-${String(migrations.lockedMigrationCount).padStart(3, '0')} are fingerprinted and CI rejects silent edits to locked migration files.`
        : 'Migration source-integrity controls are incomplete.',
      limitation: 'Repository fingerprints do not prove target-database migration history, Supabase execution, backup/restore success, recovery exercises, or production approval.'
    },
    {
      id: 'automated-support',
      name: 'Automated support boundaries',
      status: 'implemented-prototype',
      summary: ai.supportAssistantRuntime === 'deterministic-rules' && !ai.regulatedAiDecisioningEnabled
        ? 'Orbit uses deterministic prototype rules and does not make regulated or account-specific decisions.'
        : 'Automated-support authority is not safely bounded.',
      limitation: 'No production human case-management channel is connected. Material issues require a future approved human workflow.'
    },
    {
      id: 'sensitive-chat-data',
      name: 'Sensitive chat-data guard',
      status: 'implemented-prototype',
      summary: sensitiveData.clientPreflightDetectionAvailable && sensitiveData.serverRejectionRequired
        ? 'Best-effort client and server checks reject several high-risk credential and identifier patterns before Orbit answers.'
        : 'Sensitive-data pattern rejection is not fully implemented.',
      limitation: 'Pattern detection is not production DLP and does not replace secure identity/document upload, logging controls, or privacy architecture.'
    },
    {
      id: 'customer-terms',
      name: 'Versioned customer terms',
      status: 'implemented-prototype',
      summary: terms.controlledPrototypeTermsImplemented && terms.unsupportedLiveTermsFailClosed
        ? `Prototype changing terms come from ${terms.prototypeTermsVersion}; unsupported live-term requests fail closed.`
        : 'Customer terms are not controlled by a single prototype source.',
      limitation: 'There is no approved live terms adapter, effective live version, sponsor approval, or external approval evidence yet.'
    },
    {
      id: 'support-cases',
      name: 'Human-controlled case states',
      status: 'implemented-prototype',
      summary: support.materialCasesRequireHumanHandoff && !support.automationMayResolveCase && !support.automationMayCloseCase
        ? 'Automation may detect and route a material issue, but cannot impersonate human acknowledgement, resolution, or closure.'
        : 'Support-case authority boundaries are incomplete.',
      limitation: 'Production case tooling, required response deadlines, staffing, escalation coverage, and handoff testing are not configured.'
    },
    {
      id: 'third-party-inventory',
      name: 'Third-party dependency inventory',
      status: 'implemented-prototype',
      summary: vendors.machineReadableInventoryAvailable
        ? `The prototype records ${vendors.currentPrototypeServiceCount} currently referenced services and separately lists regulated vendor categories that remain unselected.`
        : 'Third-party dependency inventory is not available.',
      limitation: 'Inventory is not due diligence, contract approval, privacy/security approval, sponsor-bank approval, an operating third-party-risk program, or authorization to send live customer financial or Restricted data to a vendor.'
    }
  ];

  const productionGaps = [
    'No live banking or real customer money movement is enabled.',
    'No sponsor-bank or regulated-program approval is represented as complete.',
    'No qualified legal/compliance applicability review is represented as complete.',
    'No production provider webhook/certification claim is made.',
    'No production customer-status channel, approved incident-message workflow, or measured customer-visible incident timing is represented as operating.',
    'Repository migration fingerprints exist, but target database migration history, Supabase execution, backup/restore behavior, and migration recovery remain unverified.',
    'No high/critical production third-party-risk program, vendor-contract approval, or live-data-flow approval is represented as operating.',
    'No production workforce identity, phishing-resistant MFA, RBAC, or high-risk dual control is represented as ready.',
    'No production distributed rate limiting/WAF or DLP is represented as ready.',
    'No approved live customer-terms source is connected.',
    'No staffed production complaint/dispute/fraud case-management program is represented as operating.',
    'Emergency-freeze timing, customer-visible incident timing, provider-disappearance recovery, disaster recovery, and migration recovery remain unverified until exercised.'
  ] as const;

  return {
    stage: 'prototype',
    simulationOnly: true,
    liveBankingEnabled: false,
    regulatedAiDecisioningEnabled: false,
    thirdPartyLlmCustomerDataEnabled: false,
    customerIncidentStatusModelImplemented: true,
    productionCustomerStatusChannelConnected: false,
    approvedIncidentMessageWorkflowConnected: false,
    productionHumanIncidentSupportPathConnected: false,
    customerVisibleIncidentStatusTimingVerified: false,
    repositoryMigrationManifestAvailable: migrations.repositoryManifestAvailable,
    repositoryMigrationFingerprintsEnforced: migrations.appendOnlyFingerprintEnforcedInCi,
    targetDatabaseMigrationHistoryVerified: false,
    prototypeMigrationsExternalExecutionVerified: false,
    machineReadableThirdPartyInventoryAvailable: true,
    productionThirdPartyRiskProgramOperating: false,
    productionVendorContractsApproved: false,
    productionVendorDataFlowsApproved: false,
    approvedLiveCustomerTerms: false,
    productionSupportDlpReady: false,
    productionHumanCaseManagementConnected: false,
    sponsorBankProgramApprovalComplete: false,
    legalComplianceApplicabilityReviewComplete: false,
    controls,
    productionGaps,
    disclosure: 'Trust Center for the simulation prototype. It describes implemented software controls and known gaps; it is not a claim of legal compliance, bank charter, deposit insurance, sponsor-bank approval, vendor approval, database migration execution, production incident-communications operation, security certification, or readiness for live customer funds.'
  } as const;
}
