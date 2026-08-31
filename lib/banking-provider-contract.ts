import { BankingError } from './banking';

export type ProviderEnvironment = 'sandbox' | 'certification' | 'production';

export type ProviderCapabilities = {
  customers: boolean;
  depositAccounts: boolean;
  cards: boolean;
  ach: boolean;
  wires: boolean;
  cash: boolean;
  lending: boolean;
  productionWebhooks: boolean;
  providerStatements: boolean;
};

export type ProviderCustomer = {
  id: string;
  externalReference: string;
  status: 'pending' | 'active' | 'restricted' | 'closed';
};

export type ProviderAccount = {
  id: string;
  customerId: string;
  type: 'checking' | 'savings' | 'other';
  status: 'pending' | 'open' | 'restricted' | 'closed';
  currency: 'USD';
  availableBalanceCents?: number;
  ledgerBalanceCents?: number;
  last4?: string;
};

export type ProviderCard = {
  id: string;
  customerId: string;
  accountId?: string;
  status: 'pending' | 'active' | 'frozen' | 'closed';
  last4?: string;
  network?: string;
};

export type ProviderPaymentInstruction = {
  customerId: string;
  sourceAccountId: string;
  destinationReference: string;
  amountCents: number;
  currency: 'USD';
  memo?: string;
};

export type ProviderPayment = {
  id: string;
  providerReference: string;
  status: 'pending' | 'processing' | 'posted' | 'returned' | 'failed' | 'cancelled';
  amountCents: number;
  currency: 'USD';
};

export type ProviderRequestContext = {
  tenantKey: string;
  userId: string;
  idempotencyKey: string;
  correlationId: string;
};

export type ProviderWebhookAuthenticityEvidence = {
  rawBodyUsedForVerification: true;
  providerAuthenticityVerified: true;
  antiReplayVerified: true;
  providerEventIdentityVerified: true;
  verificationScheme: string;
  verifiedAt: string;
};

export type VerifiedProviderEvent = {
  provider: string;
  providerEventId: string;
  eventType: string;
  occurredAt?: string;
  resourceId?: string;
  rawPayloadDigest: string;
  authenticity: ProviderWebhookAuthenticityEvidence;
};

export type ProviderWebhookInput = {
  rawBody: Uint8Array;
  headers: Headers;
  receivedAt: string;
};

export type ProviderReconciliationItem = {
  providerReference: string;
  resourceType: 'account' | 'payment' | 'card' | 'customer' | 'other';
  status: string;
  amountCents?: number;
  currency?: string;
  effectiveAt?: string;
};

export interface BankingProviderAdapter {
  readonly providerName: string;
  readonly environment: ProviderEnvironment;

  capabilities(): ProviderCapabilities;

  getCustomer(customerId: string): Promise<ProviderCustomer>;
  listAccounts(customerId: string): Promise<ProviderAccount[]>;
  listCards(customerId: string): Promise<ProviderCard[]>;

  createPayment(
    instruction: ProviderPaymentInstruction,
    context: ProviderRequestContext
  ): Promise<ProviderPayment>;

  setCardFrozen(input: {
    customerId: string;
    cardId: string;
    frozen: boolean;
    context: ProviderRequestContext;
  }): Promise<ProviderCard>;

  verifyAndParseWebhook(input: ProviderWebhookInput): Promise<VerifiedProviderEvent>;

  listReconciliationItems(input: {
    from: string;
    to: string;
    cursor?: string;
  }): Promise<{ items: ProviderReconciliationItem[]; nextCursor?: string }>;
}

const NO_CAPABILITIES: ProviderCapabilities = {
  customers: false,
  depositAccounts: false,
  cards: false,
  ach: false,
  wires: false,
  cash: false,
  lending: false,
  productionWebhooks: false,
  providerStatements: false
};

function unavailable(action: string): never {
  throw new BankingError(
    503,
    'BANKING_PROVIDER_DISABLED',
    `Banking provider action ${action} is disabled until an approved provider adapter is configured.`
  );
}

/**
 * Safe default adapter.
 *
 * This intentionally implements every interface method by failing closed. The
 * application must never infer production banking capability merely because a
 * provider-neutral interface exists.
 */
export class DisabledBankingProvider implements BankingProviderAdapter {
  readonly providerName = 'disabled';
  readonly environment: ProviderEnvironment = 'sandbox';

  capabilities(): ProviderCapabilities {
    return { ...NO_CAPABILITIES };
  }

  async getCustomer(_customerId: string): Promise<ProviderCustomer> {
    return unavailable('getCustomer');
  }

  async listAccounts(_customerId: string): Promise<ProviderAccount[]> {
    return unavailable('listAccounts');
  }

  async listCards(_customerId: string): Promise<ProviderCard[]> {
    return unavailable('listCards');
  }

  async createPayment(
    _instruction: ProviderPaymentInstruction,
    _context: ProviderRequestContext
  ): Promise<ProviderPayment> {
    return unavailable('createPayment');
  }

  async setCardFrozen(_input: {
    customerId: string;
    cardId: string;
    frozen: boolean;
    context: ProviderRequestContext;
  }): Promise<ProviderCard> {
    return unavailable('setCardFrozen');
  }

  async verifyAndParseWebhook(_input: ProviderWebhookInput): Promise<VerifiedProviderEvent> {
    return unavailable('verifyAndParseWebhook');
  }

  async listReconciliationItems(_input: {
    from: string;
    to: string;
    cursor?: string;
  }): Promise<{ items: ProviderReconciliationItem[]; nextCursor?: string }> {
    return unavailable('listReconciliationItems');
  }
}

export function disabledBankingProvider(): BankingProviderAdapter {
  return new DisabledBankingProvider();
}
