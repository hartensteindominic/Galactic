import { aiGovernanceStatus } from './ai-governance';
import { charterReadinessStatus } from './charter-readiness';
import { complianceObligationRegisterStatus } from './compliance-obligation-register';
import { customerTermsControlStatus } from './customer-terms-control';
import { financialIntentControlStatus } from './financial-intent-state';
import { institutionAccountabilityStatus } from './institution-accountability';
import { prototypeIncidentCommunicationControlStatus } from './prototype-incident-status';
import { prototypeMigrationIntegrityStatus } from './prototype-migration-integrity';
import { sponsorDiligencePackStatus } from './sponsor-diligence-pack';
import { supportCaseControlStatus } from './support-case-state';
import { supportSensitiveDataControlStatus } from './support-sensitive-data';
import { tenantBoundaryStatus } from './tenant-boundary';
import { thirdPartyInventoryStatus } from './third-party-inventory';
import { threeYearBankPlanStatus } from './three-year-bank-plan';

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
  const charter = charterReadinessStatus();
  const compliance = complianceObligationRegisterStatus();
  const accountability = institutionAccountabilityStatus();
  const bankPlan = threeYearBankPlanStatus();
  const sponsorDiligence = sponsorDiligencePackStatus();
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
      id: 'future-charter-roadmap',
      name: 'Future bank-charter roadmap',
      status: 'external-approval-required',
      summary: charter.longTermGoal === 'future-chartered-bank' && charter.roadmapDocumented
        ? 'Galactic documents a staged path from fintech product proof through charter feasibility, organizer/application readiness, conditional approval, pre-opening, and eventual chartered operations if approved.'
        : 'A long-term charter-readiness roadmap is not documented.',
      limitation: 'The roadmap is a strategic goal only. No charter route, business-model proof, regulator-ready bank plan, capital approval, organizing group, charter application, deposit-insurance approval, pre-opening authorization, effective charter, or authority to market Galactic Trust as a bank is represented as complete.'
    },
    {
      id: 'compliance-applicability-register',
      name: 'Compliance applicability and ownership register',
      status: 'external-approval-required',
      summary: compliance.obligationRegisterAvailable && compliance.sourceRegistryAvailable
        ? `${compliance.obligationCount} future-bank control obligations are mapped to current official supervisory/compliance sources; ${compliance.unresolvedApplicabilityCount} remain unassessed and require qualified human review.`
        : 'A machine-readable compliance applicability register is not available.',
      limitation: 'The register is planning infrastructure, not a legal applicability determination, compliance certification, approved responsibility matrix, operating compliance-management system, BSA/AML program, OFAC program, audit, examination result, license, sponsor approval, or authority to offer live financial services.'
    },
    {
      id: 'institution-accountability',
      name: 'Human institution accountability model',
      status: 'external-approval-required',
      summary: accountability.accountabilityModelAvailable
        ? `${accountability.roleCount} future institution/program roles are explicitly modeled and ${accountability.assignedRoleCount} are currently represented as assigned. AI and software are prohibited from serving as accountable owners.`
        : 'A machine-readable human accountability model is not available.',
      limitation: 'The model does not appoint or qualify any director, officer, BSA/AML officer, compliance owner, risk owner, finance owner, audit function, organizer, sponsor-bank accountable function, or regulator-facing representative. Actual people/functions, authority, independence, governance approval, contracts, and external acceptance remain unverified.'
    },
    {
      id: 'three-year-bank-plan',
      name: 'Three-year bank-plan evidence skeleton',
      status: 'external-approval-required',
      summary: bankPlan.planningSkeletonAvailable
        ? `${bankPlan.requiredSectionCount} regulator-oriented plan sections are modeled with no default growth, deposit, revenue, capital, loss, liquidity, or profitability assumptions.`
        : 'A regulator-oriented bank-plan skeleton is not available.',
      limitation: 'This is not a board-approved, externally reviewed, regulator-reviewed, filed, accepted, or charter-application-ready business plan. Financial schedules, assumptions, management qualifications, capital/liquidity adequacy, and stable-profitability horizon remain unvalidated.'
    },
    {
      id: 'sponsor-diligence-pack',
      name: 'Sponsor diligence evidence pack',
      status: 'external-approval-required',
      summary: sponsorDiligence.packAvailable
        ? `${sponsorDiligence.sectionCount} sponsor/program diligence sections are modeled; ${sponsorDiligence.completedSectionCount} are complete, ${sponsorDiligence.humanAttestedSectionCount} are human-attested, and ${sponsorDiligence.sponsorAcceptedSectionCount} are sponsor-accepted.`
        : 'A machine-readable sponsor diligence pack is not available.',
      limitation: 'No sponsor bank or BaaS provider is selected by this pack. It cannot authenticate evidence, attest as a human, submit a questionnaire, impersonate an applicant or sponsor, approve contracts/data flows, complete provider certification, obtain sponsor/program approval, or authorize live customer data or financial activity.'
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
    'The future-chartered-bank objective is a roadmap goal only; no charter route, bank application, deposit-insurance approval, effective charter, or opening authorization is represented as complete.',
    'The target customer/problem/distribution/non-interchange revenue thesis and driver-based unit economics remain unvalidated for a future bank business plan.',
    `The compliance register contains ${compliance.unresolvedApplicabilityCount} unresolved future-bank applicability decisions; no accountable owner assignment, approved compliance responsibility matrix, operating CMS/BSA-AML/OFAC program, independent testing, or examination readiness is represented as complete.`,
    `The human-accountability model contains ${accountability.roleCount} future roles and ${accountability.assignedRoleCount} are represented as assigned; board, management, officer, assurance, sponsor-program, and charter-coordination qualifications/authority remain unverified.`,
    `The three-year bank-plan skeleton contains ${bankPlan.requiredSectionCount} required planning sections and ${bankPlan.validatedSectionCount} are represented as validated; no board approval, regulator review/acceptance, or charter-application readiness is represented as complete.`,
    `The sponsor-diligence pack contains ${sponsorDiligence.sectionCount} evidence sections, with ${sponsorDiligence.completedSectionCount} complete and ${sponsorDiligence.sponsorAcceptedSectionCount} sponsor-accepted; no sponsor/program selection, submission, contract approval, data-flow approval, provider certification, or live-program approval is represented as complete.`,
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
    longTermGoal: charter.longTermGoal,
    futureCharterRoadmapDocumented: charter.roadmapDocumented,
    charterRouteSelected: false,
    charterApplicationFiled: false,
    depositInsuranceApproved: false,
    bankCharterEffective: false,
    openingAuthorizationReceived: false,
    customerFacingBankClaimAuthorized: false,
    liveBankingEnabled: false,
    regulatedAiDecisioningEnabled: false,
    thirdPartyLlmCustomerDataEnabled: false,
    complianceApplicabilityRegisterAvailable: compliance.obligationRegisterAvailable,
    complianceOfficialSourceRegistryAvailable: compliance.sourceRegistryAvailable,
    complianceUnresolvedApplicabilityCount: compliance.unresolvedApplicabilityCount,
    complianceResponsibilityMatrixAssigned: false,
    productionComplianceManagementSystemOperating: false,
    productionBsaAmlProgramOperating: false,
    productionOfacProgramOperating: false,
    complianceExaminationReady: false,
    institutionAccountabilityModelAvailable: accountability.accountabilityModelAvailable,
    institutionAccountabilityRoleCount: accountability.roleCount,
    institutionAssignedRoleCount: accountability.assignedRoleCount,
    proposedBankBoardAssignedAndQualified: false,
    bsaAmlOfficerAssignedAndQualified: false,
    independentAuditFunctionAssignedAndQualified: false,
    aiMayServeAsAccountableInstitutionOwner: false,
    threeYearBankPlanSkeletonAvailable: bankPlan.planningSkeletonAvailable,
    threeYearBankPlanRequiredSectionCount: bankPlan.requiredSectionCount,
    threeYearBankPlanValidatedSectionCount: bankPlan.validatedSectionCount,
    threeYearBankPlanBoardApproved: false,
    threeYearBankPlanRegulatorAccepted: false,
    threeYearBankPlanReadyForCharterApplication: false,
    sponsorDiligencePackAvailable: sponsorDiligence.packAvailable,
    sponsorDiligenceSectionCount: sponsorDiligence.sectionCount,
    sponsorDiligenceCompletedSectionCount: sponsorDiligence.completedSectionCount,
    sponsorDiligenceHumanAttestedSectionCount: sponsorDiligence.humanAttestedSectionCount,
    sponsorDiligenceSponsorAcceptedSectionCount: sponsorDiligence.sponsorAcceptedSectionCount,
    selectedSponsorBank: sponsorDiligence.selectedSponsorBank,
    selectedBaasProvider: sponsorDiligence.selectedBaasProvider,
    sponsorDiligenceAutomaticSubmissionEnabled: sponsorDiligence.automaticSubmissionEnabled,
    sponsorDiligenceSoftwareAttestationEnabled: sponsorDiligence.softwareAttestationEnabled,
    sponsorDiligenceReadyForSponsorSubmission: sponsorDiligence.readyForSponsorSubmission,
    sponsorDiligenceReadyForLiveProgram: sponsorDiligence.readyForLiveProgram,
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
    disclosure: 'Trust Center for the simulation prototype and long-term institution-building roadmap. It describes implemented software controls and known gaps; it is not a claim of legal compliance, human appointment or qualification, board action, bank charter, deposit insurance, sponsor-bank approval, sponsor diligence acceptance, charter application status, regulator-reviewed business plan, capital approval, opening authority, vendor approval, database migration execution, operating compliance-management/BSA-AML/OFAC programs, policy approval, independent audit, examination readiness, production incident-communications operation, security certification, or readiness for live customer funds.'
  } as const;
}
