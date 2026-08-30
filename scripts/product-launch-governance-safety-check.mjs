import fs from 'node:fs';

const required = [
  ['lib/product-launch-governance.ts', "status: 'blocked-unverified'", 'launch gates must start blocked and unverified'],
  ['lib/product-launch-governance.ts', 'requiredForLiveLaunch: true', 'each launch gate must be required for live launch'],
  ['lib/product-launch-governance.ts', 'accountableHumanRequired: true', 'launch gates must require accountable humans'],
  ['lib/product-launch-governance.ts', 'qualifiedReviewRequired: true', 'launch gates must require qualified review'],
  ['lib/product-launch-governance.ts', 'launchGateSatisfied: false', 'launch gates must default unsatisfied'],
  ['lib/product-launch-governance.ts', "'not-applicable-proposed'", 'not-applicable may only be proposed for human review'],
  ['lib/product-launch-governance.ts', 'automaticLaunchEnablementAllowed: false', 'automatic launch enablement must be disabled'],
  ['lib/product-launch-governance.ts', 'automaticLiveWriteEnablementAllowed: false', 'automatic live-write enablement must be disabled'],
  ['lib/product-launch-governance.ts', 'softwareMayApproveLegalLaunch: false', 'software must not approve legal launch'],
  ['lib/product-launch-governance.ts', 'softwareMayApproveSponsorScope: false', 'software must not approve sponsor scope'],
  ['lib/product-launch-governance.ts', 'softwareMayActAsReleaseApprover: false', 'software must not act as release approver'],
  ['lib/product-launch-governance.ts', 'greenCiCountsAsLaunchApproval: false', 'green CI must not count as launch approval'],
  ['lib/product-launch-governance.ts', 'selectedSponsorRelationshipCountsAsBlanketApproval: false', 'sponsor relationship must not be blanket product approval'],
  ['lib/product-launch-governance.ts', 'conditionalCharterApprovalCountsAsOpeningAuthority: false', 'conditional charter approval must not equal opening authority'],
  ['lib/product-launch-governance.ts', 'launchApproved: false', 'launch must remain unapproved'],
  ['lib/product-launch-governance.ts', 'liveFinancialActivityApproved: false', 'live financial activity must remain unapproved'],
  ['app/api/prototype/product-launch-review/route.ts', 'requirePrototypeOperator(request)', 'launch review endpoint must require operator access'],
  ['app/api/prototype/product-launch-review/route.ts', 'requireTrustedOrigin(request)', 'launch review endpoint must enforce trusted origin'],
  ['app/api/prototype/product-launch-review/route.ts', 'requireJsonRequest(request)', 'launch review endpoint must require JSON'],
  ['app/api/prototype/product-launch-review/route.ts', 'readJsonBodyLimited<ProductLaunchReviewRequest>(request, 131_072)', 'launch review endpoint must bound request bodies'],
  ['app/api/prototype/product-launch-review/route.ts', 'persisted: false', 'launch review endpoint must remain non-persistent'],
  ['app/api/prototype/product-launch-review/route.ts', 'productionWritesChanged: false', 'launch review endpoint must never mutate production writes'],
  ['docs/PRODUCT_LAUNCH_AND_CHANGE_GOVERNANCE.md', 'engineering complete ≠ evidence authenticated ≠ legal applicability approved', 'launch docs must preserve approval stages'],
  ['docs/PRODUCT_LAUNCH_AND_CHANGE_GOVERNANCE.md', 'AI/software may not:', 'launch docs must bound AI/software authority'],
  ['scripts/product-launch-governance-runtime-check.mjs', 'Product launch governance 17-gate coverage, proposed-not-applicable, no-auto-launch, no-live-writes, and non-approval runtime checks passed.', 'launch governance must have executable runtime coverage']
];

const forbidden = [
  ['lib/product-launch-governance.ts', "status: 'approved'", 'launch gates must not default approved'],
  ['lib/product-launch-governance.ts', 'launchGateSatisfied: true', 'launch gates must not default satisfied'],
  ['lib/product-launch-governance.ts', 'automaticLaunchEnablementAllowed: true', 'automatic launch must remain disabled'],
  ['lib/product-launch-governance.ts', 'automaticLiveWriteEnablementAllowed: true', 'automatic live writes must remain disabled'],
  ['lib/product-launch-governance.ts', 'softwareMayApproveLegalLaunch: true', 'software must not approve legal launch'],
  ['lib/product-launch-governance.ts', 'softwareMayApproveSponsorScope: true', 'software must not approve sponsor scope'],
  ['lib/product-launch-governance.ts', 'softwareMayActAsReleaseApprover: true', 'software must not approve a release'],
  ['lib/product-launch-governance.ts', 'greenCiCountsAsLaunchApproval: true', 'green CI must not become launch approval'],
  ['lib/product-launch-governance.ts', 'launchApproved: true', 'launch must not self-approve'],
  ['lib/product-launch-governance.ts', 'liveFinancialActivityApproved: true', 'live financial activity must not self-approve'],
  ['app/api/prototype/product-launch-review/route.ts', 'await request.json()', 'launch review endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/product-launch-review/route.ts', 'persisted: true', 'launch review endpoint must not claim persistence'],
  ['app/api/prototype/product-launch-review/route.ts', 'productionWritesChanged: true', 'launch review endpoint must never enable production writes']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Product launch governance blocked-by-default, human-review, request, no-auto-launch, no-live-write, and non-approval safety checks passed.');
