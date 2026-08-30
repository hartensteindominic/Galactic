import { BankingError } from './banking';

export type PrototypeCustomerTerms = {
  tenantKey: string;
  version: string;
  status: 'prototype-only';
  effectiveAt: null;
  liveTermsApproved: false;
  accountFeeLabel: string;
  sandboxLinkFeeLabel: string;
  feeRateDisclosure: string;
  depositInsuranceDisclosure: string;
  transferDisclosure: string;
  fundingDisclosure: string;
  rewardsDisclosure: string;
  cashflowDisclosure: string;
  changingTermsDisclosure: string;
};

const PROTOTYPE_TERMS_VERSION = 'prototype-terms-v1';

export function getPrototypeCustomerTerms(tenantKey = 'galactic-trust'): PrototypeCustomerTerms {
  return {
    tenantKey,
    version: PROTOTYPE_TERMS_VERSION,
    status: 'prototype-only',
    effectiveAt: null,
    liveTermsApproved: false,
    accountFeeLabel: '$0 demo fee',
    sandboxLinkFeeLabel: '$0 prototype charge',
    feeRateDisclosure: 'The prototype does not publish live consumer fees, APYs, yields, deposit rates, or earnings terms. Any future changing financial term must come from an approved, versioned customer-terms source before it is shown to a customer.',
    depositInsuranceDisclosure: 'Prototype balances are not represented as insured deposits. Any future deposit-insurance statement must come from approved program language that identifies the actual insured depository institution and accurately describes the deposit relationship.',
    transferDisclosure: 'Prototype transfers move only synthetic ledger value. Future live timing, limits, reversibility, fees, and availability must come from the approved customer-terms source and authoritative provider state.',
    fundingDisclosure: 'Prototype funding methods are simulated or sandbox-only. Future live funding availability, timing, limits, fees, and eligibility must come from approved program terms.',
    rewardsDisclosure: 'Prototype rewards are product UX only. Future earning, redemption, eligibility, expiration, and merchant-offer rules must come from an approved versioned rewards/customer-terms source.',
    cashflowDisclosure: 'Safe-to-Spend is a simulation-only planning estimate. It is not a guarantee, authorization to spend, credit decision, or personalized financial advice.',
    changingTermsDisclosure: 'Fees, rates, APY/yield, limits, eligibility, insurance wording, partner identity, transfer timing, dispute deadlines, rewards rules, and other changing customer terms must not be invented or copied from stale application text.'
  };
}

export function customerTermsControlStatus() {
  return {
    controlledPrototypeTermsImplemented: true,
    prototypeTermsVersion: PROTOTYPE_TERMS_VERSION,
    versionedLiveTermsRequired: true,
    liveTermsAdapterImplemented: false,
    liveTermsPublishingEnabled: false,
    externalApprovalEvidenceVerified: false,
    approvedCustomerTermsSourceOfTruthReady: false,
    unsupportedLiveTermsFailClosed: true
  } as const;
}

export function requireApprovedLiveCustomerTerms(): never {
  throw new BankingError(
    503,
    'APPROVED_CUSTOMER_TERMS_UNAVAILABLE',
    'Live customer terms are unavailable until a versioned source has qualified approval and is connected to this application.'
  );
}
