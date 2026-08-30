import type { CanonicalBankingEvent } from './banking-provider-adapter';
import type { LedgerJournal, ReconciliationSnapshot } from './financial-ledger';

export type DurableBankingEnvironment = 'provider_sandbox' | 'production';
export type BankingEventStatus = 'received' | 'processing' | 'processed' | 'failed';

export type EventInboxRecord = {
  eventId: string;
  provider: string;
  environment: DurableBankingEnvironment;
  rawProviderEventId: string;
  canonicalEvent: CanonicalBankingEvent;
  receivedAt: string;
  processedAt: string | null;
  status: BankingEventStatus;
  failureCode?: string;
  processingToken: string | null;
  processingStartedAt: string | null;
  attemptCount: number;
  nextAttemptAt: string | null;
};

export type ProviderResourceLink = {
  galacticResourceType: 'customer' | 'account' | 'transfer' | 'card';
  galacticResourceId: string;
  provider: string;
  environment: DurableBankingEnvironment;
  providerResourceId: string;
  createdAt: string;
};

export type ReconciliationRecord = {
  id: string;
  provider: string;
  environment: DurableBankingEnvironment;
  scope: 'transfer_event' | 'account_balance' | 'daily_program';
  resourceId: string;
  snapshot: ReconciliationSnapshot;
  status: 'matched' | 'discrepancy';
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote?: string;
};

export type BankingAuditEvent = {
  id: string;
  actorType: 'system' | 'customer' | 'admin' | 'provider';
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  environment: DurableBankingEnvironment;
  occurredAt: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type JournalWrite = {
  environment: DurableBankingEnvironment;
  journal: LedgerJournal;
};

export type EventClaimInput = {
  claimToken: string;
  claimedAt: string;
  staleBefore: string;
  maxAttempts: number;
};

export type BankingOperationsSnapshot = {
  environment: DurableBankingEnvironment;
  asOf: string;
  events: {
    received: number;
    processing: number;
    staleProcessing: number;
    retryableFailed: number;
    terminalFailed: number;
    processed: number;
  };
  reconciliations: {
    openDiscrepancies: number;
  };
};

/**
 * Database-backed operations used inside and outside a transaction.
 *
 * Implementations must preserve uniqueness, lease ownership, and append-only
 * semantics at the database layer, not only in application memory.
 */
export interface BankingPersistenceOperations {
  /** Atomically insert one provider event if it has never been seen. */
  putEventIfAbsent(record: EventInboxRecord): Promise<{ inserted: boolean; record: EventInboxRecord }>;

  getEvent(eventId: string): Promise<EventInboxRecord | null>;

  findProcessedEventByResource(input: {
    provider: string;
    environment: DurableBankingEnvironment;
    type: CanonicalBankingEvent['type'];
    resourceId: string;
  }): Promise<EventInboxRecord | null>;

  claimEventForProcessing(input: EventClaimInput & {
    eventId: string;
  }): Promise<EventInboxRecord | null>;

  claimNextRecoverableEvent(input: EventClaimInput & {
    environment: DurableBankingEnvironment;
  }): Promise<EventInboxRecord | null>;

  markEventProcessed(input: {
    eventId: string;
    processingToken: string;
    processedAt: string;
  }): Promise<void>;

  markEventFailed(input: {
    eventId: string;
    processingToken: string;
    failureCode: string;
    processedAt: string;
    nextAttemptAt: string | null;
  }): Promise<void>;

  appendJournalIfAbsent(input: JournalWrite): Promise<{ inserted: boolean; journal: LedgerJournal }>;

  putProviderResourceLink(link: ProviderResourceLink): Promise<void>;
  getProviderResourceLink(input: {
    provider: string;
    environment: DurableBankingEnvironment;
    galacticResourceType: ProviderResourceLink['galacticResourceType'];
    galacticResourceId: string;
  }): Promise<ProviderResourceLink | null>;

  saveReconciliation(record: ReconciliationRecord): Promise<void>;
  resolveReconciliation(input: {
    id: string;
    resolvedAt: string;
    resolutionNote: string;
  }): Promise<void>;

  appendAuditEvent(event: BankingAuditEvent): Promise<void>;

  getOperationsSnapshot(input: {
    environment: DurableBankingEnvironment;
    staleBefore: string;
    maxAttempts: number;
  }): Promise<BankingOperationsSnapshot>;
}

export interface BankingPersistenceStore extends BankingPersistenceOperations {
  transaction<T>(work: (tx: BankingPersistenceOperations) => Promise<T>): Promise<T>;
}

export const PROVIDER_SANDBOX_DURABILITY_REQUIREMENTS = [
  'atomic_event_dedupe',
  'leased_event_claims',
  'skip_locked_concurrent_recovery',
  'stale_claim_recovery',
  'bounded_retry_attempts',
  'operational_queue_visibility',
  'open_reconciliation_visibility',
  'append_only_balanced_journal',
  'unique_event_to_journal_mapping',
  'provider_resource_mapping',
  'reconciliation_history',
  'audit_history',
  'transactional_processing',
  'prior_event_validation_for_returns',
  'failed_event_recovery_path',
  'backup_and_recovery_plan'
] as const;
