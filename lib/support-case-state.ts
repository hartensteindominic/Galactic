export type SupportCaseKind =
  | 'complaint'
  | 'fraud-dispute'
  | 'identity'
  | 'credit'
  | 'aml-sanctions'
  | 'legal-regulatory'
  | 'privacy'
  | 'general';

export type SupportCaseState =
  | 'detected'
  | 'handoff_required'
  | 'human_acknowledged'
  | 'in_review'
  | 'resolved'
  | 'closed_no_action';

export type SupportCaseActor = 'automation' | 'authorized-human';

const MATERIAL_KINDS = new Set<SupportCaseKind>([
  'complaint',
  'fraud-dispute',
  'identity',
  'credit',
  'aml-sanctions',
  'legal-regulatory'
]);

const TRANSITIONS: Record<SupportCaseState, readonly SupportCaseState[]> = {
  detected: ['handoff_required'],
  handoff_required: ['human_acknowledged'],
  human_acknowledged: ['in_review', 'resolved', 'closed_no_action'],
  in_review: ['resolved', 'closed_no_action'],
  resolved: [],
  closed_no_action: []
};

export function isMaterialSupportCase(kind: SupportCaseKind) {
  return MATERIAL_KINDS.has(kind);
}

export function canTransitionSupportCase(
  from: SupportCaseState,
  to: SupportCaseState,
  actor: SupportCaseActor
) {
  if (!TRANSITIONS[from].includes(to)) return false;

  if (to === 'human_acknowledged' || to === 'in_review' || to === 'resolved' || to === 'closed_no_action') {
    return actor === 'authorized-human';
  }

  return true;
}

export function canAutomationCloseSupportCase() {
  return false as const;
}

export function supportCaseControlStatus() {
  return {
    explicitCaseStateModelImplemented: true,
    materialCasesRequireHumanHandoff: true,
    automationMayDetectAndRoute: true,
    automationMayAcknowledgeAsHuman: false,
    automationMayResolveCase: false,
    automationMayCloseCase: false,
    humanAcknowledgementRequiredBeforeReview: true,
    approvedProductionCaseSystemConnected: false,
    approvedProductionResponseDeadlinesConfigured: false,
    productionHumanHandoffExercised: false,
    disclosure: 'The prototype can identify that a support issue needs a human, but it does not operate a production complaint/dispute case-management system. Automated responses cannot acknowledge, resolve, or close a material case as if a human completed the required workflow.'
  } as const;
}
