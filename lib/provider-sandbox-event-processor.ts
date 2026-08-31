import { randomUUID } from 'node:crypto';
import { BankingError } from './banking';
import type { CanonicalBankingEvent } from './banking-provider-adapter';
import type {
  BankingPersistenceOperations,
  BankingPersistenceStore,
  EventInboxRecord,
  ReconciliationRecord
} from './banking-persistence-contract';
import {
  assertBalancedJournal,
  createInboundAchPostedJournal,
  createInboundAchReturnedJournal,
  reconcileJournalAmount,
  type LedgerJournal
} from './financial-ledger';

export const PROVIDER_EVENT_MAX_ATTEMPTS = 5;
export const PROVIDER_EVENT_LEASE_MS = 2 * 60_000;

export type ProviderSandboxProcessingResult = {
  eventId: string;
  provider: string;
  type: CanonicalBankingEvent['type'];
  duplicate: boolean;
  processed: boolean;
  processingState: 'processed' | 'duplicate_processed' | 'claimed_elsewhere' | 'retry_scheduled';
  ledgerJournalId: string | null;
  reconciliationId: string | null;
};

function requireText(value: string | undefined, code: string, message: string) {
  if (!value?.trim()) throw new BankingError(400, code, message);
  return value.trim();
}

function requirePositiveCents(value: number | undefined) {
  if (!Number.isSafeInteger(value) || !value || value <= 0) {
    throw new BankingError(400, 'PROVIDER_EVENT_AMOUNT_INVALID', 'Provider event amount must be a positive integer number of cents.');
  }
  return value;
}

function requireIsoTimestamp(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new BankingError(400, 'PROVIDER_EVENT_TIMESTAMP_INVALID', 'Provider event timestamp is invalid.');
  }
  return new Date(parsed).toISOString();
}

function validateProviderSandboxEvent(event: CanonicalBankingEvent) {
  if (event.environment !== 'provider_sandbox') {
    throw new BankingError(409, 'PROVIDER_EVENT_ENVIRONMENT_INVALID', 'This processor accepts provider-sandbox events only.');
  }

  requireText(event.eventId, 'PROVIDER_EVENT_ID_REQUIRED', 'Provider event ID is required.');
  requireText(event.rawProviderEventId, 'PROVIDER_RAW_EVENT_ID_REQUIRED', 'Raw provider event ID is required.');
  requireText(event.provider, 'PROVIDER_NAME_REQUIRED', 'Provider name is required.');
  requireText(event.resourceId, 'PROVIDER_RESOURCE_REQUIRED', 'Provider event resource ID is required.');
  requireText(event.customerId, 'PROVIDER_CUSTOMER_REQUIRED', 'Provider event customer ID is required.');
  requireIsoTimestamp(event.occurredAt);

  if (event.amountCents !== undefined && (!Number.isSafeInteger(event.amountCents) || event.amountCents < 0)) {
    throw new BankingError(400, 'PROVIDER_EVENT_AMOUNT_INVALID', 'Provider event amount is invalid.');
  }
}

function inboxRecord(event: CanonicalBankingEvent): EventInboxRecord {
  return {
    eventId: event.eventId,
    provider: event.provider,
    environment: 'provider_sandbox',
    rawProviderEventId: event.rawProviderEventId,
    canonicalEvent: event,
    receivedAt: new Date().toISOString(),
    processedAt: null,
    status: 'received',
    processingToken: null,
    processingStartedAt: null,
    attemptCount: 0,
    nextAttemptAt: null
  };
}

async function appendAudit(
  tx: BankingPersistenceOperations,
  event: CanonicalBankingEvent,
  action: string,
  metadata: Record<string, string | number | boolean | null>
) {
  await tx.appendAuditEvent({
    id: randomUUID(),
    actorType: 'provider',
    actorId: event.provider,
    action,
    resourceType: event.type,
    resourceId: event.resourceId,
    environment: 'provider_sandbox',
    occurredAt: new Date().toISOString(),
    metadata
  });
}

function reconciliationRecord(input: {
  event: CanonicalBankingEvent;
  journal: LedgerJournal;
  amountCents: number;
}): ReconciliationRecord {
  const journalSummary = assertBalancedJournal(input.journal);
  const snapshot = reconcileJournalAmount({
    providerAmountCents: input.amountCents,
    internalAmountCents: journalSummary.creditsCents,
    journal: input.journal,
    eventCount: 1
  });

  return {
    id: `reconciliation-${input.event.eventId}`,
    provider: input.event.provider,
    environment: 'provider_sandbox',
    scope: 'transfer_event',
    resourceId: input.event.resourceId,
    snapshot,
    status: snapshot.matched ? 'matched' : 'discrepancy',
    createdAt: new Date().toISOString(),
    resolvedAt: null
  };
}

function retryAtForAttempt(attemptCount: number) {
  if (attemptCount >= PROVIDER_EVENT_MAX_ATTEMPTS) return null;
  const delayMs = Math.min(30 * 60_000, 60_000 * (2 ** Math.max(0, attemptCount - 1)));
  return new Date(Date.now() + delayMs).toISOString();
}

function claimTimes() {
  const now = Date.now();
  return {
    claimedAt: new Date(now).toISOString(),
    staleBefore: new Date(now - PROVIDER_EVENT_LEASE_MS).toISOString()
  };
}

async function processLedgerEvent(
  tx: BankingPersistenceOperations,
  event: CanonicalBankingEvent
): Promise<{ journalId: string; reconciliationId: string }> {
  const amountCents = requirePositiveCents(event.amountCents);
  requireText(event.accountId, 'PROVIDER_ACCOUNT_REQUIRED', 'ACH provider events require an account ID.');

  let journal: LedgerJournal;

  if (event.type === 'ach.transfer.posted') {
    journal = createInboundAchPostedJournal({
      journalId: `journal-${event.eventId}`,
      eventId: event.eventId,
      amountCents,
      createdAt: event.occurredAt
    });
  } else if (event.type === 'ach.transfer.returned') {
    const priorPosted = await tx.findProcessedEventByResource({
      provider: event.provider,
      environment: 'provider_sandbox',
      type: 'ach.transfer.posted',
      resourceId: event.resourceId
    });

    if (!priorPosted) {
      throw new BankingError(409, 'ACH_RETURN_WITHOUT_POSTED_EVENT', 'Returned ACH cannot be journaled without a prior processed posted event for the same transfer.');
    }

    if (priorPosted.canonicalEvent.amountCents !== amountCents) {
      throw new BankingError(409, 'ACH_RETURN_AMOUNT_MISMATCH', 'Returned ACH amount does not match the prior posted transfer amount.');
    }

    journal = createInboundAchReturnedJournal({
      journalId: `journal-${event.eventId}`,
      eventId: event.eventId,
      amountCents,
      createdAt: event.occurredAt
    });
  } else {
    throw new BankingError(500, 'LEDGER_EVENT_UNSUPPORTED', 'Provider event does not have a supported ledger journal rule.');
  }

  const journalWrite = await tx.appendJournalIfAbsent({ environment: 'provider_sandbox', journal });
  const reconciliation = reconciliationRecord({ event, journal: journalWrite.journal, amountCents });
  await tx.saveReconciliation(reconciliation);

  await appendAudit(tx, event, 'provider_event_ledger_posted', {
    journalId: journalWrite.journal.id,
    reconciliationId: reconciliation.id,
    amountCents,
    journalInserted: journalWrite.inserted,
    matched: reconciliation.snapshot.matched
  });

  return { journalId: journalWrite.journal.id, reconciliationId: reconciliation.id };
}

async function processClaimedEvent(
  tx: BankingPersistenceOperations,
  record: EventInboxRecord
): Promise<{ ledgerJournalId: string | null; reconciliationId: string | null }> {
  if (record.status !== 'processing' || !record.processingToken) {
    throw new BankingError(409, 'EVENT_PROCESSING_LEASE_REQUIRED', 'Provider event must hold a processing lease before it can be processed.');
  }

  const event = record.canonicalEvent;
  let ledgerJournalId: string | null = null;
  let reconciliationId: string | null = null;

  switch (event.type) {
    case 'ach.transfer.posted':
    case 'ach.transfer.returned': {
      const financial = await processLedgerEvent(tx, event);
      ledgerJournalId = financial.journalId;
      reconciliationId = financial.reconciliationId;
      break;
    }
    case 'customer.kyc.updated':
    case 'account.opened':
    case 'ach.transfer.pending':
    case 'ach.transfer.failed':
      await appendAudit(tx, event, 'provider_event_state_only', {
        eventType: event.type,
        amountCents: event.amountCents ?? null
      });
      break;
    default:
      throw new BankingError(400, 'PROVIDER_EVENT_TYPE_UNSUPPORTED', 'Provider event type is not supported.');
  }

  await tx.markEventProcessed({
    eventId: record.eventId,
    processingToken: record.processingToken,
    processedAt: new Date().toISOString()
  });

  await appendAudit(tx, event, 'provider_event_processed', {
    ledgerJournalId,
    reconciliationId,
    attemptCount: record.attemptCount
  });

  return { ledgerJournalId, reconciliationId };
}

async function recordProcessingFailure(store: BankingPersistenceStore, record: EventInboxRecord, error: unknown) {
  if (!record.processingToken) return;
  const failureCode = error instanceof BankingError ? error.code : 'PROVIDER_EVENT_PROCESSING_FAILED';
  const nextAttemptAt = retryAtForAttempt(record.attemptCount);

  try {
    await store.transaction(async (tx) => {
      await tx.markEventFailed({
        eventId: record.eventId,
        processingToken: record.processingToken as string,
        failureCode,
        processedAt: new Date().toISOString(),
        nextAttemptAt
      });
      await appendAudit(tx, record.canonicalEvent, 'provider_event_failed', {
        failureCode,
        attemptCount: record.attemptCount,
        retryScheduled: nextAttemptAt !== null,
        nextAttemptAt
      });
    });
  } catch {
    // Preserve the original failure. A stale processing lease can be reclaimed
    // after PROVIDER_EVENT_LEASE_MS even if failure recording also fails.
  }
}

export async function processClaimedProviderSandboxEvent(
  store: BankingPersistenceStore,
  claimed: EventInboxRecord
): Promise<ProviderSandboxProcessingResult> {
  try {
    const processed = await store.transaction((tx) => processClaimedEvent(tx, claimed));
    return {
      eventId: claimed.eventId,
      provider: claimed.provider,
      type: claimed.canonicalEvent.type,
      duplicate: claimed.attemptCount > 1,
      processed: true,
      processingState: 'processed',
      ledgerJournalId: processed.ledgerJournalId,
      reconciliationId: processed.reconciliationId
    };
  } catch (error) {
    await recordProcessingFailure(store, claimed, error);
    throw error;
  }
}

export async function captureAndProcessProviderSandboxEvent(
  store: BankingPersistenceStore,
  event: CanonicalBankingEvent
): Promise<ProviderSandboxProcessingResult> {
  validateProviderSandboxEvent(event);

  const captured = await store.transaction(async (tx) => {
    const result = await tx.putEventIfAbsent(inboxRecord(event));
    if (result.inserted) {
      await appendAudit(tx, result.record.canonicalEvent, 'provider_event_received', {
        rawProviderEventId: result.record.rawProviderEventId
      });
    }
    return result;
  });

  if (!captured.inserted && captured.record.status === 'processed') {
    return {
      eventId: captured.record.eventId,
      provider: captured.record.provider,
      type: captured.record.canonicalEvent.type,
      duplicate: true,
      processed: true,
      processingState: 'duplicate_processed',
      ledgerJournalId: null,
      reconciliationId: null
    };
  }

  const claimToken = randomUUID();
  const times = claimTimes();
  const claimed = await store.transaction((tx) => tx.claimEventForProcessing({
    eventId: captured.record.eventId,
    claimToken,
    claimedAt: times.claimedAt,
    staleBefore: times.staleBefore,
    maxAttempts: PROVIDER_EVENT_MAX_ATTEMPTS
  }));

  if (!claimed) {
    const current = await store.getEvent(captured.record.eventId);
    return {
      eventId: captured.record.eventId,
      provider: captured.record.provider,
      type: captured.record.canonicalEvent.type,
      duplicate: !captured.inserted,
      processed: current?.status === 'processed',
      processingState: current?.status === 'failed' ? 'retry_scheduled' : (current?.status === 'processed' ? 'duplicate_processed' : 'claimed_elsewhere'),
      ledgerJournalId: null,
      reconciliationId: null
    };
  }

  return processClaimedProviderSandboxEvent(store, claimed);
}
