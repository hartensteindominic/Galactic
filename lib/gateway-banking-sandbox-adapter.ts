import { createHmac, timingSafeEqual } from 'node:crypto';
import { BankingError } from './banking';
import type {
  BankingProviderAdapter,
  CanonicalBankingEvent,
  ProviderCustomer,
  ProviderDepositAccount,
  ProviderTransfer,
  ProviderWebhookEnvelope
} from './banking-provider-adapter';
import { requireProviderSandboxConfig } from './provider-sandbox';

const ALLOWED_EVENT_TYPES = new Set<CanonicalBankingEvent['type']>([
  'customer.kyc.updated',
  'account.opened',
  'ach.transfer.pending',
  'ach.transfer.posted',
  'ach.transfer.returned',
  'ach.transfer.failed'
]);

function text(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_PAYLOAD_INVALID', `${label} is missing from the sandbox gateway response.`);
  }
  return value.trim();
}

function integer(value: unknown, label: string) {
  if (!Number.isSafeInteger(value)) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_PAYLOAD_INVALID', `${label} is invalid in the sandbox gateway response.`);
  }
  return Number(value);
}

function object(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_PAYLOAD_INVALID', 'Sandbox gateway returned an invalid object.');
  }
  return value as Record<string, unknown>;
}

function requireIdempotencyKey(value: string) {
  const key = value.trim();
  if (key.length < 8 || key.length > 128) {
    throw new BankingError(400, 'IDEMPOTENCY_REQUIRED', 'Provider sandbox writes require an 8-128 character idempotency key.');
  }
  return key;
}

function safeHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function timestampMillis(value: string | undefined) {
  if (!value) return null;
  if (/^\d{10,13}$/.test(value)) {
    const numeric = Number(value);
    return value.length === 10 ? numeric * 1000 : numeric;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function gatewayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = requireProviderSandboxConfig();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${config.apiKey}`);
  headers.set('X-Galactic-Program-Id', config.programId);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${config.gatewayBaseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_ERROR', `Provider sandbox gateway returned ${response.status}.`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_RESPONSE_INVALID', 'Provider sandbox gateway did not return JSON.');
  }

  return response.json() as Promise<T>;
}

function normalizeCustomer(rawValue: unknown): ProviderCustomer {
  const raw = object(rawValue);
  const status = text(raw.kycStatus, 'kycStatus') as ProviderCustomer['kycStatus'];
  if (!['not_started', 'pending', 'approved', 'rejected', 'manual_review'].includes(status)) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_PAYLOAD_INVALID', 'Sandbox gateway returned an unsupported KYC status.');
  }
  return {
    id: text(raw.id, 'customer id'),
    environment: 'provider_sandbox',
    synthetic: false,
    kycStatus: status
  };
}

function normalizeAccount(rawValue: unknown): ProviderDepositAccount {
  const raw = object(rawValue);
  const type = text(raw.type, 'account type') as ProviderDepositAccount['type'];
  const status = text(raw.status, 'account status') as ProviderDepositAccount['status'];
  if (!['checking', 'savings'].includes(type) || !['pending', 'open', 'restricted', 'closed'].includes(status)) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_PAYLOAD_INVALID', 'Sandbox gateway returned an unsupported account state.');
  }
  return {
    id: text(raw.id, 'account id'),
    customerId: text(raw.customerId, 'account customer id'),
    environment: 'provider_sandbox',
    type,
    currency: 'USD',
    status,
    synthetic: false
  };
}

function normalizeTransfer(rawValue: unknown): ProviderTransfer {
  const raw = object(rawValue);
  const status = text(raw.status, 'transfer status') as ProviderTransfer['status'];
  const direction = text(raw.direction, 'transfer direction') as ProviderTransfer['direction'];
  if (!['pending', 'posted', 'returned', 'failed'].includes(status) || !['inbound', 'outbound'].includes(direction)) {
    throw new BankingError(502, 'SANDBOX_GATEWAY_PAYLOAD_INVALID', 'Sandbox gateway returned an unsupported transfer state.');
  }
  return {
    id: text(raw.id, 'transfer id'),
    customerId: text(raw.customerId, 'transfer customer id'),
    accountId: text(raw.accountId, 'transfer account id'),
    environment: 'provider_sandbox',
    rail: 'ach',
    direction,
    amountCents: integer(raw.amountCents, 'transfer amount'),
    status,
    synthetic: false
  };
}

export class GatewayBankingSandboxAdapter implements BankingProviderAdapter {
  readonly environment = 'provider_sandbox' as const;
  readonly capabilities = {
    sandboxCustomers: true,
    sandboxKyc: true,
    sandboxAccounts: true,
    sandboxAch: true,
    signedWebhooks: true,
    idempotency: true,
    cardIssuing: false,
    reconciliationData: true
  } as const;

  get providerName() {
    return requireProviderSandboxConfig().providerName;
  }

  async createCustomer(input: { externalUserId: string; idempotencyKey: string }) {
    const result = await gatewayRequest<unknown>('/v1/sandbox/customers', {
      method: 'POST',
      headers: { 'Idempotency-Key': requireIdempotencyKey(input.idempotencyKey) },
      body: JSON.stringify({ externalUserId: input.externalUserId })
    });
    return normalizeCustomer(result);
  }

  async getCustomer(customerId: string) {
    return normalizeCustomer(await gatewayRequest<unknown>(`/v1/sandbox/customers/${encodeURIComponent(customerId)}`));
  }

  async startKyc(input: {
    customerId: string;
    sandboxScenario: 'approve' | 'manual_review' | 'reject';
    idempotencyKey: string;
  }) {
    const result = await gatewayRequest<unknown>(`/v1/sandbox/customers/${encodeURIComponent(input.customerId)}/kyc`, {
      method: 'POST',
      headers: { 'Idempotency-Key': requireIdempotencyKey(input.idempotencyKey) },
      body: JSON.stringify({ sandboxScenario: input.sandboxScenario })
    });
    return normalizeCustomer(result);
  }

  async createDepositAccount(input: {
    customerId: string;
    type: 'checking' | 'savings';
    idempotencyKey: string;
  }) {
    const result = await gatewayRequest<unknown>('/v1/sandbox/accounts', {
      method: 'POST',
      headers: { 'Idempotency-Key': requireIdempotencyKey(input.idempotencyKey) },
      body: JSON.stringify({ customerId: input.customerId, type: input.type })
    });
    return normalizeAccount(result);
  }

  async createAchTransfer(input: {
    customerId: string;
    accountId: string;
    direction: 'inbound' | 'outbound';
    amountCents: number;
    idempotencyKey: string;
  }) {
    const result = await gatewayRequest<unknown>('/v1/sandbox/ach-transfers', {
      method: 'POST',
      headers: { 'Idempotency-Key': requireIdempotencyKey(input.idempotencyKey) },
      body: JSON.stringify({
        customerId: input.customerId,
        accountId: input.accountId,
        direction: input.direction,
        amountCents: input.amountCents
      })
    });
    return normalizeTransfer(result);
  }

  async verifyWebhook(envelope: ProviderWebhookEnvelope) {
    const config = requireProviderSandboxConfig();
    const timestamp = timestampMillis(envelope.timestamp);
    if (timestamp === null || Math.abs(Date.now() - timestamp) > 5 * 60_000) return false;

    const signature = envelope.signature.replace(/^sha256=/i, '').trim();
    const expected = createHmac('sha256', config.webhookSecret)
      .update(`${envelope.timestamp}.${envelope.rawBody}`)
      .digest('hex');
    return safeHexEqual(signature, expected);
  }

  async normalizeWebhook(envelope: ProviderWebhookEnvelope) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(envelope.rawBody);
    } catch {
      throw new BankingError(400, 'SANDBOX_WEBHOOK_JSON_INVALID', 'Provider sandbox webhook body is not valid JSON.');
    }

    const raw = object(parsed);
    const rawEventId = text(raw.id, 'webhook event id');
    const type = text(raw.type, 'webhook event type') as CanonicalBankingEvent['type'];
    if (!ALLOWED_EVENT_TYPES.has(type)) {
      throw new BankingError(400, 'SANDBOX_WEBHOOK_TYPE_UNSUPPORTED', 'Provider sandbox webhook event type is unsupported.');
    }

    const occurredAt = new Date(text(raw.occurredAt, 'webhook occurredAt'));
    if (!Number.isFinite(occurredAt.getTime())) {
      throw new BankingError(400, 'SANDBOX_WEBHOOK_TIMESTAMP_INVALID', 'Provider sandbox webhook occurredAt is invalid.');
    }

    const config = requireProviderSandboxConfig();
    const event: CanonicalBankingEvent = {
      eventId: `${config.providerName}:${rawEventId}`,
      provider: config.providerName,
      environment: 'provider_sandbox',
      type,
      resourceId: text(raw.resourceId, 'webhook resource id'),
      customerId: text(raw.customerId, 'webhook customer id'),
      occurredAt: occurredAt.toISOString(),
      rawProviderEventId: rawEventId
    };

    if (raw.accountId !== undefined) event.accountId = text(raw.accountId, 'webhook account id');
    if (raw.amountCents !== undefined) event.amountCents = integer(raw.amountCents, 'webhook amount');
    return event;
  }
}

export function getGatewayBankingSandboxAdapter() {
  return new GatewayBankingSandboxAdapter();
}
