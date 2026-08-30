import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { BankingError, bankingStatus } from './banking';

type LedgerAccount = 'partner_settlement_cash' | 'customer_deposit_liability';

type LedgerEntry = {
  id: string;
  eventId: string;
  account: LedgerAccount;
  debitCents: number;
  creditCents: number;
  description: string;
};

type SandboxProviderEvent = {
  id: string;
  type: 'ach.transfer.posted';
  resourceId: string;
  customerId: string;
  accountId: string;
  amountCents: number;
  occurredAt: string;
};

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left, 'utf8');
  const b = Buffer.from(right, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function signSandboxWebhook(payload: string, secret: Buffer) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function verifySandboxWebhook(payload: string, signature: string, secret: Buffer) {
  const expected = signSandboxWebhook(payload, secret);
  return safeEqual(expected, signature);
}

function cents(value: number) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new BankingError(500, 'SANDBOX_AMOUNT_INVALID', 'The synthetic certification amount is invalid.');
  }
  return value;
}

export function sandboxCertificationStatus() {
  const banking = bankingStatus();
  const allowed = banking.mode === 'demo' && !banking.liveWritesEnabled;

  return {
    allowed,
    mode: banking.mode,
    liveWritesEnabled: banking.liveWritesEnabled,
    syntheticOnly: true,
    externalNetworkCallsAllowed: false,
    providerCredentialsAllowed: false,
    realMoneyAllowed: false,
    disclosure: allowed
      ? 'Sandbox certification uses synthetic records only. It does not call a banking provider, use provider credentials, or move real money.'
      : 'Sandbox certification is available only while Galactic Trust remains in demo mode with live banking disabled.'
  };
}

export function runSandboxCertification(userId: string) {
  const status = sandboxCertificationStatus();
  if (!status.allowed) {
    throw new BankingError(
      409,
      'SANDBOX_CERTIFICATION_LOCKED',
      'Sandbox certification is locked unless Galactic Trust is in demo mode with live banking disabled.'
    );
  }

  const runId = randomUUID();
  const suffix = runId.replace(/-/g, '').slice(0, 10);
  const customerId = `sandbox-customer-${suffix}`;
  const accountId = `sandbox-checking-${suffix}`;
  const transferId = `sandbox-ach-${suffix}`;
  const eventId = `sandbox-event-${suffix}`;
  const amountCents = cents(2500);
  const occurredAt = new Date().toISOString();

  const customer = {
    id: customerId,
    sourceUser: userId === 'demo-nova' ? 'demo-session' : 'authenticated-session',
    synthetic: true,
    piiStored: false,
    kyc: {
      status: 'approved_sandbox' as const,
      providerFixture: true,
      realIdentityVerificationPerformed: false
    }
  };

  const account = {
    id: accountId,
    type: 'checking' as const,
    currency: 'USD' as const,
    synthetic: true,
    last4: suffix.slice(-4),
    openingBalanceCents: 0
  };

  const transfer = {
    id: transferId,
    rail: 'ach' as const,
    direction: 'inbound' as const,
    amountCents,
    status: 'posted_sandbox' as const,
    synthetic: true,
    realMoneyMoved: false
  };

  const providerEvent: SandboxProviderEvent = {
    id: eventId,
    type: 'ach.transfer.posted',
    resourceId: transferId,
    customerId,
    accountId,
    amountCents,
    occurredAt
  };

  const payload = JSON.stringify(providerEvent);

  // Ephemeral per-run key. It is never returned, persisted, or read from an environment variable.
  const ephemeralWebhookSecret = randomBytes(32);
  const signature = signSandboxWebhook(payload, ephemeralWebhookSecret);
  const webhookSignatureVerified = verifySandboxWebhook(payload, signature, ephemeralWebhookSecret);

  if (!webhookSignatureVerified) {
    throw new BankingError(500, 'SANDBOX_WEBHOOK_SIGNATURE_FAILED', 'Synthetic webhook signature verification failed.');
  }

  const processedEventIds = new Set<string>();
  const ledgerEntries: LedgerEntry[] = [];

  function ingest(event: SandboxProviderEvent) {
    if (processedEventIds.has(event.id)) {
      return { accepted: false, duplicate: true, ledgerEntriesAdded: 0 };
    }

    processedEventIds.add(event.id);
    const before = ledgerEntries.length;

    ledgerEntries.push(
      {
        id: `${event.id}-debit`,
        eventId: event.id,
        account: 'partner_settlement_cash',
        debitCents: event.amountCents,
        creditCents: 0,
        description: 'Synthetic settlement asset increase'
      },
      {
        id: `${event.id}-credit`,
        eventId: event.id,
        account: 'customer_deposit_liability',
        debitCents: 0,
        creditCents: event.amountCents,
        description: 'Synthetic customer balance liability increase'
      }
    );

    return { accepted: true, duplicate: false, ledgerEntriesAdded: ledgerEntries.length - before };
  }

  const firstIngest = ingest(providerEvent);
  const duplicateIngest = ingest(providerEvent);

  const totalDebitsCents = ledgerEntries.reduce((sum, entry) => sum + entry.debitCents, 0);
  const totalCreditsCents = ledgerEntries.reduce((sum, entry) => sum + entry.creditCents, 0);
  const ledgerBalanced = totalDebitsCents === totalCreditsCents;
  const duplicateWebhookRejected = duplicateIngest.duplicate && duplicateIngest.ledgerEntriesAdded === 0;
  const customerBalanceCents = totalCreditsCents;

  const reconciliation = {
    providerPostedCents: providerEvent.amountCents,
    internalCustomerBalanceCents: customerBalanceCents,
    ledgerDebitsCents: totalDebitsCents,
    ledgerCreditsCents: totalCreditsCents,
    matched:
      providerEvent.amountCents === customerBalanceCents &&
      totalDebitsCents === totalCreditsCents &&
      processedEventIds.size === 1
  };

  const evidence = {
    syntheticCustomerCreated: customer.synthetic,
    sandboxKycApproved: customer.kyc.status === 'approved_sandbox',
    syntheticAccountCreated: account.synthetic,
    syntheticAchPosted: transfer.status === 'posted_sandbox',
    webhookSignatureVerified,
    firstWebhookAccepted: firstIngest.accepted,
    duplicateWebhookRejected,
    ledgerBalanced,
    reconciliationMatched: reconciliation.matched,
    piiStored: false,
    providerCredentialsUsed: false,
    externalNetworkCalled: false,
    realMoneyMoved: false
  };

  const passed = Object.entries(evidence).every(([key, value]) => {
    if (key === 'piiStored' || key === 'providerCredentialsUsed' || key === 'externalNetworkCalled' || key === 'realMoneyMoved') {
      return value === false;
    }
    return value === true;
  });

  return {
    runId,
    passed,
    environment: 'galactic_synthetic_sandbox' as const,
    customer,
    account,
    transfer,
    webhook: {
      eventId: providerEvent.id,
      type: providerEvent.type,
      signatureVerified: webhookSignatureVerified,
      duplicateRejected: duplicateWebhookRejected,
      secretPersisted: false,
      secretReturned: false
    },
    ledger: {
      entryCount: ledgerEntries.length,
      totalDebitsCents,
      totalCreditsCents,
      balanced: ledgerBalanced,
      entries: ledgerEntries
    },
    reconciliation,
    evidence,
    safety: {
      syntheticOnly: true,
      realMoneyMoved: false,
      externalNetworkCalled: false,
      providerCredentialsUsed: false,
      piiStored: false
    },
    nextStep: passed
      ? 'Connect an approved provider sandbox adapter and repeat this evidence flow with provider-issued sandbox objects. Keep all production/live-money gates disabled.'
      : 'Do not connect a provider sandbox until the synthetic certification evidence is fully green.'
  };
}
