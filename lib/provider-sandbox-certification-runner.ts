import { randomUUID } from 'node:crypto';
import { BankingError } from './banking';
import { getProviderSandboxBankingStore } from './banking-sandbox-database';
import { missingSandboxCapabilities } from './banking-provider-adapter';
import type { BankingPersistenceOperations } from './banking-persistence-contract';
import { getGatewayBankingSandboxAdapter } from './gateway-banking-sandbox-adapter';

async function audit(
  tx: BankingPersistenceOperations,
  input: {
    operatorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata: Record<string, string | number | boolean | null>;
  }
) {
  await tx.appendAuditEvent({
    id: randomUUID(),
    actorType: 'admin',
    actorId: input.operatorId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    environment: 'provider_sandbox',
    occurredAt: new Date().toISOString(),
    metadata: input.metadata
  });
}

export async function runProviderSandboxCertification(operatorId: string) {
  const adapter = getGatewayBankingSandboxAdapter();
  const missing = missingSandboxCapabilities(adapter.capabilities);
  if (missing.length) {
    throw new BankingError(
      503,
      'SANDBOX_CAPABILITIES_MISSING',
      `Provider sandbox adapter is missing required capabilities: ${missing.join(', ')}.`
    );
  }

  const store = getProviderSandboxBankingStore();
  const runId = randomUUID();
  const customerResourceId = `cert-${runId}-customer`;
  const accountResourceId = `cert-${runId}-account`;
  const transferResourceId = `cert-${runId}-transfer`;
  const externalUserId = `galactic-sandbox-cert-${runId}`;
  const amountCents = 2500;

  const customer = await adapter.createCustomer({
    externalUserId,
    idempotencyKey: `cert-${runId}-customer-create`
  });

  await store.transaction(async (tx) => {
    await tx.putProviderResourceLink({
      galacticResourceType: 'customer',
      galacticResourceId: customerResourceId,
      provider: adapter.providerName,
      environment: 'provider_sandbox',
      providerResourceId: customer.id,
      createdAt: new Date().toISOString()
    });
    await audit(tx, {
      operatorId,
      action: 'sandbox_cert_customer_created',
      resourceType: 'customer',
      resourceId: customerResourceId,
      metadata: { runId, provider: adapter.providerName, kycStatus: customer.kycStatus }
    });
  });

  const kycCustomer = await adapter.startKyc({
    customerId: customer.id,
    sandboxScenario: 'approve',
    idempotencyKey: `cert-${runId}-kyc-approve`
  });

  if (kycCustomer.kycStatus !== 'approved') {
    throw new BankingError(
      409,
      'SANDBOX_KYC_NOT_APPROVED',
      `Provider sandbox test KYC did not reach approved status (received ${kycCustomer.kycStatus}).`
    );
  }

  await store.transaction((tx) => audit(tx, {
    operatorId,
    action: 'sandbox_cert_kyc_approved',
    resourceType: 'customer',
    resourceId: customerResourceId,
    metadata: { runId, provider: adapter.providerName, kycStatus: kycCustomer.kycStatus }
  }));

  const account = await adapter.createDepositAccount({
    customerId: customer.id,
    type: 'checking',
    idempotencyKey: `cert-${runId}-account-create`
  });

  if (account.status !== 'open') {
    throw new BankingError(
      409,
      'SANDBOX_ACCOUNT_NOT_OPEN',
      `Provider sandbox checking account did not reach open status (received ${account.status}).`
    );
  }

  await store.transaction(async (tx) => {
    await tx.putProviderResourceLink({
      galacticResourceType: 'account',
      galacticResourceId: accountResourceId,
      provider: adapter.providerName,
      environment: 'provider_sandbox',
      providerResourceId: account.id,
      createdAt: new Date().toISOString()
    });
    await audit(tx, {
      operatorId,
      action: 'sandbox_cert_account_opened',
      resourceType: 'account',
      resourceId: accountResourceId,
      metadata: { runId, provider: adapter.providerName, accountStatus: account.status }
    });
  });

  const transfer = await adapter.createAchTransfer({
    customerId: customer.id,
    accountId: account.id,
    direction: 'inbound',
    amountCents,
    idempotencyKey: `cert-${runId}-ach-create`
  });

  await store.transaction(async (tx) => {
    await tx.putProviderResourceLink({
      galacticResourceType: 'transfer',
      galacticResourceId: transferResourceId,
      provider: adapter.providerName,
      environment: 'provider_sandbox',
      providerResourceId: transfer.id,
      createdAt: new Date().toISOString()
    });
    await audit(tx, {
      operatorId,
      action: 'sandbox_cert_ach_created',
      resourceType: 'transfer',
      resourceId: transferResourceId,
      metadata: {
        runId,
        provider: adapter.providerName,
        amountCents,
        transferStatus: transfer.status,
        realMoneyMoved: false
      }
    });
  });

  return {
    runId,
    environment: 'provider_sandbox' as const,
    provider: adapter.providerName,
    customer: {
      galacticResourceId: customerResourceId,
      status: 'created' as const,
      kycStatus: kycCustomer.kycStatus
    },
    account: {
      galacticResourceId: accountResourceId,
      type: account.type,
      status: account.status
    },
    transfer: {
      galacticResourceId: transferResourceId,
      rail: transfer.rail,
      direction: transfer.direction,
      amountCents: transfer.amountCents,
      status: transfer.status
    },
    durableMappingsRecorded: true,
    awaitingSignedWebhook: transfer.status !== 'failed',
    realMoneyMoved: false,
    productionLiveWritesEnabled: false,
    nextStep: 'Wait for the authentic signed provider-sandbox webhook. The webhook processor will dedupe the event, post the journal, reconcile it, and record audit evidence.'
  };
}
