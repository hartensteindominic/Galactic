import fs from 'node:fs';

const required = [
  ['lib/provider-continuity.ts', 'automaticProviderSwitchAllowed: false', 'continuity decisions must never auto-switch provider'],
  ['lib/provider-continuity.ts', 'automaticInstructionReroutingAllowed: false', 'continuity decisions must never auto-reroute financial instructions'],
  ['lib/provider-continuity.ts', 'automaticCustomerFundsMigrationAllowed: false', 'continuity decisions must never auto-migrate customer funds'],
  ['lib/provider-continuity.ts', 'existingUnknownInstructionsRemainUnknown: true', 'continuity model must preserve unknown instruction state'],
  ['lib/provider-continuity.ts', 'replacementInstructionsAutomaticallyCreated: false', 'continuity model must not auto-create replacement instructions'],
  ['lib/provider-continuity.ts', 'humanGovernanceRequiredForMigration: true', 'provider migration must require human governance'],
  ['lib/provider-continuity.ts', 'approvedDestinationProviderRequiredForMigration: true', 'provider migration must require approved destination provider'],
  ['lib/provider-continuity.ts', 'authoritativeBalanceExportRequiredForMigration: true', 'provider migration must require authoritative balances'],
  ['lib/provider-continuity.ts', 'reconciliationRequiredBeforeMigrationCompletion: true', 'provider migration must require reconciliation'],
  ['lib/provider-continuity.ts', 'approvedCustomerCommunicationRequired: true', 'provider migration must require approved customer communications'],
  ['lib/provider-continuity.ts', 'productionMigrationExecutionImplemented: false', 'production provider migration execution must remain unimplemented'],
  ['lib/provider-continuity.ts', 'productionProviderContinuityPlanApproved: false', 'production continuity plan must remain unapproved'],
  ['lib/provider-continuity.ts', 'providerContractTerminationTermsReviewed: false', 'contract termination review must remain unverified'],
  ['lib/provider-continuity.ts', 'providerDataPortabilityVerified: false', 'provider data portability must remain unverified'],
  ['lib/provider-continuity.ts', 'alternateProviderProgramApproved: false', 'alternate provider must remain unapproved'],
  ['lib/provider-continuity.ts', 'providerExitExerciseVerified: false', 'provider exit exercise must remain unverified'],
  ['app/api/prototype/status/route.ts', 'providerContinuity: providerContinuityControlStatus()', 'general status API must expose provider-continuity posture'],
  ['app/api/prototype/status/route.ts', 'provider-continuity model blocks automatic provider switching, automatic financial-instruction rerouting, and automatic customer-funds migration', 'status disclosure must limit continuity claims'],
  ['docs/PROVIDER_EXIT_CONTINUITY_PLAN.md', 'never authorizes Galactic to automatically switch providers', 'runbook must prohibit automatic provider switching'],
  ['docs/PROVIDER_EXIT_CONTINUITY_PLAN.md', 'No software-only state transition can authorize customer funds migration.', 'runbook must prohibit software-only customer-funds migration'],
  ['docs/PROVIDER_EXIT_CONTINUITY_PLAN.md', 'Provider failure does not make a submitted transaction fail.', 'runbook must preserve pending/unknown transaction truth'],
  ['scripts/provider-continuity-runtime-check.mjs', 'Provider continuity outage, termination, migration-evidence, no-reroute, and no-automatic-funds-migration runtime checks passed.', 'provider continuity must have executable runtime coverage'],
  ['package.json', 'scripts/provider-continuity-runtime-check.mjs', 'provider continuity runtime coverage must run in CI']
];

const forbidden = [
  ['lib/provider-continuity.ts', 'automaticProviderSwitchAllowed: true', 'continuity model must not auto-switch providers'],
  ['lib/provider-continuity.ts', 'automaticInstructionReroutingAllowed: true', 'continuity model must not auto-reroute instructions'],
  ['lib/provider-continuity.ts', 'automaticCustomerFundsMigrationAllowed: true', 'continuity model must not auto-migrate customer funds'],
  ['lib/provider-continuity.ts', 'replacementInstructionsAutomaticallyCreated: true', 'continuity model must not auto-create replacement instructions'],
  ['lib/provider-continuity.ts', 'productionMigrationExecutionImplemented: true', 'continuity model must not self-enable production migration execution'],
  ['lib/provider-continuity.ts', 'productionProviderContinuityPlanApproved: true', 'continuity model must not self-approve continuity plan'],
  ['lib/provider-continuity.ts', 'alternateProviderProgramApproved: true', 'continuity model must not invent an alternate approved provider']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Provider continuity no-auto-switch, no-reroute, no-auto-funds-migration, status/runbook, governance/evidence, and exercise-boundary safety checks passed.');
