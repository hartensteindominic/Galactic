import fs from 'node:fs';

const required = [
  ['lib/customer-terms-control.ts', "status: 'prototype-only'", 'prototype terms must remain explicitly prototype-only'],
  ['lib/customer-terms-control.ts', 'liveTermsApproved: false', 'prototype terms must not claim live approval'],
  ['lib/customer-terms-control.ts', 'APPROVED_CUSTOMER_TERMS_UNAVAILABLE', 'live terms must fail closed when approved source is unavailable'],
  ['lib/customer-terms-control.ts', 'approvedCustomerTermsSourceOfTruthReady: false', 'production customer terms source must remain unapproved'],
  ['lib/customer-terms-control.ts', 'getCustomerTermsForRuntime', 'runtime terms lookup must exist'],
  ['scripts/customer-terms-runtime-check.mjs', 'Customer terms runtime behavior checks passed.', 'customer terms fail-closed behavior must have executable coverage'],
  ['package.json', 'scripts/customer-terms-runtime-check.mjs', 'customer terms runtime coverage must run in the CI safety suite'],
  ['lib/assistant.ts', 'requireApprovedLiveCustomerTerms', 'Orbit changing live terms must fail closed without approved source'],
  ['lib/assistant.ts', 'termsVersion: terms.version', 'Orbit prototype changing-term answers must carry source version'],
  ['lib/assistant.ts', 'This prototype does not operate a live human case-management channel.', 'Orbit must not imply live human support exists in prototype'],
  ['app/galactic-chat.tsx', 'Prototype handoff marker:', 'chat UI must label human escalation as a prototype marker'],
  ['app/galactic-chat.tsx', 'No production case-management channel is connected here', 'chat UI must disclose missing production case channel'],
  ['app/api/assistant/route.ts', 'productionHumanCaseManagementConnected: supportCases.approvedProductionCaseSystemConnected', 'Orbit API must expose human-case-system status'],
  ['app/api/assistant/route.ts', 'automationMayResolveSupportCase: supportCases.automationMayResolveCase', 'Orbit API must expose automation resolution prohibition'],
  ['app/api/assistant/route.ts', 'prototypeTermsVersion: prototypeTerms.version', 'Orbit API must expose terms provenance'],
  ['app/api/assistant/route.ts', 'liveCustomerTermsApproved: prototypeTerms.liveTermsApproved', 'Orbit API must expose live terms approval truthfully'],
  ['lib/support-sensitive-data.ts', 'clientPreflightDetectionAvailable: true', 'support privacy control must expose client preflight detection'],
  ['lib/support-sensitive-data.ts', 'serverRejectionRequired: true', 'support privacy control must require server-side rejection'],
  ['lib/support-sensitive-data.ts', 'detectedValuesReturnedToClient: false', 'detected secret values must not be returned to the client'],
  ['lib/support-sensitive-data.ts', 'detectionIsNotADataLossPreventionSystem: true', 'prototype detector must not be represented as production DLP'],
  ['lib/support-sensitive-data.ts', 'passesLuhn', 'payment-card detector must validate candidate card numbers instead of blocking arbitrary long numbers'],
  ['app/galactic-chat.tsx', 'detectSupportSensitiveData(text)', 'chat UI must run sensitive-data detection before network send'],
  ['app/galactic-chat.tsx', 'I didn’t send that message because it appears to contain sensitive', 'chat UI must tell the user a sensitive message was not sent'],
  ['app/api/assistant/route.ts', 'detectSupportSensitiveData(message)', 'Orbit API must independently detect sensitive data'],
  ['app/api/assistant/route.ts', "code: 'SENSITIVE_DATA_REJECTED'", 'Orbit API must reject detected sensitive data'],
  ['app/api/assistant/route.ts', 'detectedCategories: sensitiveCategories', 'Orbit API may return only safe detection categories'],
  ['app/api/assistant/route.ts', 'sensitiveDataDetectionIsProductionDlp: false', 'Orbit API must disclose detector is not production DLP'],
  ['lib/prototype-transparency.ts', 'getPrototypeCustomerTerms', 'Transparency Center must use controlled prototype terms'],
  ['lib/prototype-transparency.ts', 'customerTermsVersion: terms.version', 'Transparency data must expose terms source version'],
  ['app/prototype/transparency/page.tsx', 'Terms source:', 'Transparency UI must show terms source'],
  ['app/prototype/transparency/page.tsx', 'Approved for live use', 'Transparency UI must show live approval state'],
  ['app/api/prototype/terms/route.ts', 'resolveRequestBrand', 'terms endpoint must respect tenant host boundary'],
  ['app/api/prototype/terms/route.ts', 'bankingErrorResponse', 'terms endpoint must use standardized sanitized error handling'],
  ['app/api/prototype/terms/route.ts', 'liveTermsApproved: terms.liveTermsApproved', 'terms endpoint must expose live approval truthfully'],
  ['lib/support-case-state.ts', "'authorized-human'", 'support case model must distinguish authorized human actor'],
  ['lib/support-case-state.ts', 'automationMayResolveCase: false', 'automation must not resolve cases'],
  ['lib/support-case-state.ts', 'automationMayCloseCase: false', 'automation must not close cases'],
  ['lib/support-case-state.ts', 'humanAcknowledgementRequiredBeforeReview: true', 'material case review must require human acknowledgement'],
  ['scripts/support-case-runtime-check.mjs', 'Support case runtime behavior checks passed.', 'support-case human authority must have executable coverage'],
  ['package.json', 'scripts/support-case-runtime-check.mjs', 'support-case runtime coverage must run in the CI safety suite'],
  ['lib/prototype-readiness.ts', 'customerTermsControl,', 'readiness must expose customer terms controls'],
  ['lib/prototype-readiness.ts', 'supportCaseControls,', 'readiness must expose support-case controls'],
  ['lib/prototype-readiness.ts', 'supportSensitiveDataControls,', 'readiness must expose support sensitive-data controls'],
  ['lib/prototype-readiness.ts', 'productionSupportDlpReady: false', 'readiness must not claim production DLP is ready'],
  ['lib/prototype-trust.ts', 'simulationOnly: true', 'Trust Center must explicitly report simulation-only status'],
  ['lib/prototype-trust.ts', 'liveBankingEnabled: false', 'Trust Center must explicitly report live banking disabled'],
  ['lib/prototype-trust.ts', 'productionSupportDlpReady: false', 'Trust Center must explicitly report production DLP not ready'],
  ['lib/prototype-trust.ts', 'approvedLiveCustomerTerms: false', 'Trust Center must explicitly report live terms unapproved'],
  ['lib/prototype-trust.ts', 'sponsorBankProgramApprovalComplete: false', 'Trust Center must explicitly report sponsor-bank approval incomplete'],
  ['lib/prototype-trust.ts', 'legalComplianceApplicabilityReviewComplete: false', 'Trust Center must explicitly report legal/compliance applicability review incomplete'],
  ['lib/prototype-trust.ts', 'limitation:', 'Trust Center controls must carry an explicit limitation'],
  ['app/prototype/trust/page.tsx', 'SIMULATION ONLY', 'Trust Center UI must visibly disclose simulation-only status'],
  ['app/prototype/trust/page.tsx', 'What this does not prove', 'Trust Center UI must show limitations for implemented controls'],
  ['app/prototype/trust/page.tsx', 'Production DLP', 'Trust Center UI must show production DLP gap'],
  ['app/prototype/trust/page.tsx', 'NOT APPROVED', 'Trust Center UI must show unapproved live terms/program status'],
  ['app/prototype/trust/page.tsx', 'resolveRequestBrand', 'Trust Center page must enforce tenant host boundary'],
  ['app/api/prototype/trust/route.ts', 'resolveRequestBrand', 'Trust API must enforce tenant host boundary'],
  ['app/api/prototype/trust/route.ts', 'bankingErrorResponse', 'Trust API must use standardized sanitized error handling'],
  ['app/prototype/page.tsx', 'Trust & security', 'prototype dock must expose Trust Center'],
  ['docs/CUSTOMER_TERMS_CHANGE_CONTROL.md', 'Do not silently substitute hardcoded defaults', 'terms change control must fail closed rather than invent defaults'],
  ['docs/CUSTOMER_TERMS_CHANGE_CONTROL.md', 'A correction is not permission to backdate an approval that did not exist.', 'terms correction process must prohibit backdated approval']
];

const forbidden = [
  ['lib/customer-terms-control.ts', 'liveTermsApproved: true', 'prototype terms must never claim live approval'],
  ['lib/customer-terms-control.ts', 'approvedCustomerTermsSourceOfTruthReady: true', 'production customer terms source cannot self-approve in code'],
  ['lib/support-case-state.ts', 'automationMayResolveCase: true', 'automation must not resolve material support cases'],
  ['lib/support-case-state.ts', 'automationMayCloseCase: true', 'automation must not close material support cases'],
  ['lib/support-sensitive-data.ts', 'detectedValuesReturnedToClient: true', 'sensitive-data detector must not return matched values'],
  ['lib/support-sensitive-data.ts', 'detectionIsNotADataLossPreventionSystem: false', 'prototype detector must never be represented as production DLP'],
  ['lib/prototype-readiness.ts', 'productionSupportDlpReady: true', 'readiness must not self-certify production DLP'],
  ['lib/prototype-readiness.ts', 'productionCustomerTermsSourceOfTruthApproved: true', 'readiness must not self-certify customer terms approval'],
  ['lib/prototype-readiness.ts', 'productionHumanSupportHandoffExercised: true', 'readiness must not self-certify human handoff exercise'],
  ['app/api/prototype/terms/route.ts', 'liveTermsApproved: true', 'terms API must not claim live approval'],
  ['app/api/assistant/route.ts', 'productionHumanCaseManagementConnected: true', 'Orbit API must not claim production human case management exists'],
  ['app/api/assistant/route.ts', 'liveCustomerTermsApproved: true', 'Orbit API must not claim live terms are approved'],
  ['app/api/assistant/route.ts', 'rawMessage:', 'Orbit API must never return the raw submitted message'],
  ['app/api/assistant/route.ts', 'submittedMessage:', 'Orbit API must never return the raw submitted message'],
  ['app/galactic-chat.tsx', 'Your case has been opened', 'prototype chat must not imply a real case was created'],
  ['app/galactic-chat.tsx', 'Your complaint has been filed', 'prototype chat must not imply a real complaint was filed'],
  ['app/prototype/trust/page.tsx', 'fully compliant', 'Trust Center must not claim full compliance'],
  ['app/prototype/trust/page.tsx', 'FDIC insured', 'Trust Center must not claim deposit insurance'],
  ['app/prototype/trust/page.tsx', 'bank-grade verified', 'Trust Center must not claim bank-grade verification'],
  ['app/prototype/trust/page.tsx', 'guaranteed secure', 'Trust Center must not guarantee security']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Customer terms, human support-case, sensitive-data, and Trust Center governance safety checks passed.');
