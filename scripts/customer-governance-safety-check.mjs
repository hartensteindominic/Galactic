import fs from 'node:fs';

const required = [
  ['lib/customer-terms-control.ts', "status: 'prototype-only'", 'prototype terms must remain explicitly prototype-only'],
  ['lib/customer-terms-control.ts', 'liveTermsApproved: false', 'prototype terms must not claim live approval'],
  ['lib/customer-terms-control.ts', 'APPROVED_CUSTOMER_TERMS_UNAVAILABLE', 'live terms must fail closed when approved source is unavailable'],
  ['lib/customer-terms-control.ts', 'approvedCustomerTermsSourceOfTruthReady: false', 'production customer terms source must remain unapproved'],
  ['lib/customer-terms-control.ts', 'getCustomerTermsForRuntime', 'runtime terms lookup must exist'],
  ['lib/assistant.ts', 'requireApprovedLiveCustomerTerms', 'Orbit changing live terms must fail closed without approved source'],
  ['lib/assistant.ts', 'termsVersion: terms.version', 'Orbit prototype changing-term answers must carry source version'],
  ['lib/assistant.ts', 'This prototype does not operate a live human case-management channel.', 'Orbit must not imply live human support exists in prototype'],
  ['app/galactic-chat.tsx', 'Prototype handoff marker:', 'chat UI must label human escalation as a prototype marker'],
  ['app/galactic-chat.tsx', 'No production case-management channel is connected here', 'chat UI must disclose missing production case channel'],
  ['app/api/assistant/route.ts', 'productionHumanCaseManagementConnected: supportCases.approvedProductionCaseSystemConnected', 'Orbit API must expose human-case-system status'],
  ['app/api/assistant/route.ts', 'automationMayResolveSupportCase: supportCases.automationMayResolveCase', 'Orbit API must expose automation resolution prohibition'],
  ['app/api/assistant/route.ts', 'prototypeTermsVersion: prototypeTerms.version', 'Orbit API must expose terms provenance'],
  ['app/api/assistant/route.ts', 'liveCustomerTermsApproved: prototypeTerms.liveTermsApproved', 'Orbit API must expose live terms approval truthfully'],
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
  ['lib/prototype-readiness.ts', 'customerTermsControl,', 'readiness must expose customer terms controls'],
  ['lib/prototype-readiness.ts', 'supportCaseControls,', 'readiness must expose support-case controls'],
  ['docs/CUSTOMER_TERMS_CHANGE_CONTROL.md', 'Do not silently substitute hardcoded defaults', 'terms change control must fail closed rather than invent defaults'],
  ['docs/CUSTOMER_TERMS_CHANGE_CONTROL.md', 'A correction is not permission to backdate an approval that did not exist.', 'terms correction process must prohibit backdated approval']
];

const forbidden = [
  ['lib/customer-terms-control.ts', 'liveTermsApproved: true', 'prototype terms must never claim live approval'],
  ['lib/customer-terms-control.ts', 'approvedCustomerTermsSourceOfTruthReady: true', 'production customer terms source cannot self-approve in code'],
  ['lib/support-case-state.ts', 'automationMayResolveCase: true', 'automation must not resolve material support cases'],
  ['lib/support-case-state.ts', 'automationMayCloseCase: true', 'automation must not close material support cases'],
  ['lib/prototype-readiness.ts', 'productionCustomerTermsSourceOfTruthApproved: true', 'readiness must not self-certify customer terms approval'],
  ['lib/prototype-readiness.ts', 'productionHumanSupportHandoffExercised: true', 'readiness must not self-certify human handoff exercise'],
  ['app/api/prototype/terms/route.ts', 'liveTermsApproved: true', 'terms API must not claim live approval'],
  ['app/api/assistant/route.ts', 'productionHumanCaseManagementConnected: true', 'Orbit API must not claim production human case management exists'],
  ['app/api/assistant/route.ts', 'liveCustomerTermsApproved: true', 'Orbit API must not claim live terms are approved'],
  ['app/galactic-chat.tsx', 'Your case has been opened', 'prototype chat must not imply a real case was created'],
  ['app/galactic-chat.tsx', 'Your complaint has been filed', 'prototype chat must not imply a real complaint was filed']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Customer terms source-of-truth and human support-case governance safety checks passed.');
