export function aiGovernanceStatus() {
  return {
    automatedSupportAssistantEnabled: true,
    supportAssistantRuntime: 'deterministic-rules',
    thirdPartyLlmCustomerDataEnabled: false,
    regulatedAiDecisioningEnabled: false,
    creditDecisioningByAiEnabled: false,
    adverseActionReasoningByAiEnabled: false,
    amlSarDecisioningByAiEnabled: false,
    sanctionsDispositionByAiEnabled: false,
    fraudLiabilityDecisioningByAiEnabled: false,
    identityVerificationDecisioningByAiEnabled: false,
    personalizedInvestmentAdviceByAiEnabled: false,
    legalAdviceByAiEnabled: false,
    insuranceEligibilityClaimsByAiEnabled: false,
    humanEscalationRequiredForMaterialAccountJudgment: true,
    sensitiveDataInSupportChatProhibited: true,
    productionAiVendorDueDiligenceComplete: false,
    productionAiDataProcessingApprovalComplete: false,
    productionAiIndependentValidationComplete: false,
    productionAiIncidentPlaybookExercised: false,
    disclosure: 'Prototype AI posture: Orbit is automated support with deterministic rules. It does not make regulated or account-specific decisions, and the prototype does not send customer financial data to a third-party LLM. Any future AI expansion requires approved governance, privacy/security review, vendor diligence, human oversight, legal/compliance review, testing, monitoring, and incident procedures.'
  } as const;
}
