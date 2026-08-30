export type BankingEnvironment = 'synthetic' | 'provider_sandbox' | 'production';

export type ProviderCustomer = {
  id: string;
  environment: BankingEnvironment;
  synthetic: boolean;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected' | 'manual_review';
};

export type ProviderDepositAccount = {
  id: string;
  customerId: string;
  environment: BankingEnvironment;
  type: 'checking' | 'savings';
  currency: 'USD';
  status: 'pending' | 'open' | 'restricted' | 'closed';
  synthetic: boolean;
};

export type ProviderTransfer = {
  id: string;
  customerId: string;
  accountId: string;
  environment: BankingEnvironment;
  rail: 'ach';
  direction: 'inbound' | 'outbound';
  amountCents: number;
  status: 'pending' | 'posted' | 'returned' | 'failed';
  synthetic: boolean;
};

export type CanonicalBankingEvent = {
  eventId: string;
  provider: string;
  environment: BankingEnvironment;
  type:
    | 'customer.kyc.updated'
    | 'account.opened'
    | 'ach.transfer.pending'
    | 'ach.transfer.posted'
    | 'ach.transfer.returned'
    | 'ach.transfer.failed';
  resourceId: string;
  customerId: string;
  accountId?: string;
  amountCents?: number;
  occurredAt: string;
  rawProviderEventId: string;
};

export type ProviderWebhookEnvelope = {
  rawBody: string;
  signature: string;
  timestamp?: string;
  eventId?: string;
};

export type ProviderAdapterCapabilities = {
  sandboxCustomers: boolean;
  sandboxKyc: boolean;
  sandboxAccounts: boolean;
  sandboxAch: boolean;
  signedWebhooks: boolean;
  idempotency: boolean;
  cardIssuing: boolean;
  reconciliationData: boolean;
};

/**
 * Provider-neutral boundary for an approved sponsor-bank/BaaS sandbox.
 *
 * Implementations belong in server-only modules and must never expose provider
 * secrets to client code. A production adapter must not be activated merely
 * because credentials exist; Galactic Trust's compliance/disclosure/live gates
 * remain separate and mandatory.
 */
export interface BankingProviderAdapter {
  readonly providerName: string;
  readonly environment: 'provider_sandbox' | 'production';
  readonly capabilities: ProviderAdapterCapabilities;

  createCustomer(input: { externalUserId: string }): Promise<ProviderCustomer>;
  getCustomer(customerId: string): Promise<ProviderCustomer>;
  startKyc(input: {
    customerId: string;
    sandboxScenario: 'approve' | 'manual_review' | 'reject';
  }): Promise<ProviderCustomer>;
  createDepositAccount(input: {
    customerId: string;
    type: 'checking' | 'savings';
  }): Promise<ProviderDepositAccount>;
  createAchTransfer(input: {
    customerId: string;
    accountId: string;
    direction: 'inbound' | 'outbound';
    amountCents: number;
    idempotencyKey: string;
  }): Promise<ProviderTransfer>;

  verifyWebhook(envelope: ProviderWebhookEnvelope): Promise<boolean>;
  normalizeWebhook(envelope: ProviderWebhookEnvelope): Promise<CanonicalBankingEvent>;
}

export const REQUIRED_SANDBOX_CAPABILITIES: Array<keyof ProviderAdapterCapabilities> = [
  'sandboxCustomers',
  'sandboxKyc',
  'sandboxAccounts',
  'sandboxAch',
  'signedWebhooks',
  'idempotency',
  'reconciliationData'
];

export function missingSandboxCapabilities(capabilities: ProviderAdapterCapabilities) {
  return REQUIRED_SANDBOX_CAPABILITIES.filter((key) => !capabilities[key]);
}
