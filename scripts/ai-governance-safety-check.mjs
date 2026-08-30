import fs from 'node:fs';

const required = [
  ['lib/ai-governance.ts', "supportAssistantRuntime: 'deterministic-rules'", 'Orbit runtime posture must remain explicit'],
  ['lib/ai-governance.ts', 'thirdPartyLlmCustomerDataEnabled: false', 'prototype must keep third-party LLM customer-data use disabled'],
  ['lib/ai-governance.ts', 'regulatedAiDecisioningEnabled: false', 'prototype must keep regulated AI decisioning disabled'],
  ['lib/ai-governance.ts', 'creditDecisioningByAiEnabled: false', 'AI credit decisioning must remain disabled'],
  ['lib/ai-governance.ts', 'amlSarDecisioningByAiEnabled: false', 'AI AML/SAR decisioning must remain disabled'],
  ['lib/ai-governance.ts', 'fraudLiabilityDecisioningByAiEnabled: false', 'AI fraud-liability decisioning must remain disabled'],
  ['lib/ai-governance.ts', 'humanEscalationRequiredForMaterialAccountJudgment: true', 'material/account-specific judgments must require human escalation'],
  ['lib/assistant.ts', 'requiresHuman: true', 'Orbit must be able to require human escalation'],
  ['lib/assistant.ts', 'Orbit cannot approve, deny, price, underwrite, or explain an account-specific credit decision.', 'Orbit must refuse account-specific credit decisioning'],
  ['lib/assistant.ts', 'Orbit cannot determine or disclose whether a suspicious-activity report exists', 'Orbit must refuse SAR disclosure/decisioning'],
  ['app/api/assistant/route.ts', 'readJsonBodyLimited', 'Orbit API must use bounded JSON parsing'],
  ['app/api/assistant/route.ts', 'regulatedDecisioningEnabled: false', 'Orbit API must disclose regulated decisioning is off'],
  ['app/api/assistant/route.ts', 'thirdPartyLlmCustomerDataEnabled: false', 'Orbit API must disclose third-party LLM customer-data use is off'],
  ['app/galactic-chat.tsx', 'Automated support · general guidance', 'Orbit UI must visibly disclose automation'],
  ['app/galactic-chat.tsx', 'humanEscalation', 'Orbit UI must surface human escalation state'],
  ['lib/prototype-transparency.ts', "id: 'orbit-support'", 'Transparency Center must include Orbit'],
  ['lib/prototype-transparency.ts', 'regulatedAiDecisioningEnabled: false', 'Transparency Center must disclose regulated AI decisioning is off'],
  ['lib/prototype-transparency.ts', 'thirdPartyLlmCustomerDataEnabled: false', 'Transparency Center must disclose third-party LLM customer-data use is off'],
  ['docs/AI_GOVERNANCE_AND_REGULATED_AUTOMATION.md', 'Uninventoried production AI is prohibited.', 'AI governance must require an inventory'],
  ['docs/AI_GOVERNANCE_AND_REGULATED_AUTOMATION.md', 'superseded SR 11-7', 'AI governance must reflect the 2026 model-risk guidance update'],
  ['docs/AI_GOVERNANCE_AND_REGULATED_AUTOMATION.md', 'withdrew that circular on May 12, 2025', 'AI governance must disclose the CFPB complex-algorithm circular was withdrawn'],
  ['docs/AI_GOVERNANCE_AND_REGULATED_AUTOMATION.md', 'rules-policy/regulations/1002/', 'credit governance must anchor to current Regulation B'],
  ['docs/REGULATORY_REFERENCE_CHANGELOG.md', 'removed the Regulation B “effects test”', 'regulatory changelog must record the current 2026 Regulation B effects-test change'],
  ['docs/REGULATORY_REFERENCE_CHANGELOG.md', 'both were withdrawn on May 12, 2025', 'regulatory changelog must mark historical CFPB circulars withdrawn'],
  ['docs/REGULATORY_REFERENCE_CHANGELOG.md', 'Do not write “SR 11-7 requires X for ChatGPT/generative AI.”', 'regulatory changelog must reject stale SR 11-7 generative-AI claims'],
  ['docs/REGULATORY_REFERENCE_CHANGELOG.md', 'Do not claim the FTC Safeguards Rule automatically applies to Galactic', 'regulatory changelog must distinguish scope analysis from appearance'],
  ['docs/COMPLIANCE_RESPONSIBILITY_MATRIX_TEMPLATE.md', 'A blank or disputed ownership cell is a release blocker', 'responsibility matrix must fail closed on unowned controls'],
  ['docs/DATA_CLASSIFICATION_RETENTION_MAP.md', 'SAR / SAR-revealing information', 'data map must classify SAR-revealing information'],
  ['docs/DATA_CLASSIFICATION_RETENTION_MAP.md', 'Production retention periods are **TBD', 'retention map must not invent universal production retention periods'],
  ['docs/CUSTOMER_SUPPORT_COMPLAINT_ESCALATION_MODEL.md', 'Do not use “closed” merely because automation sent a response.', 'support model must not let automation close material cases'],
  ['docs/CUSTOMER_SUPPORT_COMPLAINT_ESCALATION_MODEL.md', 'Do not require magic words such as “formal complaint.”', 'support model must recognize complaints without magic words'],
  ['docs/THIRD_PARTY_AND_AI_VENDOR_RISK_REGISTER_TEMPLATE.md', 'AI cannot be approved as a generic vendor category.', 'AI vendor approval must be use-case specific'],
  ['docs/THIRD_PARTY_AND_AI_VENDOR_RISK_REGISTER_TEMPLATE.md', 'Vendor-disappearance drill', 'vendor register must include provider disappearance testing'],
  ['docs/FINTECH_SECURITY_THREAT_MODEL.md', 'A control documented but never exercised is not treated as verified.', 'threat model must require exercised controls'],
  ['docs/FINTECH_SECURITY_THREAT_MODEL.md', 'timeout != failure', 'threat model must preserve ambiguous financial state'],
  ['lib/financial-intent-state.ts', "| 'pending_unknown'", 'financial intent model must have an explicit unknown state'],
  ['lib/financial-intent-state.ts', 'timeoutIsNotFailure: true', 'financial intent model must not treat timeout as failure'],
  ['lib/financial-intent-state.ts', 'automaticReplacementAllowed: false', 'financial intent model must prohibit automatic replacement'],
  ['lib/financial-intent-state.ts', "'REPLACEMENT_BLOCKED_WHILE_OUTCOME_UNKNOWN'", 'financial intent model must block replacement while unknown'],
  ['lib/financial-intent-state.ts', 'productionProviderStateMappingVerified: false', 'provider state mapping must remain unverified until provider certification'],
  ['docs/NETWORK_RETRY_CHAOS_TEST_PLAN.md', 'Provider disappears after accepting intent', 'network chaos plan must include provider disappearance'],
  ['docs/NETWORK_RETRY_CHAOS_TEST_PLAN.md', 'pending/unknown', 'provider disappearance must preserve unknown state'],
  ['docs/EMERGENCY_MONEY_MOVEMENT_CONTROL.md', 'Time-to-first-customer-visible status', 'freeze drill must measure customer-visible status timing'],
  ['lib/prototype-readiness.ts', 'financialIntentControls', 'readiness must expose financial intent controls'],
  ['lib/prototype-readiness.ts', 'customerVisibleIncidentStatusTimeVerified: false', 'readiness must not claim customer incident-status timing is verified'],
  ['lib/prototype-readiness.ts', 'providerDisappearanceDuringTransferDrillVerified: false', 'readiness must not claim provider-disappearance drill is verified'],
  ['lib/prototype-readiness.ts', 'complianceResponsibilityMatrixAssigned: false', 'responsibility assignment must remain unapproved until external parties are assigned'],
  ['lib/prototype-readiness.ts', 'productionLegalComplianceApplicabilityReviewComplete: false', 'legal/compliance applicability review must remain unapproved'],
  ['lib/prototype-readiness.ts', 'productionSponsorBankProgramApprovalComplete: false', 'sponsor-bank program approval must remain false'],
  ['lib/prototype-readiness.ts', 'productionDataRetentionScheduleApproved: false', 'production retention schedule must remain unapproved'],
  ['lib/prototype-readiness.ts', 'productionComplaintEscalationProgramApproved: false', 'production complaint program must remain unapproved'],
  ['lib/prototype-readiness.ts', 'productionHumanSupportHandoffExercised: false', 'human support handoff must remain unverified'],
  ['lib/prototype-readiness.ts', 'productionThirdPartyRiskProgramOperating: false', 'third-party risk program must remain unverified'],
  ['lib/prototype-readiness.ts', 'productionCustomerTermsSourceOfTruthApproved: false', 'customer terms source must remain unapproved'],
  ['lib/prototype-readiness.ts', 'productionThreatModelIndependentReviewComplete: false', 'independent threat-model review must remain unverified']
];

const forbidden = [
  ['lib/ai-governance.ts', 'thirdPartyLlmCustomerDataEnabled: true', 'prototype must not enable third-party LLM customer-data processing'],
  ['lib/ai-governance.ts', 'regulatedAiDecisioningEnabled: true', 'prototype must not enable regulated AI decisioning'],
  ['lib/ai-governance.ts', 'creditDecisioningByAiEnabled: true', 'prototype must not enable AI credit decisioning'],
  ['lib/ai-governance.ts', 'amlSarDecisioningByAiEnabled: true', 'prototype must not enable AI AML/SAR decisioning'],
  ['app/api/assistant/route.ts', 'await request.json()', 'Orbit API must not bypass bounded JSON parsing'],
  ['app/api/assistant/route.ts', 'regulatedDecisioningEnabled: true', 'Orbit API must not claim regulated decisioning is enabled'],
  ['app/api/assistant/route.ts', 'thirdPartyLlmCustomerDataEnabled: true', 'Orbit API must not claim third-party LLM customer-data use is enabled'],
  ['docs/AI_GOVERNANCE_AND_REGULATED_AUTOMATION.md', 'CFPB Circular 2022-03 states that', 'withdrawn CFPB circular must not be presented as current guidance'],
  ['docs/DATA_CLASSIFICATION_RETENTION_MAP.md', 'retain everything for seven years', 'data-retention policy must not invent a universal seven-year rule'],
  ['lib/financial-intent-state.ts', 'automaticReplacementAllowed: true', 'financial intent control must never permit automatic replacement'],
  ['lib/prototype-readiness.ts', 'customerVisibleIncidentStatusTimeVerified: true', 'incident-status timing must remain unverified until an exercise occurs'],
  ['lib/prototype-readiness.ts', 'providerDisappearanceDuringTransferDrillVerified: true', 'provider-disappearance drill must remain unverified until exercised'],
  ['lib/prototype-readiness.ts', 'productionLegalComplianceApplicabilityReviewComplete: true', 'prototype must not claim legal/compliance review complete'],
  ['lib/prototype-readiness.ts', 'productionSponsorBankProgramApprovalComplete: true', 'prototype must not claim sponsor-bank approval'],
  ['lib/prototype-readiness.ts', 'productionDataRetentionScheduleApproved: true', 'prototype must not claim production retention approval']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('AI governance, current-regulatory-reference hygiene, compliance ownership, data classification, vendor risk, support escalation, financial-intent unknown-state, threat-model and incident-drill safety checks passed.');
