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
  ['docs/NETWORK_RETRY_CHAOS_TEST_PLAN.md', 'Provider disappears after accepting intent', 'network chaos plan must include provider disappearance'],
  ['docs/NETWORK_RETRY_CHAOS_TEST_PLAN.md', 'pending/unknown', 'provider disappearance must preserve unknown state'],
  ['docs/EMERGENCY_MONEY_MOVEMENT_CONTROL.md', 'Time-to-first-customer-visible status', 'freeze drill must measure customer-visible status timing'],
  ['lib/prototype-readiness.ts', 'customerVisibleIncidentStatusTimeVerified: false', 'readiness must not claim customer incident-status timing is verified'],
  ['lib/prototype-readiness.ts', 'providerDisappearanceDuringTransferDrillVerified: false', 'readiness must not claim provider-disappearance drill is verified']
];

const forbidden = [
  ['lib/ai-governance.ts', 'thirdPartyLlmCustomerDataEnabled: true', 'prototype must not enable third-party LLM customer-data processing'],
  ['lib/ai-governance.ts', 'regulatedAiDecisioningEnabled: true', 'prototype must not enable regulated AI decisioning'],
  ['lib/ai-governance.ts', 'creditDecisioningByAiEnabled: true', 'prototype must not enable AI credit decisioning'],
  ['lib/ai-governance.ts', 'amlSarDecisioningByAiEnabled: true', 'prototype must not enable AI AML/SAR decisioning'],
  ['app/api/assistant/route.ts', 'await request.json()', 'Orbit API must not bypass bounded JSON parsing'],
  ['app/api/assistant/route.ts', 'regulatedDecisioningEnabled: true', 'Orbit API must not claim regulated decisioning is enabled'],
  ['app/api/assistant/route.ts', 'thirdPartyLlmCustomerDataEnabled: true', 'Orbit API must not claim third-party LLM customer-data use is enabled'],
  ['lib/prototype-readiness.ts', 'customerVisibleIncidentStatusTimeVerified: true', 'incident-status timing must remain unverified until an exercise occurs'],
  ['lib/prototype-readiness.ts', 'providerDisappearanceDuringTransferDrillVerified: true', 'provider-disappearance drill must remain unverified until exercised']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('AI governance, automated-support and incident-drill safety checks passed.');
